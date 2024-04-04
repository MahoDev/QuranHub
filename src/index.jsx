import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { BrowserRouter } from "react-router-dom";
import DisplaySettingsProvider from "./contexts/display-settings-context";
import SurahSettingsProvider from "./contexts/surah-settings-context.jsx";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <DisplaySettingsProvider>
          <SurahSettingsProvider>
            <App />
          </SurahSettingsProvider>
        </DisplaySettingsProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
