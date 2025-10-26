import { Link, Outlet, Route, Routes } from "react-router-dom";
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
import { useParams, Navigate } from "react-router-dom";
import SurahDisplayerWrapper from "./components/SurahDisplayerWrapper.jsx";
import JuzHizbWrapper from "./components/JuzHizbWrapper.jsx";
import { BookmarkProvider } from "./contexts/bookmark-context";
import { Helmet } from "react-helmet-async";

function App() {
	const [isDarkMode, setIsDarkMode] = useState(
		useDisplaySettings().displaySettings.isDarkMode
	);
	const [quranText, setQuranText] = useState(null);
	const [currentUser, setCurrentUser] = useState(auth.currentUser);
	const [authLoading, setAuthLoading] = useState(true);
	const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();
	const { surahNumber } = useParams();

	const handleDarkModeChange = (value) => {
		onDisplaySettingsChange({ ...displaySettings, isDarkMode: value });
		setIsDarkMode(value);
	};

	useEffect(() => {
		document.body.classList.add("dark:bg-gray-800");
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
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setAuthLoading(false);
		});
		return unsubscribe;
	}, []);

	//onAuthStateChanged doesn't detect emailVerified changes
	useEffect(() => {
		setCurrentUser(auth.currentUser);
	}, [auth?.currentUser?.emailVerified]);

	// Show loading spinner while auth state is being determined
	if (authLoading) {
		return (
			<BookmarkProvider>
				<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
				</div>
			</BookmarkProvider>
		);
	}

	return (
		<BookmarkProvider>
			<div>
				<Helmet>
					<title>منصة القرآن</title> {/* Default title */}
					<meta name="description" content="" /> {/* Reset description */}
				</Helmet>
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
						{/* Auth routes */}
						{(currentUser == null ||
						(currentUser != null && currentUser.emailVerified == false)) && (
							<>
								<Route path="login" element={<Login />} />
								<Route path="reset" element={<ResetPassword />} />
								<Route
									path="reset-confirmation"
									element={<ResetPasswordConfirmation />}
								/>
								<Route path="signup" element={<Signup />} />
							</>
						)}
						{/* Profile is accessible to all users */}
						<Route path="profile" element={<Profile />} />
					</Route>

					<Route
						path="/surah/:surahNumber"
						element={
							quranText && (
								<SurahDisplayerWrapper
									quranText={quranText}
									isDarkMode={isDarkMode}
								/>
							)
						}
					/>

					{/* Juz and Hizb reading routes */}
					<Route
						path="/:type/:number"
						element={
							quranText && (
								<JuzHizbWrapper
									quranText={quranText}
									isDarkMode={isDarkMode}
								/>
							)
						}
					/>

					<Route path="*" element={<Home />} />
				</Routes>
			</div>
		</BookmarkProvider>
	);
}

export default App;
