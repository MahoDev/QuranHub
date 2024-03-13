import React, { useEffect, useState } from "react";
import { surahNames, quranPages } from "../assets/data/quran-info";
import { auth, firestore } from "../config/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

function AddBookmarkForm({ currentSurahNum, currentPage, ayahsInCurrentPage }) {
  const [pageNumber, setPageNumber] = useState(currentPage);
  const [ayahNumber, setAyahNumber] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAddBookmark = async () => {
    try {
      const ayahText = ayahsInCurrentPage?.find(
        (ayah) => ayahNumber == ayah.aya_no
      )?.aya_text;

      const bookmarkObj = {
        userId: auth.currentUser.uid,
        surahNumber: currentSurahNum,
        surahName: surahNames[currentSurahNum],
        pageNumber: currentPage,
        ayahNumber: ayahNumber,
        ayahText: ayahText?.slice(0, ayahText?.length - 2),
        bookmarkDate: Timestamp.fromDate(new Date()),
      };
      const collectionRef = collection(firestore, "bookmarks");

      await addDoc(collectionRef, bookmarkObj);
      setSuccess(true);
      setError("");
    } catch (err) {
      console.error("Error adding bookmark: " + err.message);
      setError("فشل الحفظ");
      setSuccess(false);
    } finally {
      if (auth.currentUser === null) {
        setError("يجب تسجيل الدخول أولا");
      }
      setTimeout(() => {
        setSuccess(false);
        setError("");
      }, 3000); // Clear success or error message after 3 seconds
    }
  };

  useEffect(() => {
    const firstAyahInPage = ayahsInCurrentPage?.at(0)?.aya_no;
    setAyahNumber(firstAyahInPage);
    setPageNumber(currentPage);
  }, [currentPage]);

  return (
    <div className="text-black dark:text-white text-center  ">
      <h2 className="text-lg font-semibold">احفظ نقطة مرجعية</h2>
      <div className="flex flex-col  md:flex-row gap-1  justify-center items-center">
        <div>
          <p>السورة</p>
          <input
            type="text"
            className="w-[150px] text-center py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md  focus:outline-none focus:border-emerald-500"
            value={surahNames[currentSurahNum]}
            title={surahNames[currentSurahNum]}
            readOnly
            disabled
          />
        </div>
        <div>
          <p>الصفحة</p>
          <input
            type="text"
            className="w-[150px]  text-center md:px-[50px] py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md  focus:outline-none focus:border-emerald-500"
            value={pageNumber}
            readOnly
            disabled
          />
        </div>
        <div>
          <p>اختر الآية</p>
          <select
            className="w-[150px] md:px-[50px] py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-emerald-500"
            value={ayahNumber}
            onChange={(e) => setAyahNumber(e.target.value)}
            required
          >
            {/* Iterate over your list of ayahs and render options */}
            {ayahsInCurrentPage?.map((ayah) => (
              <option key={ayah?.id} value={ayah?.aya_no}>
                {ayah?.aya_no}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md  md:self-end translate-y-[-2px] "
          onClick={handleAddBookmark}
        >
          حفظ
        </button>
      </div>
      <div className=" absolute bottom--6 right-[50%] translate-x-[50%]  ">
        {success && <p className="text-green-500">تم الحفظ بنجاح</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default AddBookmarkForm;
