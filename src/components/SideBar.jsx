import React, { useEffect, useRef, useState } from "react";
import {
  quranPages,
  surahNames,
  surahNumToPagesMap,
} from "../assets/data/quran-info";
import { juzData, hizbData } from "../assets/data/quran-structure";
import JuzSelector from "./JuzSelector";
import HizbSelector from "./HizbSelector";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { convertAlifToAlifWasl } from "../utility/text-utilities";

function SideBar({
  surahData,
  currentPage,
  currentVerse,
  handleSurahSettingsChange,
  onVerseNavigation,
}) {
  const [filter, setFilter] = useState("Surahs"); //Surahs || Pages || Verses || Juz || Hizb
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const surahNumber = surahData[0]?.sura_no;
  const focusStyle = "bg-emerald-700 focus";
  const scrollToRef = useRef(null);
  let content = "";

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, [filter]);

  const applySearch = (filter) => {
    let searchResults = null;
    if (filter === "Surahs") {
      searchResults = Object.keys(surahNames).filter((surahNum) => {
        return convertAlifToAlifWasl(surahNames[surahNum]).includes(
          convertAlifToAlifWasl(searchText)
        );
      });
    } else if (filter === "Pages") {
      searchResults = quranPages.filter((page) => page == searchText);
    } else if (filter === "Juz") {
      searchResults = juzData.filter(juz => 
        searchText ? juz.number.toString() === searchText || 
        convertAlifToAlifWasl(juz.commonName || "").includes(convertAlifToAlifWasl(searchText)) : true
      );
    } else if (filter === "Hizb") {
      searchResults = hizbData.filter(hizb => 
        searchText ? hizb.number.toString() === searchText : true
      );
    } else if (filter === "Verses") {
      // Search by both text content and verse number
      searchResults = surahData.filter((ayah) => {
        // Check if search text matches verse number
        const matchesNumber = ayah.aya_no == searchText;
        
        // Check if search text matches verse content
        const matchesText = convertAlifToAlifWasl(ayah.aya_text_emlaey).includes(
          convertAlifToAlifWasl(searchText)
        );
        
        return matchesNumber || matchesText;
      });
    }
    return searchResults;
  };

  if (filter === "Surahs") {
    const searchResults = applySearch(filter);
    content =
      searchResults.length != 0 ? (
        searchResults.map((surahNum) => {
          return (
            <div
              key={surahNum}
              onClick={() => {
                navigate(`/surah/${+surahNum}`);
                handleSurahSettingsChange({
                  currentSurah: +surahNum,
                  currentVerse: 1,
                  currentPage: surahNumToPagesMap[+surahNum][0],
                });
              }}
              ref={surahNumber === +surahNum ? scrollToRef : null}
              className={`${
                surahNumber === +surahNum ? "bg-emerald-600 text-white" : "hover:bg-emerald-700/50"
              } p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md`}
            >
              <div className="font-medium">{surahNames[surahNum]}</div>
              <div className="text-xs text-emerald-200 mt-1">سورة رقم {surahNum}</div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-emerald-200">
          <div className="text-4xl mb-2">🔍</div>
          <p>لم يتم العثور على سورة</p>
        </div>
      );
  } else if (filter == "Pages") {
    const searchResults = applySearch(filter);
    const toBeMapped = searchResults.length == 1 ? searchResults : quranPages;
    content = toBeMapped.map((page) => {
      return (
        <div
          key={page}
          onClick={() => {
            const desiredSurahNum = Object.keys(surahNumToPagesMap).find(
              (surahNum) => {
                return (
                  page >= surahNumToPagesMap[surahNum][0] &&
                  page <= surahNumToPagesMap[surahNum][1]
                );
              }
            );
            const firstVerseInPage = surahData?.find((ayahObj) => {
              return ayahObj.page == page;
            })?.aya_no;

            navigate(`/surah/${desiredSurahNum}`);
            handleSurahSettingsChange({
              currentPage: page,
              currentVerse: firstVerseInPage || 1,
              currentSurah: +desiredSurahNum,
            });
          }}
          ref={page === currentPage ? scrollToRef : null}
          className={`${
            page == currentPage ? "bg-emerald-600 text-white" : "hover:bg-emerald-700/50"
          } p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md`}
        >
          <div className="font-medium">صفحة {page}</div>
        </div>
      );
    });

    if (searchText != "" && searchResults.length == 0) {
      content = (
        <div className="text-center py-8 text-emerald-200">
          <div className="text-4xl mb-2">📄</div>
          <p>لا يوجد صفحة بهذا الرقم</p>
        </div>
      );
    }
  } else if (filter === "Juz") {
    const searchResults = applySearch(filter);
    content = searchResults.length > 0 ? (
      <div className="grid grid-cols-1 gap-3">
        {searchResults.map((juz) => (
          <div
            key={juz.number}
            onClick={() => {
              navigate(`/surah/${juz.startSurah}`);
              handleSurahSettingsChange({
                currentSurah: juz.startSurah,
                currentVerse: juz.startAyah,
                currentPage: juz.startPage,
              });
            }}
            className="p-4 rounded-lg cursor-pointer bg-emerald-700/20 hover:bg-emerald-700/30 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{juz.name}</div>
                {juz.commonName && (
                  <div className="text-emerald-300 text-sm mt-1">{juz.commonName}</div>
                )}
              </div>
              <div className="text-xs px-3 py-1 rounded-full bg-emerald-600/30">
                صفحة {juz.startPage}
              </div>
            </div>
            <div className="text-emerald-200/70 text-sm mt-2">
              يبدأ من: {surahNames[juz.startSurah]} - آية {juz.startAyah}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-emerald-200">
        <div className="text-4xl mb-2">📖</div>
        <p>لا يوجد جزء بهذا الرقم</p>
      </div>
    );
  } else if (filter === "Hizb") {
    const searchResults = applySearch(filter);
    content = searchResults.length > 0 ? (
      <div className="grid grid-cols-1 gap-3">
        {searchResults.map((hizb) => (
          <div
            key={hizb.number}
            onClick={() => {
              navigate(`/surah/${hizb.startSurah}`);
              handleSurahSettingsChange({
                currentSurah: hizb.startSurah,
                currentVerse: hizb.startAyah,
                currentPage: juzData[hizb.juz - 1].startPage,
              });
            }}
            className="p-4 rounded-lg cursor-pointer bg-emerald-700/20 hover:bg-emerald-700/30 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{hizb.name}</div>
                <div className="text-emerald-300 text-sm mt-1">
                  {juzData[hizb.juz - 1].name}
                </div>
              </div>
              <div className="text-xs px-3 py-1 rounded-full bg-emerald-600/30">
                {hizb.quarters.length} أرباع
              </div>
            </div>
            <div className="text-emerald-200/70 text-sm mt-2">
              يبدأ من: {surahNames[hizb.startSurah]} - آية {hizb.startAyah}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {hizb.quarters.map((quarter, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/surah/${quarter.startSurah}`);
                    handleSurahSettingsChange({
                      currentSurah: quarter.startSurah,
                      currentVerse: quarter.startAyah,
                    });
                  }}
                  className="text-center p-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 cursor-pointer text-sm"
                >
                  ربع {index + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-emerald-200">
        <div className="text-4xl mb-2">📖</div>
        <p>لا يوجد حزب بهذا الرقم</p>
      </div>
    );
  } else if (filter === "Verses") {
    const searchResults = applySearch(filter);
    const toBeMapped = searchResults.length > 0 ? searchResults : surahData;

    content = toBeMapped.map((ayah) => {
      const isMatch = searchResults.includes(ayah);
      const displayText = ayah.aya_text_emlaey.length > 60
        ? ayah.aya_text_emlaey.substring(0, 60) + "..."
        : ayah.aya_text_emlaey;

      return (
        <div
          key={ayah.aya_no}
          onClick={() => {
            const pageHoldingAyah = surahData.find(
              (ayahObj) => ayahObj.aya_no == ayah.aya_no
            ).page;

            handleSurahSettingsChange({
              currentPage: pageHoldingAyah,
              currentVerse: ayah.aya_no,
            });

            // Trigger highlighting for verse navigation
            if (onVerseNavigation) {
              onVerseNavigation(ayah.aya_no);
            }
          }}
          ref={ayah.aya_no === currentVerse ? scrollToRef : null}
          className={`${
            ayah.aya_no === currentVerse ? "bg-emerald-600 text-white" : "hover:bg-emerald-700/50"
          } ${isMatch ? "ring-2 ring-amber-400" : ""} p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2">
              <div className={`text-sm leading-relaxed ${isMatch ? "font-bold text-amber-200" : ""}`}>
                {displayText}
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${isMatch ? "bg-amber-400 text-emerald-800" : "bg-emerald-600/50 text-emerald-200"}`}>
              {ayah.aya_no}
            </div>
          </div>
        </div>
      );
    });

    if (searchText != "" && searchResults.length == 0) {
      content = (
        <div className="text-center py-8 text-emerald-200">
          <div className="text-4xl mb-2">📖</div>
          <p>لا توجد نتائج للبحث</p>
        </div>
      );
    }
  }

  return (
    <div
      id="sidebar"
      className="fixed left-0 top-0 text-white bg-emerald-800/95 dark:bg-emerald-900/95 w-[280px] h-[calc(100vh-80px)] p-6 overflow-y-hidden z-[2] border-r border-emerald-700/50 shadow-2xl"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center mb-4 text-emerald-100">التنقل السريع</h2>
        <ul className="flex gap-2 justify-center mb-4 flex-wrap">
          {[
            { key: "Surahs", label: "السور", active: filter === "Surahs" },
            { key: "Pages", label: "الصفحات", active: filter === "Pages" },
            { key: "Verses", label: "الآيات", active: filter === "Verses" },
            { key: "Juz", label: "الأجزاء", active: filter === "Juz" },
            { key: "Hizb", label: "الأحزاب", active: filter === "Hizb" }
          ].map(({ key, label, active }) => (
            <li
              key={key}
              className={`pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-emerald-700/50 border-b-2 border-amber-400 text-amber-300"
                  : "hover:bg-emerald-700/30 text-emerald-100"
              }`}
              onClick={() => {
                setFilter(key);
                setSearchText("");
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center w-full h-12 p-3 mb-4 rounded-xl border-2 border-emerald-600 bg-emerald-800/50 focus-within:border-amber-400 transition-colors duration-200">
        <input
          placeholder={
            filter === "Surahs" ? "أدخل اسم السورة" :
            filter === "Pages" ? "أدخل رقم الصفحة" :
            filter === "Verses" ? "أدخل رقم الآية أو نص البحث" :
            filter === "Juz" ? "أدخل رقم الجزء" :
            filter === "Hizb" ? "أدخل رقم الحزب" :
            ""
          }
          className="h-full w-full outline-none bg-transparent text-white placeholder:text-emerald-200 placeholder:text-sm"
          maxLength={50}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <FaSearch className="text-emerald-200 text-xl bg-emerald-700/50 p-2 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors duration-200" />
      </div>

      <div className="overflow-y-scroll h-[75%] space-y-2 scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-emerald-800/30">
        {content}
      </div>
    </div>
  );
}

export default SideBar;
