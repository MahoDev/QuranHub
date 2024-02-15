import React, { useEffect, useState } from "react";
import { surahNames, quranPages } from "../assets/data/quran-info";

function AddBookmarkForm({ currentSurahNum, currentPage, ayahsInSurah }) {
  const [surahName, setSurahName] = useState(surahNames[currentSurahNum]);
  const [pageNumber, setPageNumber] = useState(currentPage);
  const [ayahNumber, setAyahNumber] = useState("");

  const handleAddBookmark = async () => {};

  useEffect(() => {
    setAyahNumber(
      ayahsInSurah.find((ayah) => ayah.page == currentPage)?.aya_no
    );
    setPageNumber(currentPage);
  }, [currentPage]);

  return (
    <div className="text-black dark:text-white text-center  ">
      <h2 className="text-lg font-semibold">احفظ نقطة مرجعية</h2>
      <div className="flex flex-col  md:flex-row gap-1  justify-center items-center">
        <div>
          <p>السورة</p>
          <select
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            value={surahName}
            onChange={(e) => setSurahName(e.target.value)}
            disabled
          >
            {/* Iterate over your list of surahs and render options */}
            <option value={surahNames[currentSurahNum]}>
              {surahNames[currentSurahNum]}
            </option>
          </select>
        </div>
        <div>
          <p>اختر الصفحة</p>
          <select
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            required
          >
            {/* Iterate over your list of pages and render options */}
            {quranPages.map((page) => {
              return (
                <option key={page} value={page}>
                  {page}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <p>اختر الآية</p>
          <select
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            value={ayahNumber}
            onChange={(e) => setAyahNumber(e.target.value)}
            required
          >
            {/* Iterate over your list of ayahs and render options */}
            {ayahsInSurah.map((ayah) => (
              <option key={ayah.id} value={ayah.aya_no}>
                {ayah.aya_no}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md inline md:self-end"
          onClick={handleAddBookmark}
        >
          حفظ
        </button>
      </div>
    </div>
  );
}

export default AddBookmarkForm;
