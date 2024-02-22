// import { createContext, useContext, useEffect, useState } from "react";

// const defaultProgressSettings = {
//   surahNumber: 1,
//   currentPage: 1,
//   currentVerse: 1,
// };

// const defaultDisplaySettings = {
//   tafsirModeActive: false,
//   displayMode: "reading",
//   tafsirId: 16,
//   isDarkMode: false,
//   fontSize: 3,
//   recitationId: 30,
//   volume: 1,
//   bitrate: null,
// };

// if (
//   sessionStorage.getItem("progressSettings") == null &&
//   sessionStorage.getItem("displaySettings") == null
// ) {
//   sessionStorage.setItem(
//     "progressSettings",
//     JSON.stringify(defaultProgressSettings)
//   );
//   sessionStorage.setItem(
//     "displaySettings",
//     JSON.stringify(defaultDisplaySettings)
//   );
// }

// const latestSettingsContext = createContext();

// export default function LatestSettingsProvider({ children }) {
//   const [latestSettings, setLatestSettings] = useState(
//     JSON.parse(sessionStorage.getItem("latestSettings"))
//   );

//   const handleLatestSettingsChange = (latestSet) => {
//     sessionStorage.setItem("latestSettings", JSON.stringify(latestSet));
//     console.log(latestSet);

//     setLatestSettings(latestSet);
//   };

//   return (
//     <latestSettingsContext.Provider
//       value={{
//         progressSettings,
//         displaySettings,
//         handleLatestSettingsChange,
//       }}
//     >
//       {children}
//     </latestSettingsContext.Provider>
//   );
// }

// export const useLatestSettings = () => {
//   return useContext(latestSettingsContext);
// };
