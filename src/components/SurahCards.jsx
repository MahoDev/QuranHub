import { useState, useRef, useEffect } from "react";
import SurahCard from "./SurahCard";
import { useNavigate } from "react-router-dom";
import { useSurahSettings } from "../contexts/surah-settings-context";
import { surahNumToPagesMap } from "../assets/data/quran-info";

function SurahCards({ surahs, isSearching }) {
  const { surahSettings, onSurahSettingsChange } = useSurahSettings();
  const [displayAll, setDisplayAll] = useState(false);
  const [prevDisplayAll, setPrevDisplayAll] = useState(false);
  const navigate = useNavigate();
  const surahsSectionRef = useRef(null);

  // Function to scroll to the SurahsSection
  const scrollToSurahsSection = () => {
    const surahsSection = document.getElementById('SurahsSection');
    if (surahsSection) {
      surahsSection.scrollIntoView({
        behavior: 'instant',
        block: 'start'
      });
    }
  };

  // Effect to scroll when displayAll changes from true to false
  useEffect(() => {
    if (prevDisplayAll === true && displayAll === false) {
      scrollToSurahsSection();
    }
    setPrevDisplayAll(displayAll);
  }, [displayAll, prevDisplayAll]);

  // Show more surahs when searching or when "show all" is clicked
  const surahsToDisplay = [];
  let limit = isSearching ? surahs.length : displayAll ? surahs.length : 15;

  for (let i = 0; i < Math.min(limit, surahs.length); i++) {
    surahsToDisplay.push(
      <SurahCard
        key={surahs[i]?.name}
        order={surahs[i]?.number}
        onClick={() => {
          navigate(`/surah/${surahs[i]?.number}`);
          onSurahSettingsChange({
            currentSurah: surahs[i]?.number,
            currentPage: surahNumToPagesMap[surahs[i]?.number][0],
            currentVerse: 1,
          });
        }}
        name={surahs[i]?.name}
        versesCount={surahs[i]?.numberOfAyahs}
        type={surahs[i]?.revelationType}
      />
    );
  }

  return (
    <div className="min-h-[400px]" ref={surahsSectionRef}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {surahsToDisplay.length != 0 ? (
          surahsToDisplay
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">لم يتم العثور على سورة</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">جرب كلمات بحث مختلفة</p>
          </div>
        )}
      </div>

      {/* Show More/Less buttons */}
      {!isSearching && surahs.length > 15 && (
        <div className="text-center">
          {!displayAll ? (
            <button
              onClick={() => setDisplayAll(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              عرض جميع السور ({surahs.length})
            </button>
          ) : (
            <button
              onClick={() => setDisplayAll(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              عرض أقل
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SurahCards;
