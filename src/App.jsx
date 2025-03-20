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
import { Helmet } from "react-helmet-async";

function App() {
	const [isDarkMode, setIsDarkMode] = useState(
		useDisplaySettings().displaySettings.isDarkMode
	);
	const [quranText, setQuranText] = useState(null);
	const [currentUser, setCurrentUser] = useState(auth.currentUser);
	const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();
	const { surahNumber } = useParams();

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
							<SurahDisplayerWrapper
								quranText={quranText}
								isDarkMode={isDarkMode}
							/>
						)
					}
				/>

				<Route path="*" element={<Home />} />

				{/* <Route
					path="*"
					element={
						<div className="flex flex-col items-center gap-3 mt-[50%] text-center dark:text-white ">
							<h1>لا توجد صفحة بهذا الرابط</h1>
							<Link
								to="/"
								className="w-44 text-white font-bold py-3 px-6 rounded-full bg-emerald-800 hover:bg-emerald-700 dark:bg-amber-500 hover:dark:bg-amber-400"
							>
								الصفحة الرئيسية
							</Link>
						</div>
					}
				/> */}
			</Routes>
		</div>
	);
}

export default App;
