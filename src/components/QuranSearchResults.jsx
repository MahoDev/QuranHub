import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurahSettings } from '../contexts/surah-settings-context';
import { surahNames, surahNumToPagesMap } from '../assets/data/quran-info';

function QuranSearchResults({ searchResults, searchText, onNavigate }) {
  const navigate = useNavigate();
  const { onSurahSettingsChange } = useSurahSettings();

  const handleResultClick = (result) => {
    // Navigate to the surah page and set the correct position
    navigate(`/surah/${result.surahNumber}`);
    onSurahSettingsChange({
      currentSurah: result.surahNumber,
      currentPage: result.page,
      currentVerse: result.verse,
    });

    // Also call the parent's onNavigate callback if provided
    if (onNavigate) {
      onNavigate(result);
    }
  };

  const highlightSearchText = (text, searchText) => {
    if (!searchText || !text) return text;

    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchText.toLowerCase()) {
        return (
          <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🔍</div>
        <p className="text-xl text-gray-600 dark:text-gray-400">لم يتم العثور على نتائج</p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          جرب كلمات بحث مختلفة أو أقصر
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          تم العثور على <span className="font-bold text-emerald-600">{searchResults.length}</span> نتيجة لـ "{searchText}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((result, index) => (
          <div
            key={`${result.surahNumber}-${result.page}-${result.verse}-${index}`}
            onClick={() => handleResultClick(result)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-lg px-3 py-2">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                  {surahNames[result.surahNumber]}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  الآية {result.verse}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  الصفحة {result.page}
                </div>
              </div>
            </div>

            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {highlightSearchText(result.text, searchText)}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>اضغط للانتقال إلى الموضع</span>
                <span className="text-emerald-600">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuranSearchResults;
