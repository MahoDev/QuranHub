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
import { juzData } from '../assets/data/quran-structure';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEY = 'quranHub_localBookmarks';

// Helper to check if a bookmark already exists
const isBookmarkDuplicate = (existingBookmarks, newBookmark) => {
  return existingBookmarks.some(bm => 
    bm.surahNumber == newBookmark.surahNumber && 
    bm.ayahNumber == newBookmark.ayahNumber
  );
};

// Save bookmarks to local storage
const saveToLocalStorage = (bookmarks) => {
  if(!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
  } else {
    const currentBookmarks = getFromLocalStorage();
    const filteredBookmarks = bookmarks.filter(bookmark => 
      !isBookmarkDuplicate(currentBookmarks, bookmark)
    );
    const mergedBookmarks = [...currentBookmarks, ...filteredBookmarks];
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

  // Function to check if there are bookmarks that need migration
  const checkForLocalBookmarks = () => {
    const localBookmarks = getFromLocalStorage();
    return localBookmarks.some(bm => bm._requiresMigration === true);
  };

  // Helper function to check if two bookmarks are similar (same content, similar time)
  const isSimilarBookmark = (bm1, bm2, timeThreshold = 120000) => { // 2 minutes threshold
    // Check if the core bookmark data matches
    const sameContent = 
      bm1.surahNumber === bm2.surahNumber &&
      bm1.ayahNumber === bm2.ayahNumber &&
      bm1.pageNumber === bm2.pageNumber;
    
    if (!sameContent) return false;
    
    // Parse dates
    const date1 = bm1.bookmarkDate?.toDate ? bm1.bookmarkDate.toDate() : new Date(bm1.bookmarkDate);
    const date2 = bm2.bookmarkDate?.toDate ? bm2.bookmarkDate.toDate() : new Date(bm2.bookmarkDate);
    
    // Check if timestamps are within the threshold
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    return timeDiff <= timeThreshold;
  };

  // Function to migrate local bookmarks to Firebase - now user-initiated
  const migrateLocalBookmarksToFirebase = async () => {
    const localBookmarks = getFromLocalStorage();
    if (localBookmarks.length === 0) return { success: false, message: 'لا توجد علامات مرجعية محلية للهجرة' };

    if (!auth.currentUser) {
      return { success: false, message: 'يجب تسجيل الدخول أولاً' };
    }

    setLoading(true);
    setError('');

    try {
      // Filter bookmarks that need migration (either no userId or _requiresMigration is true)
      const bookmarksToMigrate = localBookmarks.filter(bm => 
        !bm.userId || bm._requiresMigration === true
      );

      if (bookmarksToMigrate.length === 0) {
        return { success: true, message: 'لا توجد علامات مرجعية جديدة للهجرة' };
      }

      // Get existing bookmarks to avoid duplicates
      const q = query(
        collection(firestore, 'bookmarks'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      // Store existing bookmarks for comparison
      const existingBookmarks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const batch = writeBatch(firestore);
      const bookmarksCol = collection(firestore, 'bookmarks');
      let migratedCount = 0;
      let duplicateCount = 0;

      for (const localBookmark of bookmarksToMigrate) {
        // Check if a similar bookmark already exists
        const isDuplicate = existingBookmarks.some(existingBm => 
          isSimilarBookmark(localBookmark, existingBm)
        );
        
        if (!isDuplicate) {
          const newBookmarkRef = doc(bookmarksCol);
          batch.set(newBookmarkRef, {
            ...localBookmark,
            userId: auth.currentUser.uid,
            bookmarkDate: Timestamp.fromDate(
              localBookmark.bookmarkDate?.toDate?.() || new Date(localBookmark.bookmarkDate)
            ),
            _offline: false,
            _requiresMigration: false,
            _migratedAt: Timestamp.now()
          });
          migratedCount++;
        } else {
          duplicateCount++;
        }
      }

      if (migratedCount > 0) {
        await batch.commit();
      }

      // Only remove migrated bookmarks from local storage
      const remainingBookmarks = localBookmarks.filter(bm => 
        !bookmarksToMigrate.some(migrated => 
          new Date(migrated.bookmarkDate).toISOString() === new Date(bm.bookmarkDate).toISOString()
        )
      );
      
      if (remainingBookmarks.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingBookmarks));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      let message = '';
      if (migratedCount > 0 && duplicateCount > 0) {
        message = `تم نقل ${migratedCount} علامة مرجعية إلى حسابك. تم تخطي ${duplicateCount} علامات مكررة`;
      } else if (migratedCount > 0) {
        message = 'تم نقل العلامات المرجعية المحلية إلى حسابك بنجاح';
      } else if (duplicateCount > 0) {
        message = 'جميع العلامات المرجعية المحلية موجودة بالفعل في حسابك';
      }

      return { success: true, message };
    } catch (error) {
      console.error('Error migrating bookmarks:', error);
      setError('فشل في نقل العلامات المرجعية المحلية');
      setIsUsingLocalStorage(true);
      setServerReadFailed(true);
      return { success: false, message: 'حدث خطأ أثناء نقل العلامات المرجعية' };
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
    migrateLocalBookmarksToFirebase().catch(err => {
      console.error('Error migrating bookmarks:', err);
    });

    // Set up real-time listener
    const bookmarksQuery = query(
      collection(firestore, 'bookmarks'), 
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      bookmarksQuery,
      (snapshot) => {
        const userBookmarks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date if needed
          bookmarkDate: doc.data().bookmarkDate?.toDate?.() || doc.data().bookmarkDate
        }));
        
        
        // Only merge with local bookmarks if we're not using local storage
        if (!isUsingLocalStorage) {
          const localBookmarks = getFromLocalStorage();
          const merged = mergeAndDedupBookmarks(userBookmarks, localBookmarks);
          setBookmarks(merged);
        } else {
          setBookmarks(userBookmarks);
        }
        
        setServerReadFailed(false);
      },
      async (error) => {
        console.error('Error in bookmarks listener:', error);
        
        // If Firebase quota is exceeded or other read error, try a retried read
        if (error instanceof FirebaseError) {
          try {
            const cloud = await readCloudWithRetry(3, 600);
            const localBookmarks = getFromLocalStorage();
            const merged = mergeAndDedupBookmarks(cloud, localBookmarks);
            setBookmarks(merged);
            setIsUsingLocalStorage(false);
            setServerReadFailed(false);
          } catch (err) {
            console.error('All retry attempts failed, falling back to local storage');
            const localBookmarks = getFromLocalStorage();
            setBookmarks(localBookmarks);
            setIsUsingLocalStorage(true);
            setServerReadFailed(true);
            setError('Failed to sync bookmarks. Using local storage.');
          }
        } else {
          setError('Failed to load bookmarks: ' + error.message);
        }
      }
    );

    return () => {
      console.log('Cleaning up bookmarks listener');
      unsubscribe();
    };
  }, [auth.currentUser, isUsingLocalStorage]);

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
        bookmarkObj.juzName = juzName || juzData[juzNumber - 1].commonName;
      } else if (bookmarkType === 'hizb') {
        bookmarkObj.hizbNumber = parseInt(hizbNumber);
        bookmarkObj.hizbName = hizbName ;
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
