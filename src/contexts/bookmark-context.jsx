import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      query(collection(firestore, 'bookmarks'), where('userId', '==', auth.currentUser.uid)),
      (snapshot) => {
        const userBookmarks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookmarks(userBookmarks);
      },
      (error) => {
        console.error('Error listening to bookmarks:', error);
        setError('Failed to load bookmarks');
      }
    );

    return () => unsubscribe();
  }, []);

  const addBookmark = async (surahNumber, surahName, pageNumber, ayahNumber, ayahText) => {
    if (!auth.currentUser) {
      setError('يجب تسجيل الدخول أولاً');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const bookmarkObj = {
        userId: auth.currentUser.uid,
        surahNumber: parseInt(surahNumber),
        surahName,
        pageNumber: parseInt(pageNumber),
        ayahNumber: parseInt(ayahNumber),
        ayahText: ayahText?.slice(0, ayahText?.length - 2) || '',
        bookmarkDate: Timestamp.fromDate(new Date()),
      };

      await addDoc(collection(firestore, 'bookmarks'), bookmarkObj);
      return true;
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
      await deleteDoc(doc(firestore, 'bookmarks', bookmarkId));
      return true;
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('فشل في حذف العلامة المرجعية');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (surahNumber, ayahNumber) => {
    return bookmarks.some(
      bookmark => bookmark.surahNumber === parseInt(surahNumber) &&
                 bookmark.ayahNumber === parseInt(ayahNumber)
    );
  };

  const getBookmarkId = (surahNumber, ayahNumber) => {
    const bookmark = bookmarks.find(
      bookmark => bookmark.surahNumber === parseInt(surahNumber) &&
                 bookmark.ayahNumber === parseInt(ayahNumber)
    );
    return bookmark?.id;
  };

  const toggleBookmark = async (surahNumber, surahName, pageNumber, ayahNumber, ayahText) => {
    const existingBookmarkId = getBookmarkId(surahNumber, ayahNumber);

    if (existingBookmarkId) {
      return await removeBookmark(existingBookmarkId);
    } else {
      return await addBookmark(surahNumber, surahName, pageNumber, ayahNumber, ayahText);
    }
  };

  const getBookmarksBySurah = (surahNumber) => {
    return bookmarks.filter(bookmark => bookmark.surahNumber === parseInt(surahNumber));
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
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
