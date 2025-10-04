import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import SurahCards from "./SurahCards";
import { surahNames } from "../assets/data/quran-info";
import { convertAlifToAlifWasl } from "../utility/text-utilities";

function SurahsSection() {
  const [surahs, setSurahs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [orderBy, setOrderBy] = useState("descending");

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
              placeholder="ابحث عن سورة بالاسم أو الرقم..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              maxLength={50}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
          </div>
        </div>

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

        <SurahCards
          surahs={
            orderBy == "descending" ? surahsToShow : [...surahsToShow].reverse()
          }
          isSearching={searchText != ""}
        />
      </div>
    </div>
  );
}

export default SurahsSection;
