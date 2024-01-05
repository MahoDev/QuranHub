import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import SurahCards from "./SurahCards";

function SurahsSection() {
  const [surahs, setSurahs] = useState([]);
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

  return (
    <div id="SurahsSection" className="container">
      <h2 className="text-center text-3xl my-10 text-emerald-950 dark:text-white">
        اختر سورة
      </h2>
      <div className="filters flex justify-center flex-wrap sm:justify-between h-[30px]">
        <ul className="flex items-center text-emerald-950 dark:text-white gap-4 p-2 h-12 rounded-full border-solid border-2 border-stone-400 border-opacity-70">
          <li className="activeFilter p-1">السور</li>
          <li>الاجزاء</li>
          <li>ترتيب الوحي</li>
        </ul>
        <div className="flex items-center w-auto h-12 p-2 rounded-full border-solid border-2 border-stone-400 border-opacity-70">
          <input
            placeholder="ماذا تريد أن تقرأ؟"
            className="h-full outline-none bg-transparent"
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
        surahs={orderBy == "descending" ? surahs : [...surahs].reverse()}
      />
    </div>
  );
}

export default SurahsSection;
