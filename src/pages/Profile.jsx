import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../config/firebase";
import {
  getDocs,
  query,
  where,
  collection,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { deleteUser, signOut, onAuthStateChanged } from "firebase/auth";
import LoadingView from "../components/LoadingView";
import Modal from "../components/Modal";
import { useSurahSettings } from "../contexts/surah-settings-context";
import { Helmet } from "react-helmet-async";
import { convertToArabicNumbers } from "../utility/text-utilities";
import { useBookmarks } from "../contexts/bookmark-context";

function Profile() {
  const { surahSettings, onSurahSettingsChange } = useSurahSettings();
  const { 
    bookmarks: contextBookmarks, 
    isUsingLocalStorage,
    serverReadFailed,
    retryLoadBookmarks,
  } = useBookmarks();

  const [bookmarks, setBookmarks] = useState([]);
  const [sortByDate, setSortByDate] = useState(true); // true for descending, false for ascending
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Use the bookmarks directly from context
    setBookmarks(contextBookmarks);
    setLoading(false);
  }, [contextBookmarks]);

  const handleBookmarkNavigation = (bookmark) => {
    if (bookmark.bookmarkType === 'juz') {
      // Navigate to juz reader
      navigate(`/juz/${bookmark.juzNumber}`, { state: { startSurah: bookmark.surahNumber, startVerse: +bookmark.ayahNumber } });
    } else if (bookmark.bookmarkType === 'hizb') {
      // Navigate to hizb reader
      navigate(`/hizb/${bookmark.hizbNumber}`, { state: { startSurah: bookmark.surahNumber, startVerse: +bookmark.ayahNumber } });
    } else {
      // Default to surah navigation (existing behavior)
      navigate(`/surah/${bookmark.surahNumber}`);
    }

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

  const { removeBookmark } = useBookmarks();
  
  const confirmDeleteBookmark = async () => {
    if (!bookmarkToDelete) return;
    
    try {
      await removeBookmark(bookmarkToDelete);
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

  const manualRefreshBookmarks = () => {
    // If server read failed, try to retry the cloud read; otherwise just refresh view
    if (serverReadFailed && retryLoadBookmarks) {
      setRetrying(true);
      retryLoadBookmarks().finally(() => setRetrying(false));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setBookmarks(contextBookmarks);
      setLoading(false);
    }, 500); // Add a small delay to show the loading animation
  };

  // Apply sorting and filtering based on state
  let sortedBookmarks = [...bookmarks];
  if (sortByDate) {
    sortedBookmarks.sort((a, b) => {
      const dateA = typeof a.bookmarkDate === 'string' 
        ? new Date(a.bookmarkDate).getTime()
        : a.bookmarkDate.toDate().getTime();
      const dateB = typeof b.bookmarkDate === 'string'
        ? new Date(b.bookmarkDate).getTime()
        : b.bookmarkDate.toDate().getTime();
      return dateB - dateA;
    });
  } else {
    sortedBookmarks.sort((a, b) => {
      const dateA = typeof a.bookmarkDate === 'string'
        ? new Date(a.bookmarkDate).getTime()
        : a.bookmarkDate.toDate().getTime();
      const dateB = typeof b.bookmarkDate === 'string'
        ? new Date(b.bookmarkDate).getTime()
        : b.bookmarkDate.toDate().getTime();
      return dateA - dateB;
    });
  }

  if (showOnlyRecent) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    sortedBookmarks = sortedBookmarks.filter((bookmark) => {
      const bookmarkDate = typeof bookmark.bookmarkDate === 'string'
        ? new Date(bookmark.bookmarkDate)
        : bookmark.bookmarkDate.toDate();
      return bookmarkDate >= sevenDaysAgo;
    });
  }

  return (
    <>
      <Helmet>
        <title>منصة القرآن | الحساب الشخصي</title>
        <meta
          name="description"
          content="صفحة الحساب الشخصي في موقع منصة القرآن"
        />
        <meta name="robots" content="noindex"/>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-6">👤</div>
            <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">
              الحساب الشخصي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              إدارة العلامات المرجعية وإعدادات الحساب الخاصة بك
            </p>
          </div>

          {/* User Information Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl p-8 mb-8 transition-all duration-300 hover:shadow-3xl hover:bg-white/95 dark:hover:bg-gray-800/95">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              {/* User Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-emerald-200 dark:ring-emerald-700">
                {auth.currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                 auth.currentUser?.email?.charAt(0)?.toUpperCase() ||
                 "م"}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                  {auth.currentUser?.displayName || "مستخدم منصة القرآن"}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {auth.currentUser?.email}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                    عضو نشط
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    انضم في {auth.currentUser?.metadata?.creationTime ?
                      new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      }) + ' م':
                      "تاريخ غير محدد"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                  العلامات المرجعية 
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {convertToArabicNumbers(bookmarks.length)} علامة مرجعية محفوظة
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleSortOrder}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    sortByDate
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {sortByDate ? "الأحدث أولاً" : "الأقدم أولاً"}
                </button>
                <button
                  onClick={toggleRecentFilter}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    showOnlyRecent
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {showOnlyRecent ? "عرض الكل" : "الأسبوع الماضي"}
                </button>
                <button
                  onClick={manualRefreshBookmarks}
                  disabled={loading || retrying}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center"
                  title="تحديث العلامات المرجعية يدوياً"
                >
                  {loading || retrying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  تحديث
                </button>
              </div>
            </div>

            {/* LocalStorage Warning for logged-in users */}
            {auth.currentUser && isUsingLocalStorage && (
              <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="text-2xl ml-3">⚠️</div>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    بسبب مشكلة في الخادم، سيتم حفظ العلامات المرجعية الجديدة على جهازك الحالي فقط. 
                    يرجى المحاولة مرة أخرى لاحقاً لمزامنة علاماتك المرجعية مع حسابك لإمكانية الوصول لها من أي جهاز.
                  </p>
                </div>
                {serverReadFailed && (
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => { setRetrying(true); retryLoadBookmarks().finally(() => setRetrying(false)); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      disabled={retrying}
                    >
                      {retrying ? 'جاري المحاولة...' : 'إعادة المحاولة'}
                    </button>
                    <button
                      onClick={() => { localStorage.removeItem('quranHub_localBookmarks'); setBookmarks([]); }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
                    >
                      مسح العلامات المحلية
                    </button>
                  </div>
                )}
              </div>
            )}

          {/* Bookmarks List */}
            <div className="max-h-[600px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
              {!loading ? (
                <div>
                  {sortedBookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedBookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-700 dark:to-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                          onClick={() => handleBookmarkNavigation(bookmark)}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                                  {bookmark.surahName}
                                </h3>
                                {bookmark._localOnly && (
                                  <span className="ml-2 text-xs text-yellow-700 dark:text-yellow-300">محلي</span>
                                )}
                                {/* Bookmark type badge */}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  bookmark.bookmarkType === 'juz'
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                    : bookmark.bookmarkType === 'hizb'
                                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                  {bookmark.bookmarkType === 'juz' ? 'الجزء' :
                                   bookmark.bookmarkType === 'hizb' ? 'الحزب' : 'السورة'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {bookmark.bookmarkType === 'juz' && bookmark.juzNumber &&
                                  `الجزء ${convertToArabicNumbers(bookmark.juzNumber)} • `}
                                {bookmark.bookmarkType === 'hizb' && bookmark.hizbNumber &&
                                  `الحزب ${convertToArabicNumbers(bookmark.hizbNumber)} • `}
                                الصفحة {convertToArabicNumbers(bookmark.pageNumber)} • الآية {convertToArabicNumbers(bookmark.ayahNumber)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBookmark(bookmark.id);
                              }}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 p-2 flex-shrink-0"
                              title="حذف العلامة المرجعية"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Ayah Text */}
                          <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-quranMain">
                              {bookmark.ayahText}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="flex items-start justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {(typeof bookmark.bookmarkDate === 'string' 
                                  ? new Date(bookmark.bookmarkDate)
                                  : bookmark.bookmarkDate.toDate()
                                ).toLocaleDateString("ar-SA", {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {(typeof bookmark.bookmarkDate === 'string'
                                  ? new Date(bookmark.bookmarkDate)
                                  : bookmark.bookmarkDate.toDate()
                                ).toLocaleDateString("en-US", {
                                  month: "numeric",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              اضغط للانتقال
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        لا توجد علامات مرجعية
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500">
                        ابدأ في القراءة وحفظ العلامات المرجعية للعودة إليها لاحقاً
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <LoadingView />
              )}
            </div>
          </div>

          {/* Local Storage Warning - if applicable */}
          {!auth.currentUser && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-8 mb-8">
              <div className="flex items-center mb-4">
                <div className="text-4xl ml-4">⚠️</div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                    تنبيه: العلامات المرجعية محفوظة محلياً
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    علاماتك المرجعية محفوظة على هذا الجهاز فقط. لمزامنة علاماتك المرجعية عبر جميع أجهزتك، يرجى تسجيل الدخول.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/user/login')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate('/user/signup')}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </div>
          )}

          {/* Help & Support Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="text-4xl ml-4">💬</div>
              <div>
                <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                  المساعدة والدعم
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  هل تحتاج مساعدة أو لديك اقتراحات لتحسين المنصة؟
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://forms.gle/qePN5yyg5nGqfcqe8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 text-center flex items-center justify-center"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                الإبلاغ عن مشكلة أو طلب ميزة جديدة
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-red-200/50 dark:border-red-700/50 shadow-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="text-4xl ml-4">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                  منطقة الخطر
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  هذه العملية لا يمكن التراجع عنها
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 text-sm">
                حذف الحساب سيؤدي إلى حذف جميع البيانات المرتبطة به بما في ذلك العلامات المرجعية والإعدادات الشخصية.
                هذه العملية لا يمكن التراجع عنها.
              </p>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              حذف الحساب نهائياً
            </button>
          </div>
        </div>

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
