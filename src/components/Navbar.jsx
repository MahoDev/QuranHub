import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBookOpen, FaMoon, FaSun, FaUser, FaListUl } from "react-icons/fa";
import { useMedia } from "react-use";
import OutsideClickHandler from "./OutsideClickHandler";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

function Navbar({ isDarkMode, onDarkModeChange, currentUser }) {
	const isMediumScreen = useMedia("(min-width: 768px)");
	const [menuDisplayed, setMenuDisplayed] = useState(isMediumScreen);
	const navigate = useNavigate();
	const location = useLocation();

	// Handle navigation to sections with proper scrolling
	const handleNavClick = (sectionId) => {
		// If not on homepage, navigate to homepage first
		if (location.pathname !== '/') {
			navigate('/');
			// Wait for navigation to complete, then scroll instantly
			setTimeout(() => {
				scrollToSection(sectionId);
			}, 10);
		} else {
			scrollToSection(sectionId);
		}
		// Close mobile menu if open
		if (!isMediumScreen) {
			setMenuDisplayed(false);
		}
	};

	const scrollToSection = (sectionId) => {
		const section = document.getElementById(sectionId);
		if (section) {
			section.scrollIntoView({
				behavior: 'auto',
				block: 'start'
			});
		}
	};

	return (
		<div className="navbar-element px-8 z-[1] bg-white/90 dark:bg-gray-900/90 drop-shadow-lg sticky w-full top-0 border-b border-emerald-200/50 dark:border-emerald-700/50">
			<ul className="flex justify-between items-center pt-4 pb-4 text-emerald-900 dark:text-white">
				<li className="font-extrabold">
					<Link to="/" className="flex items-center space-x-1 rtl:space-x-reverse group">
						<span className="text-2xl mx-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-200">
							منصة القرآن
						</span>
						<FaBookOpen className="inline-block mt-[2px] pr-2 mb-1 group-hover:text-emerald-600 transition-colors duration-200" size="30" />
					</Link>
				</li>
				<li className="relative md:flex">
					<FaUser
						id="menuBoxToggler"
						className="text-xl cursor-pointer w-6 h-6 md:hidden hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
						onClick={() => {
							setMenuDisplayed(!menuDisplayed);
						}}
					/>
					<OutsideClickHandler
						onOutsideClick={() => {
							if (!isMediumScreen) {
								setMenuDisplayed(false);
							}
						}}
						excludedSelectors={["#menuBox", "#menuBoxToggler"]}
					>
						<ul
							id="menuBox"
							className={`${!isMediumScreen ? 'absolute w-[280px] left-0 top-[50px] z-3 flex flex-col items-center gap-4 px-6 py-4 bg-white/95 dark:bg-gray-800/95 border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl rounded-2xl' : 'static flex-row z-0 w-auto bg-transparent border-none shadow-none dark:bg-transparent gap-6 justify-end'} ${!isMediumScreen ? (menuDisplayed ? 'flex' : 'hidden') : 'flex'}`}
						>
							<li className="md:order-1">
								<button
									onClick={() => handleNavClick('SurahsSection')}
									className={`font-bold px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all duration-200 block text-center hover:shadow-md transform hover:-translate-y-0.5 ${!isMediumScreen ? 'w-full' : 'w-auto'}`}
								>
									السور
								</button>
							</li>
							<li className="md:order-2">
								<button
									onClick={() => handleNavClick('JuzHizbSection')}
									className={`font-bold px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all duration-200 block text-center bg-emerald-50 dark:bg-emerald-900/30 hover:shadow-md transform hover:-translate-y-0.5 ${!isMediumScreen ? 'w-full' : 'w-auto'}`}
								>
									📑 الأجزاء والأحزاب
								</button>
							</li>
							{currentUser == null ||
							(currentUser != null && currentUser.emailVerified == false) ? (
								<>
									<li className="md:order-3">
										<Link
											to="user/login"
											className={`font-bold px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors duration-200 block text-center hover:shadow-md transform hover:-translate-y-0.5 ${!isMediumScreen ? 'w-full' : 'w-auto'}`}
										>
											تسجيل الدخول
										</Link>
									</li>
									<li className="md:order-4">
										<Link
											to="user/signup"
											className={`text-white font-bold py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 block text-center ${!isMediumScreen ? 'w-full' : 'w-auto'}`}
										>
											تسجيل
										</Link>
									</li>
								</>
							) : (
								<>
									<li className="md:order-3">
										<Link
											to="user/profile"
											className={`text-white font-bold py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 block text-center ${!isMediumScreen ? 'w-full' : 'w-auto'}`}
										>
											الحساب الشخصي
										</Link>
									</li>
									<li className="md:order-4">
										<button
											className={`text-white font-bold py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 block text-center ${!isMediumScreen ? 'w-full' : 'w-auto'}`}
											onClick={() => {
												signOut(auth);
											}}
										>
											تسجيل الخروج
										</button>
									</li>
								</>
							)}
							<li className="md:order-5 text-gray-700 dark:text-white">
								{isDarkMode ? (
									<FaSun
										className="cursor-pointer text-4xl hover:text-yellow-500 transition-colors duration-200 p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
										onClick={() => {
											onDarkModeChange(!isDarkMode);
										}}
									/>
								) : (
									<FaMoon
										className="cursor-pointer text-4xl hover:text-blue-600 transition-colors duration-200 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
										onClick={() => {
											onDarkModeChange(!isDarkMode);
										}}
									/>
								)}
							</li>
						</ul>
					</OutsideClickHandler>
				</li>
			</ul>
		</div>
	);
}

export default Navbar;
