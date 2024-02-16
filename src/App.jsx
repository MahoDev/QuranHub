import { Outlet, Route, Routes, useLocation } from "react-router-dom";
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

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quranText, setQuranText] = useState(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    document.body.classList.add("dark:bg-[rgb(33,33,33)]");
  }, []);

  useEffect(() => {
    async function getQuranText() {
      try {
        const quranData = await import(`./assets/data/quranKFGQPC-data.json`);
        setQuranText(quranData.default);
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
        onDarkModeChange={setIsDarkMode}
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
            quranText && (
              <SurahDisplayer isDarkMode={isDarkMode} quranText={quranText} />
            )
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
