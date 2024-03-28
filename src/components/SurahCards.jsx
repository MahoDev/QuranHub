import { useState } from "react";
import SurahCard from "./SurahCard";
import { useNavigate } from "react-router-dom";
import { useSurahSettings } from "../contexts/surah-settings-context";
import { surahNumToPagesMap } from "../assets/data/quran-info";

function SurahCards({ surahs, isSearching }) {
  const { surahSettings, onSurahSettingsChange } = useSurahSettings();

  const [displayAll, setDisplayAll] = useState(false);
  const navigate = useNavigate();
  const surahsToDisplay = [];
  console.log(surahs.length);
  let limit = isSearching ? surahs.length - 1 : displayAll == false ? 15 : 113;

  for (let i = 0; i <= limit; i++) {
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
    <div className="min-h-[400px]">
      <div className="flex justify-center flex-wrap gap-4 mb-10">
        {surahsToDisplay.length != 0 ? (
          surahsToDisplay
        ) : (
          <p>لم يتم العثور على سورة</p>
        )}
      </div>
      <button
        onClick={() => setDisplayAll(true)}
        className={
          displayAll || isSearching
            ? "hidden"
            : "" +
              " w-[200px] block m-auto py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full"
        }
      >
        اظهر جميع السور
      </button>
    </div>
  );
}

export default SurahCards;
