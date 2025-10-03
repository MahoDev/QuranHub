import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../config/firebase";
import {
  getDocs,
  query,
  where,
  collection,
  Timestamp,
  deleteDoc,
  doc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { deleteUser, signOut } from "firebase/auth";
import LoadingView from "../components/LoadingView";
import Modal from "../components/Modal";
import { useSurahSettings } from "../contexts/surah-settings-context";
import { Helmet } from "react-helmet-async";

function Profile() {
  const { surahSettings, onSurahSettingsChange } = useSurahSettings();

  const [bookmarks, setBookmarks] = useState([]);
  const [sortByDate, setSortByDate] = useState(true); // true for descending, false for ascending
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const dataPath = collection(firestore, "bookmarks");
        const q = query(dataPath, where("userId", "==", auth.currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userBookmarks = snapshot.docs.map((doc) => {
            return { ...doc.data(), id: doc.id };
          });
          setBookmarks(userBookmarks);
          setLoading(false);
        });

        return unsubscribe; // Return the unsubscribe function to clean up the listener
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };
    const unsubscribe = fetchBookmarks();
    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe.then((unsubscribe) => {
        unsubscribe();
      });
    };
  }, []);

  const handleBookmarkNavigation = (bookmark) => {
    navigate(`/surah/${bookmark.surahNumber}`);
    onSurahSettingsChange({
      currentSurah: bookmark.surahNumber,
      currentPage: bookmark.pageNumber,
      currentVerse: +bookmark.ayahNumber,
    });
  };

  const handleDeleteBookmark = (bookmarkId) => {
    setBookmarkToDelete(bookmarkId);
    setShowConfirmation(true);
  };

  const confirmDeleteBookmark = async () => {
    if (!bookmarkToDelete) return;
    
    try {
      await deleteDoc(doc(firestore, "bookmarks", bookmarkToDelete));
    } catch (err) {
      console.error(err.message);
    } finally {
      setBookmarkToDelete(null);
      setShowConfirmation(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      //***Delete user data***
      //batch allows to perfrom multiple write operations
      //(add,update,delete) in one network request.
      const batch = writeBatch(firestore);
      const bookmarksSnapshot = await getDocs(
        query(
          collection(firestore, "bookmarks"),
          where("userId", "==", auth.currentUser.uid)
        )
      );
      bookmarksSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      //***delete user account***
      await deleteUser(auth.currentUser);
      navigate("/user/login"); // Redirect to login page after successful deletion
    } catch (error) {
      if (error.message == "Firebase: Error (auth/requires-recent-login).") {
        await signOut(auth);
        navigate("/user/login", { state: { recentLoginNeeded: true } });
      }
      console.error("Error deleting account:", error.message);
    }
  };

  const toggleSortOrder = () => {
    setSortByDate(!sortByDate);
  };

  const toggleRecentFilter = () => {
    setShowOnlyRecent(!showOnlyRecent);
  };

  // Apply sorting and filtering based on state
  let sortedBookmarks = [...bookmarks];
  if (sortByDate) {
    sortedBookmarks.sort((a, b) => b.bookmarkDate - a.bookmarkDate);
  } else {
    sortedBookmarks.sort((a, b) => a.bookmarkDate - b.bookmarkDate);
  }

  if (showOnlyRecent) {
    // Convert the current date to a Firebase Timestamp
    const todayTimestamp = Timestamp.now();
    const sevenDaysAgoTimestamp = Timestamp.fromMillis(
      todayTimestamp.toMillis() - 7 * 24 * 60 * 60 * 1000
    );
    sortedBookmarks = sortedBookmarks.filter((bookmark) => {
      // Check if the bookmark's timestamp is after sevenDaysAgoTimestamp
      return (
        bookmark.bookmarkDate.toMillis() >= sevenDaysAgoTimestamp.toMillis()
      );
    });
  }

  return (
    <>
      <Helmet>
        <title>منصة القرآن | الحساب الشخصي</title>
        <meta
          name="description"
          content="صفحة الحساب الشخصي في موقع منصة القرآن"
        ></meta>
        <meta name="robots" content="noindex"/>
      </Helmet>
      
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          الحساب الشخصي
        </h1>
        <h2 className="text-xl text-center font-semibold mb-4 dark:text-white">
          النقاط المرجعية
        </h2>
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleSortOrder}
            className="mr-4 bg-emerald-500 dark:bg-emerald-800 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white py-2 px-4 rounded-full transition-colors duration-200"
          >
            {sortByDate ? "ترتيب حسب الأقدم" : "ترتيب حسب الأحدث"}
          </button>
          <button
            onClick={toggleRecentFilter}
            className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white py-2 px-4 rounded-full transition-colors duration-200"
          >
            {showOnlyRecent ? "إظهار الكل" : "عرض الأحدث فقط"}
          </button>
        </div>
        <div className="mb-8 max-h-[600px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
          {!loading ? (
            <div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedBookmarks.map((bookmark) => (
                  <li
                    key={bookmark.id}
                    className="bg-white relative dark:bg-emerald-800 border-2 border-gray-300 dark:border-none  shadow-md dark:shadow-lg rounded-lg p-4 hover:shadow-lg transition duration-300"
                  >
                    <p className="text-lg font-semibold mb-2 dark:text-white">
                      {bookmark.surahName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-200">
                      الصفحة: {bookmark.pageNumber}
                    </p>
                    <p className="text-gray-600 dark:text-gray-200 truncate hover:overflow-visible  hover:whitespace-normal">
                      الآية {bookmark.ayahNumber}:{" "}
                      <span className="font-quranMain text-justify">
                        {bookmark.ayahText}
                      </span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-200">
                      وقت الاضافة:{" "}
                      <span>
                        {bookmark.bookmarkDate.toDate().toLocaleString("ar", {
                          weekday: "long",
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })}
                      </span>
                    </p>

                    <span
                      className="text-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors duration-200"
                      onClick={() => {
                        handleBookmarkNavigation(bookmark);
                      }}
                      title="الانتقال إلى النقطة المرجعية"
                    >
                      الانتقال
                    </span>
                    <span
                      className="text-red-500 hover:text-red-600 cursor-pointer absolute top-2 left-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBookmark(bookmark.id);
                      }}
                      title="حذف"
                    >
                      X
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <LoadingView />
          )}
        </div>
        <div className="bg-gray-400 h-[1px] w-full mb-4"></div>

        {/* Help & Feedback Section */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
            المساعدة والدعم
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            هل واجهت مشكلة أو لديك اقتراح لتحسين الموقع؟
          </p>
          <a
            href="https://forms.gle/qePN5yyg5nGqfcqe8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            الإبلاغ عن مشكلة أو طلب اضافة خاصية 
          </a>
        </div>

        <div className="bg-gray-400 h-[1px] w-full mb-4"></div>
        <p className="text-black dark:text-white mb-4">
          الضغط على هذا الزر سيمكنك من حذف حسابك وكل البيانات المرتبطة به
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full"
        >
          حذف الحساب
        </button>
        {/* Confirmation Modal */}
        {showConfirmation && (
          <Modal
            bodyText={bookmarkToDelete ? "هل أنت متأكد من رغبتك في حذف هذه العلامة المرجعية؟" : "هل أنت متأكد من رغبتك في حذف الحساب؟"}
            onConfirm={bookmarkToDelete ? confirmDeleteBookmark : confirmDeleteAccount}
            onCancel={() => {
              setShowConfirmation(false);
              setBookmarkToDelete(null);
            }}
          />
        )}
      </div>
    </>
  );
}

export default Profile;
