import { createContext, useContext, useState } from "react";

const defaultDisplaySettings = {
  tafsirModeActive: false,
  displayMode: "reading",
  tafsirId: 16,
  isDarkMode: false,
  fontSize: 3,
  recitationId: 30,
  volume: 1,
  bitrate: null,
};

if (localStorage.getItem("displaySettings") == null) {
  localStorage.setItem(
    "displaySettings",
    JSON.stringify(defaultDisplaySettings)
  );
}

const displaySettingsContext = createContext();

export default function DisplaySettingsProvider({ children }) {
  const [displaySettings, setDisplaySettings] = useState(
    JSON.parse(localStorage.getItem("displaySettings"))
  );

  const onDisplaySettingsChange = (newValue) => {
    localStorage.setItem("displaySettings", JSON.stringify(newValue));

    setDisplaySettings(newValue);
  };

  return (
    <displaySettingsContext.Provider
      value={{
        displaySettings,
        onDisplaySettingsChange,
      }}
    >
      {children}
    </displaySettingsContext.Provider>
  );
}

export const useDisplaySettings = () => {
  return useContext(displaySettingsContext);
};
