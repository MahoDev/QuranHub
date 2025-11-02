import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore, app } from "../config/firebase";
import {
  getDocs,
  query,
  where,
  collection,
  Timestamp,
  writeBatch,
  setDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { deleteUser, signOut, onAuthStateChanged } from "firebase/auth";
import LoadingView from "../components/LoadingView";
import Modal from "../components/Modal";
import { useSurahSettings } from "../contexts/surah-settings-context";
import { Helmet } from "react-helmet-async";
import { convertToArabicNumbers, removeTashkeel } from "../utility/text-utilities";
import { useBookmarks } from "../contexts/bookmark-context";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

function Profile() {
  const { surahSettings, onSurahSettingsChange } = useSurahSettings();
  const { 
    bookmarks: contextBookmarks, 
    loading: bookmarksLoading, 
    error: bookmarksError, 
    isUsingLocalStorage, 
    serverReadFailed, 
    retryLoadBookmarks,
    migrateLocalBookmarksToFirebase
  } = useBookmarks();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortByDate, setSortByDate] = useState(true); // true for descending, false for ascending
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [retrying, setRetrying] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showMigrationSuccess, setShowMigrationSuccess] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState("");
  const [migrationStatus, setMigrationStatus] = useState("");

  // Format bookmark date
  const formatBookmarkDate = (date) => {
    if (!date) return '';
    
    try {
      const jsDate = date?.toDate ? date.toDate() : new Date(date);
      return jsDate.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return '';
    }
  };

  // Format bookmark time
  const formatBookmarkTime = (date) => {
    if (!date) return '';
    
    try {
      const jsDate = date?.toDate ? date.toDate() : new Date(date);
      return jsDate.toLocaleTimeString("ar-SA", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error, date);
      return '';
    }
  };

  useEffect(() => {
    if (contextBookmarks) {
      setBookmarks(contextBookmarks);
      setLoading(bookmarksLoading);
      setError(bookmarksError || '');
    }
  }, [contextBookmarks, bookmarksLoading, bookmarksError]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
  if (auth.currentUser) {
    console.log('User is authenticated, testing Firestore connection...');
    const testDoc = doc(firestore, 'test', 'test');
    setDoc(testDoc, { test: 'test' }, { merge: true })
      .then(() => console.log('Firestore write successful'))
      .catch(err => console.error('Firestore write failed:', err));
  }
}, [auth.currentUser]);

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

  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteBookmark = (bookmarkId, e) => {
    e.stopPropagation();
    setBookmarkToDelete(bookmarkId);
    setShowConfirmation(true);
  };

  const { removeBookmark } = useBookmarks();
  
  const confirmDeleteBookmark = async () => {
    if (!bookmarkToDelete) return;
    
    try {
      await removeBookmark(bookmarkToDelete);
      // Update local state to remove the deleted bookmark
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkToDelete));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('فشل في حذف العلامة المرجعية');
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

  const manualRefreshBookmarks = async () => {
    setRetrying(true);
    setLoading(true);
    setError('');
    
    try {
      
      // If we're in local storage mode, try to migrate bookmarks first
      if (isUsingLocalStorage && auth.currentUser) {
        console.log('Attempting to migrate local bookmarks to cloud...');
        const result = await migrateLocalBookmarksToFirebase();
        if (result?.success) {
          console.log('Migration successful:', result.message);
          setMigrationMessage(result.message);
          setMigrationStatus('success');
          setShowMigrationSuccess(true);
        }
      }
      
      // Always try to reload bookmarks after migration attempt
      if (retryLoadBookmarks) {
        console.log('Reloading bookmarks...');
        await retryLoadBookmarks();
      } else {
        console.log('No retryLoadBookmarks function available');
        setBookmarks(contextBookmarks || []);
      }
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowMigrationSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error refreshing bookmarks:', error);
      setError(error.message || 'فشل تحديث العلامات المرجعية');
      
    } finally {
      setRetrying(false);
      setLoading(false);
    }
  };

  // Helper function to safely get timestamp from various date formats
  const getTimestamp = (date) => {
    if (!date) return 0;
    try {
      if (date.seconds) {
        return date.seconds * 1000 + (date.nanoseconds || 0) / 1000000;
      }
      if (date.toDate) {
        return date.toDate().getTime();
      }
      if (date.getTime) {
        return date.getTime();
      }
      return new Date(date).getTime() || 0;
    } catch (error) {
      console.error('Error parsing date:', error, date);
      return 0;
    }
  };

  // Get unique surahs and types for filters
  const { uniqueSurahs, uniqueTypes } = useMemo(() => {
    const surahs = new Set();
    const types = new Set();
    
    bookmarks.forEach(bookmark => {
      if (bookmark.surahName) surahs.add(bookmark.surahName);
      if (bookmark.bookmarkType) types.add(bookmark.bookmarkType);
    });
    
    return {
      uniqueSurahs: Array.from(surahs).sort(),
      uniqueTypes: Array.from(types).sort()
    };
  }, [bookmarks]);

  // Apply sorting and filtering
  const sortedBookmarks = useMemo(() => {
    if (!Array.isArray(bookmarks)) return [];
    
    let result = [...bookmarks];
    
    // Apply search filter
    if (searchQuery) {
      const query = removeTashkeel(searchQuery).toLowerCase();
      result = result.filter(bookmark => {
        const surahName = removeTashkeel(bookmark.surahName || '').toLowerCase();
        const ayahText = removeTashkeel(bookmark.ayahText || '').toLowerCase();
        
        return surahName.includes(query) || ayahText.includes(query);
      });
    }
    
    // Apply surah filter
    if (selectedSurah) {
      result = result.filter(bookmark => bookmark.surahName === selectedSurah);
    }
    
    // Apply type filter
    if (selectedType) {
      result = result.filter(bookmark => bookmark.bookmarkType === selectedType);
    }
    
    // Apply recent filter
    if (showOnlyRecent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      result = result.filter((bookmark) => {
        const bookmarkDate = typeof bookmark.bookmarkDate === 'string'
          ? new Date(bookmark.bookmarkDate)
          : bookmark.bookmarkDate?.toDate?.() || new Date(0);
        return bookmarkDate >= sevenDaysAgo;
      });
    }
    
    // Apply sorting
    if (sortByDate) {
      result.sort((a, b) => {
        const timeA = getTimestamp(a?.bookmarkDate);
        const timeB = getTimestamp(b?.bookmarkDate);
        return timeB - timeA; // Newest first
      });
    } else {
      result.sort((a, b) => {
        if (a.surahNo !== b.surahNo) {
          return a.surahNo - b.surahNo;
        }
        return a.ayahNo - b.ayahNo;
      });
    }
    
    return result;
  }, [bookmarks, searchQuery, selectedSurah, selectedType, showOnlyRecent, sortByDate]);

  // Update active filters
  useEffect(() => {
    const filters = [];
    if (searchQuery) filters.push(`بحث: ${searchQuery}`);
    if (selectedSurah) filters.push(`سورة: ${selectedSurah}`);
    if (selectedType) filters.push(`نوع: ${getTypeLabel(selectedType)}`);
    if (showOnlyRecent) filters.push('آخر أسبوع');
    setActiveFilters(filters);
  }, [searchQuery, selectedSurah, selectedType, showOnlyRecent]);

  const getTypeLabel = (type) => {
    switch(type) {
      case 'juz': return 'الجزء';
      case 'hizb': return 'الحزب';
      case 'surah': return 'السورة';
      default: return type;
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSurah('');
    setSelectedType('');
    setShowOnlyRecent(false);
    setSortByDate(true);
  };

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.startsWith('بحث:')) {
      setSearchQuery('');
    } else if (filterToRemove.startsWith('سورة:')) {
      setSelectedSurah('');
    } else if (filterToRemove.startsWith('نوع:')) {
      setSelectedType('');
    } else if (filterToRemove === 'آخر أسبوع') {
      setShowOnlyRecent(false);
    }
  };

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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                  العلامات المرجعية 
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {convertToArabicNumbers(bookmarks.length)} إجمالي العلامات • {convertToArabicNumbers(sortedBookmarks.length)} نتيجة
                </p>
              </div>

              {/* Main Controls */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-10 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                    placeholder="ابحث في العلامات المرجعية..."
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeFilters.length > 0
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <FiFilter />
                  {activeFilters.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {activeFilters.length}
                      </span>
                      الفلاتر
                    </span>
                  ) : (
                    'الفلاتر'
                  )}
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  مسح الكل
                </button>
                {activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-1 rounded-full">
                    {filter}
                    <button 
                      onClick={() => removeFilter(filter)}
                      className="mr-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ترتيب حسب
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <button
                        onClick={() => setSortByDate(true)}
                        className={`flex-1 px-3 py-2 rounded-r-md text-sm font-medium ${
                          sortByDate
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        الأحدث
                      </button>
                      <button
                        onClick={() => setSortByDate(false)}
                        className={`flex-1 px-3 py-2 rounded-l-md text-sm font-medium ${
                          !sortByDate
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        رقم الآية
                      </button>
                    </div>
                  </div>

                  {/* Surah Filter */}
                  <div>
                    <label htmlFor="surah-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      السورة
                    </label>
                    <select
                      id="surah-filter"
                      value={selectedSurah}
                      onChange={(e) => setSelectedSurah(e.target.value)}
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">الكل</option>
                      {uniqueSurahs.map((surah) => (
                        <option key={surah} value={surah}>
                          {surah}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      نوع العلامة
                    </label>
                    <select
                      id="type-filter"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">الكل</option>
                      <option value="surah">سورة</option>
                      <option value="juz">جزء</option>
                      <option value="hizb">حزب</option>
                    </select>
                  </div>

                  {/* Recent Filter */}
                  <div className="flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        id="recent-filter"
                        type="checkbox"
                        checked={showOnlyRecent}
                        onChange={() => setShowOnlyRecent(!showOnlyRecent)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                    <label htmlFor="recent-filter" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
                      آخر أسبوع فقط
                    </label>
                  </div>
                </div>
              </div>
            )}

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
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-6 text-center">
                  <div className="text-red-600 dark:text-red-400 font-medium mb-2">
                    {error}
                  </div>
                  <button
                    onClick={manualRefreshBookmarks}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
                    disabled={retrying}
                  >
                    {retrying ? 'جاري التحديث...' : 'إعادة المحاولة'}
                  </button>
                </div>
              ) : Array.isArray(sortedBookmarks) && sortedBookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id + bookmark.bookmarkDate}
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
                            {formatBookmarkDate(bookmark.bookmarkDate)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatBookmarkTime(bookmark.bookmarkDate)}
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
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">📑</div>
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {isUsingLocalStorage ? 
                      'العلامات المرجعية محفوظة محلياً فقط' : 
                      'لا توجد علامات مرجعية'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {isUsingLocalStorage ? 
                      'سجل الدخول لمزامنة علاماتك المرجعية عبر الأجهزة' : 
                      'قم بإضافة علامات مرجعية للعودة إليها لاحقاً'}
                  </p>
                  {isUsingLocalStorage && auth.currentUser && (
                    <button
                      onClick={manualRefreshBookmarks}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
                      disabled={retrying}
                    >
                      {retrying ? 'جاري المزامنة...' : 'مزامنة العلامات المرجعية'}
                    </button>
                  )}
                </div>
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

        {/* Migration Success Message */}
        {showMigrationSuccess && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
            <svg className="w-6 h-6 ml-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{migrationMessage || 'تمت مزامنة العلامات المرجعية بنجاح'}</span>
          </div>
        )}

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
