import { createContext, useContext, useState } from "react";

const defaultSurahSettings = {
  currentSurah: 1,
  currentPage: 1,
  currentVerse: 1,
  currentJuz: 1,
  currentHizb: 1,
  currentQuarter: 1,
};

if (sessionStorage.getItem("surahSettings") == null) {
  sessionStorage.setItem("surahSettings", JSON.stringify(defaultSurahSettings));
}

const surahSettingsContext = createContext();

export default function SurahSettingsProvider({ children }) {
  const [surahSettings, setSurahSettings] = useState(
    JSON.parse(sessionStorage.getItem("surahSettings"))
  );

  // Accept partial updates and merge with existing settings
  const onSurahSettingsChange = (newValue) => {
    const merged = { ...surahSettings, ...newValue };
    sessionStorage.setItem("surahSettings", JSON.stringify(merged));

    setSurahSettings(merged);
  };

  return (
    <surahSettingsContext.Provider
      value={{
        surahSettings,
        onSurahSettingsChange,
      }}
    >
      {children}
    </surahSettingsContext.Provider>
  );
}

export const useSurahSettings = () => {
  return useContext(surahSettingsContext);
};
