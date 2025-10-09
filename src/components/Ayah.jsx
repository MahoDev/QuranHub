import { useEffect, useRef, useState } from "react";
import { convertToArabicNumbers } from "../utility/text-utilities";
import { playWordPronunciation, stopWordPronunciation } from "../utility/audio-utilities";

function Ayah({
  ayahData,
  currentVerse,
  handleSurahSettingsChange,
  onCurrentWordChange,
  mode, // Add mode prop
}) {
  const versesText = ayahData["aya_text"].startsWith(
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
  )
    ? ayahData["aya_text"].slice(38)
    : ayahData["aya_text"].slice(0, ayahData["aya_text"].length - 2);
  //example of "ayaText" = ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ ﰁ

  const versesWords = versesText.split(" ");
  const highlightedAyah = useRef();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipType, setTooltipType] = useState(""); // "word" or "ayah"

  useEffect(() => {
    if (highlightedAyah.current && currentVerse) {
      highlightedAyah.current.scrollIntoView({ block: "center" });
    }
  }, [currentVerse]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      stopWordPronunciation();
    };
  }, []);

  const handleWordClick = async (e, index) => {
    if (mode === "reading") {
      // Play word pronunciation in reading mode
      const wordInfo = {
        surahNo: ayahData["sura_no"],
        ayahNo: ayahData["aya_no"],
        index: index + 1,
        hash: Math.floor(Math.random() * 1000),
      };

      await playWordPronunciation(wordInfo);
    } else {
      // Existing listening mode behavior
      onCurrentWordChange({
        surahNo: ayahData["sura_no"],
        ayahNo: ayahData["aya_no"],
        index: index + 1,
        hash: Math.floor(Math.random() * 1000),
      });
    }
  };

  const handleAyahClick = (e) => {
    if (mode === "reading") {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setTooltipType("ayah");
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    } else {
      handleSurahSettingsChange({ currentVerse: ayahData["aya_no"] });
    }
  };

  return (
    <div
      ref={ayahData["aya_no"] === currentVerse ? highlightedAyah : null}
      className={`${
        currentVerse && currentVerse === ayahData["aya_no"] ? "text-emerald-700" : ""
      } inline group relative`}
    >
      <div className="inline">
        {versesWords.map((word, index) => {
          return (
            <p
              key={`${ayahData["sura_no"]}:${ayahData["aya_no"]}:${index + 1}`}
              className={`${
                currentVerse === ayahData["aya_no"]
                  ? "hover:text-emerald-900"
                  : ""
              } inline hover:text-emerald-700 hover:cursor-pointer`}
              onClick={(e) => handleWordClick(e, index)}
            >
              {word + " "}
            </p>
          );
        })}
      </div>
      <span
        className="hover:cursor-pointer"
        onClick={handleAyahClick}
        onMouseEnter={(e) => {
          e.target.parentElement.classList.add(
            "hover:text-emerald-700",
            "hover:cursor-pointer"
          );
        }}
        onMouseLeave={(e) => {
          e.target.parentElement.classList.remove(
            "hover:text-emerald-700",
            "hover:cursor-pointer"
          );
        }}
      >
        {" "}
        {convertToArabicNumbers(ayahData["aya_no"])}{" "}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="relative">
            {tooltipType === "word"
              ? "تم تشغيل النطق"
              : "حَوِّلْ إِلَى وضع القراءة للاستماع إلى الآية كاملة"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ayah;
