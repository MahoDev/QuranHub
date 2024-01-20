import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import SurahCards from "./SurahCards";
import { surahNames } from "../assets/data/quran-info";

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
        /*
        "number": 112,
        "name": "سُورَةُ الإِخۡلَاصِ",
        "englishName": "Al-Ikhlaas",
        "englishNameTranslation": "Sincerity",
        "numberOfAyahs": 4,
        "revelationType": "Meccan" 
        */
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
          console.log(surah.name);
          return (
            surah.name.includes(searchText) ||
            surahNames[surah.number].includes(searchText)
          );
        });

  return (
    <div id="SurahsSection" className="container">
      <h2 className="text-center text-3xl my-10 text-emerald-950 dark:text-white">
        اختر سورة
      </h2>
      <div className="filters flex justify-center h-[30px]">
        <div className="flex items-center w-fit h-12 p-2 rounded-lg border-solid border-2 border-stone-400 border-opacity-70">
          <input
            placeholder="ماذا تريد أن تقرأ؟"
            className="h-full w-[99%] outline-none bg-transparent dark:text-white dark:caret-slate-200"
            maxLength={20}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
          <FaSearch className="text-white text-3xl bg-emerald-700 p-2 rounded-full cursor-pointer" />
        </div>
      </div>
      <div
        className="mt-20 mb-4 sm:my-8 dark:text-white hover:bg-gray-400/50 w-fit hover:rounded cursor-pointer select-none"
        onClick={() => {
          setOrderBy(orderBy == "descending" ? "ascending" : "descending");
        }}
      >
        <p className="inline-block">رتب السور</p>{" "}
        <span className="font-bold">
          {orderBy == "descending" ? "تصاعدياً" + " ▲" : "تنازلياً" + " ▼"}
        </span>
      </div>
      <SurahCards
        surahs={
          orderBy == "descending" ? surahsToShow : [...surahsToShow].reverse()
        }
        isSearching={searchText != ""}
      />
    </div>
  );
}

export default SurahsSection;
