import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import SurahCards from "./SurahCards";
import QuranSearchResults from "./QuranSearchResults";
import { surahNames, surahNumToPagesMap, quranPages } from "../assets/data/quran-info";
import { quranText } from "../assets/data/quranKFGQPC-data";
import { convertAlifToAlifWasl } from "../utility/text-utilities";
import { useSurahSettings } from "../contexts/surah-settings-context";

function SurahsSection() {
  const [surahs, setSurahs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [orderBy, setOrderBy] = useState("descending");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingQuran, setIsSearchingQuran] = useState(false);
  const [searchMode, setSearchMode] = useState("surah"); // "surah" or "quran"
  const { onSurahSettingsChange } = useSurahSettings();

  useEffect(() => {
    let subscribed = true;
    (async function getSurahs() {
      if (subscribed) {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const processedData = await response.json();
        setSurahs(processedData["data"]);
      }
    })();
    return () => {
      subscribed = false;
    };
  }, []);

  // Search functionality
  const performQuranSearch = (searchTerm) => {
    if (searchTerm.length < 3) {
      setIsSearchingQuran(false);
      setSearchResults([]);
      return;
    }

    setIsSearchingQuran(true);
    const results = [];

    // Convert quranText Map to searchable format
    const quranData = {};
    quranText.forEach((surahAyahs, surahNum) => {
      quranData[surahNum] = surahAyahs;
    });

    Object.entries(quranData).forEach(([surahNum, ayahs]) => {
      ayahs.forEach((ayah) => {
        const ayahText = ayah.aya_text_emlaey; // Use the clean Arabic text as requested
        if (ayahText && ayahText.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            surahNumber: parseInt(surahNum),
            surahName: surahNames[parseInt(surahNum)],
            verse: ayah.aya_no,
            page: ayah.page,
            juz: ayah.jozz,
            text: ayahText,
            searchTerm: searchTerm
          });
        }
      });
    });

    setSearchResults(results.slice(0, 50)); // Limit results to avoid overwhelming UI
  };

  // Handle search input changes
  const handleSearchChange = (value) => {
    setSearchText(value);

    if (searchMode === "surah") {
      // For surah search, no minimum length required
      setIsSearchingQuran(false);
      setSearchResults([]);
    } else if (searchMode === "quran") {
      // For Quran search, require minimum 3 characters
      if (value.length >= 3) {
        performQuranSearch(value);
      } else {
        setIsSearchingQuran(false);
        setSearchResults([]);
      }
    }
  };

  // Handle navigation to search result
  const handleNavigateToResult = (result) => {
    // Use the existing navigation mechanism
    onSurahSettingsChange({
      currentSurah: result.surahNumber,
      currentPage: result.page,
      currentVerse: result.verse,
    });
  };

  const surahsToShow =
    searchText === ""
      ? surahs
      : surahs.filter((surah) => {
          return (
            surah.name.includes(searchText) ||
            convertAlifToAlifWasl(surahNames[surah.number]).includes(
              convertAlifToAlifWasl(searchText)
            )
          );
        });

  return (
    <div id="SurahsSection" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white mb-4">
            اختر سورة للقراءة
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            تصفح واختر من بين 114 سورة من القرآن الكريم مع إمكانية البحث والتصفح السهل
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              placeholder={
                searchMode === "surah"
                  ? "ابحث عن سورة بالأسم أو الرقم..."
                  : "ابحث في القرآن الكريم (3 أحرف على الأقل)..."
              }
              className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                searchMode === "quran" ? 'border-emerald-300 dark:border-emerald-600' : 'border-gray-200 dark:border-gray-700'
              }`}
              maxLength={50}
              value={searchText}
              onChange={(e) => {
                handleSearchChange(e.target.value);
              }}
            />
          </div>

          {/* Search Mode Toggle */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => {
                  setSearchMode("surah");
                  setSearchText("");
                  setIsSearchingQuran(false);
                  setSearchResults([]);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  searchMode === "surah"
                    ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                البحث عن السور
              </button>
              <button
                onClick={() => {
                  setSearchMode("quran");
                  setSearchText("");
                  setIsSearchingQuran(false);
                  setSearchResults([]);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  searchMode === "quran"
                    ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                البحث عن آية في القرآن بأكمله
              </button>
            </div>
          </div>
        </div>
        {searchMode != "quran" && (
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => {
              setOrderBy(orderBy == "descending" ? "ascending" : "descending");
            }}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-6 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              رتب السور
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {orderBy == "descending" ? "تصاعدياً ↑" : "تنازلياً ↓"}
            </span>
          </button>
        </div>
        )}

        {/* Show surah cards only when in surah search mode */}
        {searchMode === "surah" && (
          <SurahCards
            surahs={
              searchText === ""
                ? (orderBy == "descending" ? surahs : [...surahs].reverse())
                : (orderBy == "descending" ? surahsToShow : [...surahsToShow].reverse())
            }
            isSearching={searchText !== ""}
          />
        )}

        {/* Show Quran search results when doing Quran search */}
        {searchMode === "quran" && (
          <>
            {isSearchingQuran ? (
              <QuranSearchResults
                searchResults={searchResults}
                searchText={searchText}
                onNavigate={handleNavigateToResult}
              />
            ) : (
              /* Show initial state for Quran search mode */
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📖</div>
                <p className="text-xl text-gray-600 dark:text-gray-400">البحث في القرآن الكريم</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">
                  اكتب 3 أحرف على الأقل لبدء البحث في النص القرآني
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SurahsSection;
