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
			}, 25);
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
				behavior: 'instant',
				block: 'start'
			});
		}
	};

	// Consistent button styling
	const getButtonClasses = (variant = 'default', isFullWidth = false) => {
		const baseClasses = `font-semibold px-4 py-2 rounded-lg transition-all duration-200 text-center hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center ${isFullWidth ? 'w-full' : 'w-auto'}`;
		
		switch (variant) {
			case 'primary':
				return `${baseClasses} text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl`;
			case 'secondary':
				return `${baseClasses} bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100`;
			case 'danger':
				return `${baseClasses} text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl`;
			case 'theme':
				return 'cursor-pointer text-2xl hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center justify-center';
			default:
				return `${baseClasses} hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100`;
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
				<li className="relative md:flex items-center">
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
							className={`${!isMediumScreen ? 'absolute w-[280px] left-0 top-[50px] z-3 flex flex-col items-center gap-3 px-6 py-4 bg-white/95 dark:bg-gray-800/95 border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl rounded-2xl' : 'static flex-row z-0 w-auto bg-transparent border-none shadow-none dark:bg-transparent gap-4 justify-end items-center'} ${!isMediumScreen ? (menuDisplayed ? 'flex' : 'hidden') : 'flex'}`}
						>
							<li className="md:order-1 flex items-center">
								<button
									onClick={() => handleNavClick('SurahsSection')}
									className={getButtonClasses('secondary', !isMediumScreen)}
								>
									السور
								</button>
							</li>
							<li className="md:order-2 flex items-center">
								<button
									onClick={() => handleNavClick('JuzHizbSection')}
									className={getButtonClasses('secondary', !isMediumScreen)}
								>
									الأجزاء والأحزاب
								</button>
							</li>
							{/* Profile link - always visible */}
							<li className="md:order-3 flex items-center">
								<Link
									to="user/profile"
									className={getButtonClasses(currentUser?.emailVerified ? 'primary' : 'secondary', !isMediumScreen)}
								>
									{currentUser?.emailVerified ? 'الحساب الشخصي' : 'العلامات المرجعية'}
								</Link>
							</li>

							{/* Auth buttons - shown when not logged in */}
							{(currentUser == null ||
							(currentUser != null && currentUser.emailVerified == false)) ? (
								<>
									<li className="md:order-4 flex items-center">
										<Link
											to="user/login"
											className={getButtonClasses('default', !isMediumScreen)}
										>
											تسجيل الدخول
										</Link>
									</li>
									<li className="md:order-5 flex items-center">
										<Link
											to="user/signup"
											className={getButtonClasses('primary', !isMediumScreen)}
										>
											تسجيل
										</Link>
									</li>
								</>
							) : (
								/* Logout button - shown when logged in */
								<li className="md:order-4 flex items-center">
									<button
										className={getButtonClasses('danger', !isMediumScreen)}
										onClick={() => {
											signOut(auth);
										}}
									>
										تسجيل الخروج
									</button>
								</li>
							)}
							<li className="md:order-6 flex items-center text-gray-700 dark:text-white">
								{isDarkMode ? (
									<FaSun
										className={`${getButtonClasses('theme')} w-10 h-10`}
										onClick={() => {
											onDarkModeChange(!isDarkMode);
										}}
									/>
								) : (
									<FaMoon
										className={`${getButtonClasses('theme')} w-10 h-10`}
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
