import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";

function Profile() {
  const [bookmarks, setBookmarks] = useState([]);
  const [sortByDate, setSortByDate] = useState(true); // true for descending, false for ascending
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user bookmarks from the database
    const fetchBookmarks = async () => {
      try {
        const userBookmarks = [
          {
            surahNumber: 10,
            surahName: "يونس",
            pageNumber: 212,
            ayahNumber: 27,
            ayahText:
              "هُوَ ٱلَّذِيٓ أَنزَلَ عَلَيۡكَ ٱلۡكِتَٰبَ مِنۡهُ ءَايَٰتٞ مُّحۡكَمَٰتٌ هُنَّ أُمُّ ٱلۡكِتَٰبِ وَأُخَرُ مُتَشَٰبِهَٰتٞۖ فَأَمَّا ٱلَّذِينَ فِي قُلُوبِهِمۡ زَيۡغٞ فَيَتَّبِعُونَ مَا تَشَٰبَهَ مِنۡهُ ٱبۡتِغَآءَ ٱلۡفِتۡنَةِ وَٱبۡتِغَآءَ تَأۡوِيلِهِۦۖ وَمَا يَعۡلَمُ تَأۡوِيلَهُۥٓ إِلَّا ٱللَّهُۗ وَٱلرَّٰسِخُونَ فِي ٱلۡعِلۡمِ يَقُولُونَ ءَامَنَّا بِهِۦ كُلّٞ مِّنۡ عِندِ رَبِّنَاۗ وَمَا يَذَّكَّرُ إِلَّآ أُوْلُواْ ٱلۡأَلۡبَٰبِ",
            bookmarkDate: new Date("2023-12-15"),
          },
          {
            surahNumber: 3,
            surahName: "آل عمران",

            pageNumber: 51,
            ayahNumber: 10,
            ayahText:
              "هُوَ ٱلَّذِيٓ أَنزَلَ عَلَيۡكَ ٱلۡكِتَٰبَ مِنۡهُ ءَايَٰتٞ مُّحۡكَمَٰتٌ هُنَّ أُمُّ ٱلۡكِتَٰبِ وَأُخَرُ مُتَشَٰبِهَٰتٞۖ فَأَمَّا ٱلَّذِينَ فِي قُلُوبِهِمۡ زَيۡغٞ فَيَتَّبِعُونَ مَا تَشَٰبَهَ مِنۡهُ ٱبۡتِغَآءَ ٱلۡفِتۡنَةِ وَٱبۡتِغَآءَ تَأۡوِيلِهِۦۖ وَمَا يَعۡلَمُ تَأۡوِيلَهُۥٓ إِلَّا ٱللَّهُۗ وَٱلرَّٰسِخُونَ فِي ٱلۡعِلۡمِ يَقُولُونَ ءَامَنَّا بِهِۦ كُلّٞ مِّنۡ عِندِ رَبِّنَاۗ وَمَا يَذَّكَّرُ إِلَّآ أُوْلُواْ ٱلۡأَلۡبَٰبِ",

            bookmarkDate: new Date("2024-01-20"),
          },
          {
            surahNumber: 2,
            surahName: "البقرة",
            pageNumber: 3,
            ayahNumber: 10,
            ayahText:
              "هُوَ ٱلَّذِيٓ أَنزَلَ عَلَيۡكَ ٱلۡكِتَٰبَ مِنۡهُ ءَايَٰتٞ مُّحۡكَمَٰتٌ هُنَّ أُمُّ ٱلۡكِتَٰبِ وَأُخَرُ مُتَشَٰبِهَٰتٞۖ فَأَمَّا ٱلَّذِينَ فِي قُلُوبِهِمۡ زَيۡغٞ فَيَتَّبِعُونَ مَا تَشَٰبَهَ مِنۡهُ ٱبۡتِغَآءَ ٱلۡفِتۡنَةِ وَٱبۡتِغَآءَ تَأۡوِيلِهِۦۖ وَمَا يَعۡلَمُ تَأۡوِيلَهُۥٓ إِلَّا ٱللَّهُۗ وَٱلرَّٰسِخُونَ فِي ٱلۡعِلۡمِ يَقُولُونَ ءَامَنَّا بِهِۦ كُلّٞ مِّنۡ عِندِ رَبِّنَاۗ وَمَا يَذَّكَّرُ إِلَّآ أُوْلُواْ ٱلۡأَلۡبَٰبِ",

            bookmarkDate: new Date("2024-02-10"),
          },
        ];
        setBookmarks(userBookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };
    fetchBookmarks();
  }, []);

  const handleDeleteAccount = async () => {
    setShowConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      // Call a function to delete the user's account

      navigate("/login"); // Redirect to login page after successful deletion
    } catch (error) {
      console.error("Error deleting account:", error);
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
    const today = new Date();
    sortedBookmarks = sortedBookmarks.filter(
      (bookmark) => (today - bookmark.bookmarkDate) / (1000 * 3600 * 24) <= 7
    ); // Show bookmarks added in the last 7 days
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">الحساب الشخصي</h1>
      <h2 className="text-xl text-center font-semibold mb-4 dark:text-white">
        النقاط المرجعية
      </h2>
      {/* Sorting and Filtering UI */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleSortOrder}
          className="mr-4 bg-emerald-500 dark:bg-emerald-800 hover:bg-emerald-600 text-white py-2 px-4 rounded-full"
        >
          {sortByDate ? "ترتيب حسب الأقدم" : "ترتيب حسب الأحدث"}
        </button>
        <button
          onClick={toggleRecentFilter}
          className="bg-emerald-500  hover:bg-emerald-600 dark:bg-emerald-800 text-white py-2 px-4 rounded-full"
        >
          {showOnlyRecent ? "إظهار الكل" : "عرض الأحدث فقط"}
        </button>
      </div>

      {/* Display user bookmarks */}
      <div className="mb-8">
        <div className="overflow-auto">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedBookmarks.map((bookmark, index) => (
              <li
                key={index}
                className="bg-white dark:bg-emerald-800 border-2 border-gray-300 dark:border-none  shadow-md dark:shadow-lg rounded-lg p-4 hover:shadow-lg transition duration-300"
              >
                <p className="text-lg font-semibold mb-2 dark:text-white">
                  السورة: {bookmark.surahName}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  الصفحة: {bookmark.pageNumber}
                </p>
                <p className="text-gray-600 dark:text-gray-300 truncate hover:overflow-visible  hover:whitespace-normal">
                  الآية: {bookmark.ayahText}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  وقت الاضافة: {bookmark.bookmarkDate.toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-xl font-semibold mb-4">
              هل أنت متأكد من رغبتك في حذف الحساب؟
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-full mr-2"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
