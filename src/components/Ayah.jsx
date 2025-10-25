import { useEffect, useRef, useState } from "react";
import { convertToArabicNumbers } from "../utility/text-utilities";
import { playWordPronunciation, stopWordPronunciation } from "../utility/audio-utilities";
import { useBookmarks } from "../contexts/bookmark-context";

function Ayah({
  ayahData,
  currentVerse,
  handleSurahSettingsChange,
  onCurrentWordChange,
  mode, // Add mode prop
  surahNumber,
  surahName,
  pageNumber,
}) {
  const versesText = ayahData["aya_text"].startsWith(
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
  )
    ? ayahData["aya_text"].slice(38)
    : ayahData["aya_text"].slice(0, ayahData["aya_text"].length - 2);
  //example of "ayaText" = ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ ﰁ

  const versesWords = versesText.split(" ");
  const highlightedAyah = useRef();
  const ayahNumberRef = useRef();
  const tooltipRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipType, setTooltipType] = useState(""); // "word" or "ayah"
  const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(false);
  const [bookmarkTooltipPosition, setBookmarkTooltipPosition] = useState({ x: 0, y: 0 });
  const [showAyahBookmarkTooltip, setShowAyahBookmarkTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState(null);
  const [isClicking, setIsClicking] = useState(false);
  const [showListeningToast, setShowListeningToast] = useState(false);

  const { toggleBookmark, isBookmarked, loading: bookmarkLoading } = useBookmarks();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      stopWordPronunciation();
    };
  }, []);

  useEffect(() => {
    if (mode === 'listening' && currentVerse && currentVerse.surahNo === ayahData["sura_no"] && currentVerse.verseNo === ayahData["aya_no"]) {
      setTimeout(() => {
        const verseElement = document.querySelector(`[data-verse-number="${currentVerse.verseNo}"][data-surah-number="${currentVerse.surahNo}"]`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [currentVerse, mode]);

  useEffect(() => {
    if (highlightedAyah.current && currentVerse && currentVerse.surahNo === ayahData["sura_no"] && currentVerse.verseNo === ayahData["aya_no"]) {
      highlightedAyah.current.scrollIntoView({ block: "center" });
    }
  }, [currentVerse]);

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
      // Show toast notification instead of tooltip
      setShowListeningToast(true);
      setTimeout(() => setShowListeningToast(false), 3000);
    } else {
      handleSurahSettingsChange({ currentVerse: ayahData["aya_no"] });
    }
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();

    const success = await toggleBookmark(
      surahNumber,
      surahName,
      pageNumber,
      ayahData["aya_no"],
      ayahData["aya_text"]
    );

    if (success) {
      setShowBookmarkTooltip(true);
      setTimeout(() => setShowBookmarkTooltip(false), 2000);
    }
  };

  const handleAyahNumberMouseEnter = (e) => {
    if (ayahNumberRef.current) {
      const rect = ayahNumberRef.current.getBoundingClientRect();
      setBookmarkTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowAyahBookmarkTooltip(true);
  };

  const handleAyahNumberMouseLeave = (e) => {
    // Only hide if not clicking and mouse is not moving towards tooltip
    if (isClicking) return;

    // Add longer delay before hiding tooltip to allow mouse movement to tooltip
    const timeout = setTimeout(() => {
      setShowAyahBookmarkTooltip(false);
    }, 250); // Increased from 150ms to 500ms
    setTooltipTimeout(timeout);
  };

  const handleTooltipMouseEnter = () => {
    // Clear timeout when hovering over tooltip
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
  };

  const handleTooltipMouseLeave = () => {
    // Don't hide if clicking
    if (isClicking) return;

    // Add longer delay when leaving tooltip to allow mouse to return
    const timeout = setTimeout(() => {
      setShowAyahBookmarkTooltip(false);
    }, 250); // Increased delay for tooltip mouse leave
    setTooltipTimeout(timeout);
  };

  const handleBookmarkButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Set clicking state to prevent tooltip from hiding
    setIsClicking(true);

    // Immediately hide tooltip
    setShowAyahBookmarkTooltip(false);
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }

    // Execute bookmark action
    const success = await toggleBookmark(
      surahNumber,
      surahName,
      pageNumber,
      ayahData["aya_no"],
      ayahData["aya_text"]
    );

    if (success) {
      setShowBookmarkTooltip(true);
      setTimeout(() => setShowBookmarkTooltip(false), 2000);
    }

    // Clear clicking state after a short delay
    setTimeout(() => {
      setIsClicking(false);
    }, 100);
  };

  const handleClickOutside = (e) => {
    // Hide tooltip when clicking outside both ayah number and tooltip
    if (showAyahBookmarkTooltip &&
        !ayahNumberRef.current?.contains(e.target) &&
        !tooltipRef.current?.contains(e.target)) {
      setShowAyahBookmarkTooltip(false);
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        setTooltipTimeout(null);
      }
    }
  };

  useEffect(() => {
    if (showAyahBookmarkTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAyahBookmarkTooltip]);

  const ayahIsBookmarked = isBookmarked(surahNumber, ayahData["aya_no"]);

  return (
    <div
      ref={currentVerse && currentVerse.surahNo === ayahData["sura_no"] && currentVerse.verseNo === ayahData["aya_no"] ? highlightedAyah : null}
      data-verse-number={ayahData["aya_no"]}
      data-surah-number={ayahData["sura_no"]}
      className={`inline ${currentVerse && currentVerse.surahNo === ayahData["sura_no"] && currentVerse.verseNo === ayahData["aya_no"] ? "text-emerald-700" : ""}`}
    >
      <div className="inline">
        {versesWords.map((word, index) => {
          return (
            <p
              key={`${ayahData["sura_no"]}:${ayahData["aya_no"]}:${index + 1}`}
              className={`inline hover:text-emerald-700 hover:cursor-pointer ${
                currentVerse && currentVerse.surahNo === ayahData["sura_no"] && currentVerse.verseNo === ayahData["aya_no"]
                  ? "hover:text-emerald-900"
                  : ""
              }`}
              onClick={(e) => handleWordClick(e, index)}
            >
              {word + " "}
            </p>
          );
        })}
      </div>
      <span
        ref={ayahNumberRef}
        className={`hover:cursor-pointer relative ${ayahIsBookmarked ? 'text-emerald-600' : ''}`}
        onClick={handleAyahClick}
        onMouseEnter={handleAyahNumberMouseEnter}
        onMouseLeave={handleAyahNumberMouseLeave}
      >
        {" "}
        {convertToArabicNumbers(ayahData["aya_no"])}
        {" "}
        {/* Bookmark indicator for bookmarked ayahs */}
        {ayahIsBookmarked && (
          <span className="absolute -top-1 -right-2 text-xs opacity-70">🔖</span>
        )}
      </span>

      {/* Bookmark tooltip - appears only on ayah number hover */}
      {showAyahBookmarkTooltip && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm px-3 py-2 rounded-lg shadow-lg`}
          style={{
            left: bookmarkTooltipPosition.x,
            top: bookmarkTooltipPosition.y - 40,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="flex items-center gap-2">
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs transition-colors duration-200"
              onClick={handleBookmarkButtonClick}
              disabled={bookmarkLoading}
            >
              {ayahIsBookmarked ? 'إزالة مرجع' : 'حفظ مرجع'}
            </button>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-200 dark:border-t-emerald-700"></div>
        </div>
      )}

      {/* Bookmark success tooltip */}
      {showBookmarkTooltip && (
        <div
          className="fixed z-50 bg-emerald-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: bookmarkTooltipPosition.x,
            top: bookmarkTooltipPosition.y - 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div className="relative">
            {ayahIsBookmarked ? "تم حفظ العلامة المرجعية" : "تم إزالة العلامة المرجعية"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-800"></div>
          </div>
        </div>
      )}

      {/* Word pronunciation tooltip */}
      {showTooltip && tooltipType === "word" && (
        <div
          className="fixed z-50 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="relative">
            تم تشغيل النطق
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}

      {/* Listening mode toast notification */}
      {showListeningToast && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg"
          style={{
            animation: 'toastFadeDown 3s ease-out forwards'
          }}
        >
          <div className="flex items-center gap-2">
            <span>حَوِّلْ إِلَى وضع الاستماع للاستماع إلى الآية كاملة</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastFadeDown {
          0% {
            opacity: 1;
            transform: translateX(-60%) translateY(-150%);
          }
          100% {
            opacity: 0;
            transform: translateX(-60%) translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default Ayah;
