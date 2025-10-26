import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEY = 'quranHub_localBookmarks';

const saveToLocalStorage = (bookmarks) => {
  if(!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
  } else {
    const existingBookmarks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const mergedBookmarks = [...existingBookmarks, ...bookmarks];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedBookmarks));
  }
};

const getFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading from localStorage:', err);
    return [];
  }
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false);
  const [serverReadFailed, setServerReadFailed] = useState(false);

  // Function to migrate local bookmarks to Firebase
  const migrateLocalBookmarksToFirebase = async () => {
    const localBookmarks = getFromLocalStorage();
    if (localBookmarks.length === 0) return;

    setLoading(true);
    setError('');

    try {
      // First, get all user's bookmarks in one query to minimize reads
      const q = query(
        collection(firestore, 'bookmarks'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      // Create a Set of existing bookmark timestamps for quick lookup
      const existingTimestamps = new Set(
        snapshot.docs.map(doc => doc.data().bookmarkDate?.toDate?.()?.toISOString())
      );

      const batch = writeBatch(firestore);
      const bookmarksCol = collection(firestore, 'bookmarks');
      let migratedCount = 0;
      let duplicateCount = 0;

      for (const bookmark of localBookmarks) {
        // Only consider it a duplicate if the exact timestamp matches
        const bookmarkTimestamp = new Date(bookmark.bookmarkDate).toISOString();
        
        if (!existingTimestamps.has(bookmarkTimestamp)) {
          const newBookmarkRef = doc(bookmarksCol);
          batch.set(newBookmarkRef, {
            ...bookmark,
            userId: auth.currentUser.uid,
            bookmarkDate: Timestamp.fromDate(new Date(bookmark.bookmarkDate))
          });
          migratedCount++;
        } else {
          duplicateCount++;
        }
      }

      if (migratedCount > 0) {
        await batch.commit();
      }

      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage after handling all bookmarks
      
      if (migratedCount > 0 && duplicateCount > 0) {
        setError(`تم نقل ${migratedCount} علامة مرجعية إلى حسابك. تم تخطي ${duplicateCount} علامات مكررة`);
      } else if (migratedCount > 0) {
        setError('تم نقل العلامات المرجعية المحلية إلى حسابك بنجاح');
      } else if (duplicateCount > 0) {
        setError('جميع العلامات المرجعية المحلية موجودة بالفعل في حسابك');
      }

    } catch (err) {
      console.error('Error migrating bookmarks:', err);
      setError('فشل في نقل العلامات المرجعية المحلية');
      setIsUsingLocalStorage(true);
      setServerReadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // normalize bookmark date to ISO string for comparison/deduping
  const normalizeBookmarkISO = (b) => {
    if (!b) return null;
    if (typeof b.bookmarkDate === 'string') return new Date(b.bookmarkDate).toISOString();
    if (b.bookmarkDate?.toDate) return b.bookmarkDate.toDate().toISOString();
    if (b.bookmarkDate instanceof Date) return b.bookmarkDate.toISOString();
    return null;
  };

  const mergeAndDedupBookmarks = (cloudList = [], localList = []) => {
    // Use timestamp ISO as primary dedupe key; fall back to surah+ayah if missing
    const map = new Map();

    const add = (b, source) => {
      const iso = normalizeBookmarkISO(b) || `${b.surahNumber}-${b.ayahNumber}-${b.bookmarkType}`;
      if (!map.has(iso)) {
        // mark which source it came from for UI (local-only)
        map.set(iso, { ...b, _localOnly: source === 'local' });
      } else {
        // if existing is local-only but we now have cloud, prefer cloud (not local-only)
        const existing = map.get(iso);
        if (existing._localOnly && source === 'cloud') {
          map.set(iso, { ...b, _localOnly: false });
        }
      }
    };

    cloudList.forEach(b => add(b, 'cloud'));
    localList.forEach(b => add(b, 'local'));

    return Array.from(map.values());
  };

  // Try to read cloud bookmarks once (non-listener) - useful for retries
  const readCloudOnce = async () => {
    if (!auth.currentUser) return [];
    const q = query(
      collection(firestore, 'bookmarks'),
      where('userId', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const readCloudWithRetry = async (maxAttempts = 3, baseDelay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        const cloud = await readCloudOnce();
        // success
        setServerReadFailed(false);
        setIsUsingLocalStorage(false);
        return cloud;
      } catch (err) {
        attempt++;
        console.warn(`Cloud read attempt ${attempt} failed:`, err?.message || err);
        if (attempt >= maxAttempts) {
          setServerReadFailed(true);
          setIsUsingLocalStorage(true);
          throw err;
        }
        // exponential backoff
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      }
    }
    return [];
  };

  // Public retry function to allow UI to trigger a re-fetch/reconnect
  const retryLoadBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const cloud = await readCloudWithRetry(4, 500);
      const localBookmarks = getFromLocalStorage();
      const merged = mergeAndDedupBookmarks(cloud, localBookmarks);
      setBookmarks(merged);
      setIsUsingLocalStorage(false);
      setServerReadFailed(false);
      return true;
    } catch (err) {
      const localBookmarks = getFromLocalStorage();
      setBookmarks(localBookmarks);
      setIsUsingLocalStorage(true);
      setServerReadFailed(true);
      setError('تعذر الاتصال بالخادم. الرجاء المحاولة لاحقاً');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If user is not logged in, load from localStorage
    if (!auth.currentUser) {
      const localBookmarks = getFromLocalStorage();
      setBookmarks(localBookmarks);
      setIsUsingLocalStorage(true);
      return;
    }

    setIsUsingLocalStorage(false);

    // Try to migrate local bookmarks when user logs in
    migrateLocalBookmarksToFirebase();

    // Set up real-time listener but be resilient: if the listener errors (quota),
    // attempt a retried one-time read and fall back to local bookmarks in the meantime.
    const bookmarksQuery = query(collection(firestore, 'bookmarks'), where('userId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(
      bookmarksQuery,
      (snapshot) => {
        const userBookmarks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // merge with any local bookmarks (avoid hiding local-only ones)
        const localBookmarks = getFromLocalStorage();
        const merged = mergeAndDedupBookmarks(userBookmarks, localBookmarks);
        setBookmarks(merged);
        setIsUsingLocalStorage(false);
        setServerReadFailed(false);
      },
      async (error) => {
        console.error('Error listening to bookmarks:', error);
        // If Firebase quota is exceeded or other read error, try a retried read
        if (error instanceof FirebaseError && error.code === 'resource-exhausted') {
          try {
            const cloud = await readCloudWithRetry(3, 600);
            const localBookmarks = getFromLocalStorage();
            const merged = mergeAndDedupBookmarks(cloud, localBookmarks);
            setBookmarks(merged);
            setIsUsingLocalStorage(false);
            setServerReadFailed(false);
          } catch (err) {
            // final fallback to localStorage
            const localBookmarks = getFromLocalStorage();
            setBookmarks(localBookmarks);
            setIsUsingLocalStorage(true);
            setServerReadFailed(true);
          }
        } else {
          setError('Failed to load bookmarks');
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const addBookmark = async (surahNumber, surahName, pageNumber, ayahNumber, ayahText, bookmarkType = 'surah', juzNumber = null, hizbNumber = null, juzName = null, hizbName = null) => {
    setLoading(true);
    setError('');

    try {
      const bookmarkObj = {
        bookmarkType,
        surahNumber: parseInt(surahNumber),
        surahName,
        pageNumber: parseInt(pageNumber),
        ayahNumber: parseInt(ayahNumber),
        ayahText: ayahText?.slice(0, ayahText?.length - 2) || '',
        bookmarkDate: new Date().toISOString(),
      };

      // Add juz/hizb specific fields if applicable
      if (bookmarkType === 'juz') {
        bookmarkObj.juzNumber = parseInt(juzNumber);
        bookmarkObj.juzName = juzName;
      } else if (bookmarkType === 'hizb') {
        bookmarkObj.hizbNumber = parseInt(hizbNumber);
        bookmarkObj.hizbName = hizbName;
      }

      if (!auth.currentUser || isUsingLocalStorage) {
        // Use localStorage
        bookmarkObj.id = Date.now().toString(); // Generate a local ID
        // mark as local-only
        bookmarkObj._localOnly = true;
        const localBookmarks = [...bookmarks.filter(b => !b._localOnly), bookmarkObj];
        setBookmarks(localBookmarks);
        saveToLocalStorage(localBookmarks);
        if (!auth.currentUser) {
          setError('العلامة المرجعية محفوظة محلياً. سجل دخولك لمزامنة علاماتك المرجعية عبر الأجهزة');
        }
        return true;
      }

      // Use Firebase
      try {
        bookmarkObj.userId = auth.currentUser.uid;
        bookmarkObj.bookmarkDate = Timestamp.fromDate(new Date());
        await addDoc(collection(firestore, 'bookmarks'), bookmarkObj);
        return true;
      } catch (err) {
        if (err instanceof FirebaseError && err.code === 'resource-exhausted') {
          // Fall back to localStorage if quota is exceeded
          bookmarkObj.id = Date.now().toString();
          bookmarkObj._localOnly = true;
          const localBookmarks = [...bookmarks.filter(b => !b._localOnly), bookmarkObj];
          setBookmarks(localBookmarks);
          saveToLocalStorage(localBookmarks);
          setIsUsingLocalStorage(true);
          setServerReadFailed(true);
          setError('تم حفظ العلامة المرجعية محلياً بسبب مشكلة في الخادم');
          return true;
        }
        throw err;
      }
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('فشل في حفظ العلامة المرجعية');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    if (!bookmarkId) return false;

    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser || isUsingLocalStorage) {
        // Use localStorage
        const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
        setBookmarks(updatedBookmarks);
        saveToLocalStorage(updatedBookmarks);
        return true;
      }

      // Use Firebase
      try {
        await deleteDoc(doc(firestore, 'bookmarks', bookmarkId));
        return true;
      } catch (err) {
        if (err instanceof FirebaseError && err.code === 'resource-exhausted') {
          // Fall back to localStorage
          const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
          setBookmarks(updatedBookmarks);
          saveToLocalStorage(updatedBookmarks);
          setIsUsingLocalStorage(true);
          setError('تم حذف العلامة المرجعية محلياً بسبب مشكلة في الخادم');
          return true;
        }
        throw err;
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('فشل في حذف العلامة المرجعية');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (surahNumber, ayahNumber, bookmarkType = 'surah', juzNumber = null, hizbNumber = null) => {
    return bookmarks.some(
      bookmark => bookmark.surahNumber === parseInt(surahNumber) &&
                 bookmark.ayahNumber === parseInt(ayahNumber) &&
                 bookmark.bookmarkType === bookmarkType &&
                 (bookmarkType === 'surah' ||
                  (bookmarkType === 'juz' && bookmark.juzNumber === parseInt(juzNumber)) ||
                  (bookmarkType === 'hizb' && bookmark.hizbNumber === parseInt(hizbNumber)))
    );
  };

  const getBookmarkId = (surahNumber, ayahNumber, bookmarkType = 'surah', juzNumber = null, hizbNumber = null) => {
    const bookmark = bookmarks.find(
      bookmark => bookmark.surahNumber === parseInt(surahNumber) &&
                 bookmark.ayahNumber === parseInt(ayahNumber) &&
                 bookmark.bookmarkType === bookmarkType &&
                 (bookmarkType === 'surah' ||
                  (bookmarkType === 'juz' && bookmark.juzNumber === parseInt(juzNumber)) ||
                  (bookmarkType === 'hizb' && bookmark.hizbNumber === parseInt(hizbNumber)))
    );
    return bookmark?.id;
  };

  const toggleBookmark = async (surahNumber, surahName, pageNumber, ayahNumber, ayahText, bookmarkType = 'surah', juzNumber = null, hizbNumber = null, juzName = null, hizbName = null) => {
    const existingBookmarkId = getBookmarkId(surahNumber, ayahNumber, bookmarkType, juzNumber, hizbNumber);

    if (existingBookmarkId) {
      return await removeBookmark(existingBookmarkId);
    } else {
      return await addBookmark(surahNumber, surahName, pageNumber, ayahNumber, ayahText, bookmarkType, juzNumber, hizbNumber, juzName, hizbName);
    }
  };

  const getBookmarksBySurah = (surahNumber) => {
    return bookmarks.filter(bookmark => bookmark.surahNumber === parseInt(surahNumber));
  };

  const getBookmarksByType = (bookmarkType) => {
    return bookmarks.filter(bookmark => bookmark.bookmarkType === bookmarkType);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        error,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        getBookmarkId,
        getBookmarksBySurah,
        getBookmarksByType,
        isUsingLocalStorage,
            serverReadFailed,
            retryLoadBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
