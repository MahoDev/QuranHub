import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SurahDisplayer from "./pages/SurahDisplayer";
import { useEffect, useState } from "react";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.add("dark:bg-[rgb(33,33,33)]");
  }, []);

  useEffect(() => {
    document.documentElement.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  return (
    <div>
      <Navbar isDarkMode={isDarkMode} onDarkModeChange={setIsDarkMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element="Sign in page" />
        <Route path="/signup" element="Sign up page" />
        <Route
          path="/surah/:surahNumber"
          element={<SurahDisplayer isDarkMode={isDarkMode} />}
        />
        <Route path="*" element="Page not found" />
      </Routes>
    </div>
  );
}

export default App;
