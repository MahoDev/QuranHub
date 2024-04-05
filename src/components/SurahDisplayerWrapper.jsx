import React from "react";
import { useParams, Navigate } from "react-router-dom";
import SurahDisplayer from "../pages/SurahDisplayer";

function SurahDisplayerWrapper({ quranText, isDarkMode }) {
  const { surahNumber } = useParams();

  if (isNaN(+surahNumber) || +surahNumber < 1 || +surahNumber > 114) {
    return <Navigate to="/surah/1" />;
  }

  return <SurahDisplayer isDarkMode={isDarkMode} quranText={quranText} />;
}

export default SurahDisplayerWrapper;
