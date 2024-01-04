import React, { useEffect, useRef, useState } from "react";
import { quranPages, surahNames, surahNumToPagesMap } from "../data/quran-info";
import { useNavigate } from "react-router-dom";

function SideBar({ surahData, currentPage, currentVerse, setCurrentVerse }) {
  const [filter, setFilter] = useState("Surahs"); //Surahs || Pages || Verses
  const navigate = useNavigate();
  const surahNumber = surahData[0].sura_no;
  const focusStyle = "bg-emerald-700";
  const scrollToRef = useRef(null);
  let content = "";

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, [filter]);

  if (filter === "Surahs") {
    content = Object.keys(surahNames).map((surahNum) => {
      return (
        <div
          key={surahNum}
          onClick={() => {
            navigate(`/surah/${surahNum}`);
          }}
          ref={surahNumber === +surahNum ? scrollToRef : null}
          className={`${
            surahNumber === +surahNum ? focusStyle : ""
          } hover:bg-emerald-700 p-1 cursor-pointer`}
        >
          {surahNames[surahNum]}
        </div>
      );
    });
  } else if (filter == "Pages") {
    content = quranPages.map((page) => {
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
            navigate(`/surah/${desiredSurahNum}`, {
              state: { desiredPage: page },
            });
          }}
          ref={page === currentPage ? scrollToRef : null}
          className={`${
            page === currentPage ? focusStyle : ""
          } hover:bg-emerald-700 p-1 cursor-pointer`}
        >
          {page}
        </div>
      );
    });
  } else {
    content = surahData.map((ayah) => {
      return (
        <div
          onClick={() => {
            const pageHoldingAyah = surahData.find(
              (ayahObj) => ayahObj.aya_no === ayah.aya_no
            ).page;
            navigate(`/surah/${surahNumber}`, {
              state: { desiredPage: pageHoldingAyah },
            });
            setCurrentVerse(ayah.aya_no);
          }}
          ref={ayah.aya_no === currentVerse ? scrollToRef : null}
          className={`${
            ayah.aya_no === currentVerse ? focusStyle : ""
          } hover:bg-emerald-700 p-1 cursor-pointer`}
        >
          {ayah.aya_no}
        </div>
      );
    });
  }

  return (
    <div
      id="sidebar"
      className="fixed left-0 top-0 text-white  bg-emerald-800/70 w-[240px] h-[calc(100vh-80px)]  p-6 overflow-y-hidden z-[2]"
    >
      <ul className="flex gap-4 justify-center mb-1">
        <li
          className={
            (filter === "Surahs"
              ? "border-b-2 hover:border-amber-400/100"
              : "") +
            " pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer"
          }
          onClick={() => {
            setFilter("Surahs");
          }}
        >
          السور
        </li>
        <li
          className={
            (filter === "Pages"
              ? "border-b-2 hover:border-amber-400/100"
              : "") +
            " pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer"
          }
          onClick={() => {
            setFilter("Pages");
          }}
        >
          الصفحات
        </li>
        <li
          className={
            (filter === "Verses"
              ? "border-b-2 hover:border-amber-400/100"
              : "") +
            " pb-2 hover:border-b-2 hover:border-amber-400/70 border-amber-400 hover:cursor-pointer"
          }
          onClick={() => {
            setFilter("Verses");
          }}
        >
          الآيات
        </li>
      </ul>
      <div className="overflow-y-scroll h-[96%] space-y-1">{content}</div>
    </div>
  );
}

export default SideBar;
