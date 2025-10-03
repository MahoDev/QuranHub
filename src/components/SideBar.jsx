import React, { useEffect, useRef, useState } from "react";
import {
  quranPages,
  surahNames,
  surahNumToPagesMap,
} from "../assets/data/quran-info";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { convertAlifToAlifWasl } from "../utility/text-utilities";

function SideBar({
  surahData,
  currentPage,
  currentVerse,
  handleSurahSettingsChange,
}) {
  const [filter, setFilter] = useState("Surahs"); //Surahs || Pages || Verses || Text
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
                surahNumber === +surahNum ? focusStyle : ""
              } hover:bg-emerald-700 p-1 cursor-pointer`}
            >
              {surahNames[surahNum]}
            </div>
          );
        })
      ) : (
        <p>لم يتم العثور على سورة</p>
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
            page == currentPage ? focusStyle : ""
          } hover:bg-emerald-700 p-1 cursor-pointer`}
        >
          {page}
        </div>
      );
    });

    if (searchText != "" && searchResults.length == 0) {
      content = <p>لا يوجد صفحة بهذا الرقم</p>;
    }
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
          }}
          ref={ayah.aya_no === currentVerse ? scrollToRef : null}
          className={`${
            ayah.aya_no === currentVerse ? focusStyle : ""
          } hover:bg-emerald-700 p-1 cursor-pointer ${isMatch ? "bg-emerald-700/50" : ""}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2">
              <div className={`text-sm ${isMatch ? "font-bold" : ""}`}>
                {displayText}
              </div>
            </div>
            <div className="text-xs opacity-70">
              {ayah.aya_no}
            </div>
          </div>
        </div>
      );
    });

    if (searchText != "" && searchResults.length == 0) {
      content = <p>لا توجد نتائج للبحث</p>;
    }
  }

  return (
    <div
      id="sidebar"
      className="fixed left-0 top-0 text-white bg-emerald-800 w-[240px] h-[calc(100vh-80px)] p-5 overflow-y-hidden z-[2]"
    >
      <ul className="flex gap-2 justify-center mb-1 flex-wrap">
        <li
          className={
            (filter === "Surahs"
              ? "border-b-2 hover:border-amber-400/100"
              : "") +
            " pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer text-sm"
          }
          onClick={() => {
            setFilter("Surahs");
            setSearchText("");
          }}
        >
          السور
        </li>
        <li
          className={
            (filter === "Pages"
              ? "border-b-2 hover:border-amber-400/100"
              : "") +
            " pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer text-sm"
          }
          onClick={() => {
            setFilter("Pages");
            setSearchText("");
          }}
        >
          الصفحات
        </li>
        <li
          className={
            (filter === "Verses"
              ? "border-b-2 hover:border-amber-400/100"
              : "") +
            " pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer text-sm"
          }
          onClick={() => {
            setFilter("Verses");
            setSearchText("");
          }}
        >
          الآيات
        </li>
      </ul>
      <div className="flex items-center w-fit h-12 p-2 mb-2 rounded-lg border-solid border-2 border-stone-400 border-opacity-70 ">
        <input
          placeholder={
            filter === "Surahs"
              ? "أدخل اسم السورة"
              : filter === "Pages"
              ? "أدخل رقم الصفحة"
              : "أدخل رقم الآية أو نص البحث"
          }
          className="h-full w-[99%] outline-none bg-transparent dark:text-white dark:caret-slate-200 placeholder:text-sm"
          maxLength={50}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <FaSearch className="text-white text-3xl bg-emerald-700 p-2 rounded-full cursor-pointer" />
      </div>
      <div className="overflow-y-scroll h-[87%] space-y-1 scrollbar scrollbar-thumb-[rgb(231,231,231)] scrollbar-track-transparent ">
        {content}
      </div>
    </div>
  );
}

export default SideBar;
