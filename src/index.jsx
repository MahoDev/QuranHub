import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { BrowserRouter } from "react-router-dom";
import DisplaySettingsProvider from "./contexts/display-settings-context";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DisplaySettingsProvider>
        <App />
      </DisplaySettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
