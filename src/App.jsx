import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SurahDisplayer from "./pages/SurahDisplayer";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import ResetPasswordConfirmation from "./pages/ResetPasswordConfirmation";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Profile from "./pages/Profile";
import { useDisplaySettings } from "./contexts/display-settings-context";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    useDisplaySettings().displaySettings.isDarkMode
  );
  const [quranText, setQuranText] = useState(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();

  const SurahWrapper = ({ children }) => {
    const { surahNumber } = useParams();
    const isValidSurah = surahNumber >= 1 && surahNumber <= 114;

    return isValidSurah ? children : <Navigate to="surah/1" replace />;
  };

  const handleDarkModeChange = (value) => {
    onDisplaySettingsChange({ ...displaySettings, isDarkMode: value });
    setIsDarkMode(value);
  };

  useEffect(() => {
    document.body.classList.add("dark:bg-[rgb(33,33,33)]");
  }, []);

  useEffect(() => {
    async function getQuranText() {
      try {
        const quranModule = await import(`./assets/data/quranKFGQPC-data.js`);
        setQuranText(quranModule.quranText);
      } catch (error) {
        console.error("Error importing Quran text:", error);
      }
    }

    getQuranText();
  }, []);

  useEffect(() => {
    document.documentElement.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  //onAuthStateChanged doesn't detect emailVerified changes
  useEffect(() => {
    setCurrentUser(auth.currentUser);
  }, [auth?.currentUser?.emailVerified]);

  return (
    <div>
      <Navbar
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onDarkModeChange={handleDarkModeChange}
      />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="user"
          element={
            <div>
              <Outlet />
            </div>
          }
        >
          {currentUser == null ||
          (currentUser != null && currentUser.emailVerified == false) ? (
            <>
              <Route path="login" element={<Login />} />
              <Route path="reset" element={<ResetPassword />} />
              <Route
                path="reset-confirmation"
                element={<ResetPasswordConfirmation />}
              />
              <Route path="signup" element={<Signup />} />
            </>
          ) : (
            <Route path="profile" element={<Profile />} />
          )}
        </Route>

        <Route
          path="/surah/:surahNumber"
          element={
            <SurahWrapper>
              <SurahDisplayer isDarkMode={isDarkMode} quranText={quranText} />
            </SurahWrapper>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
