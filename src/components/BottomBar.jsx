import React, { useRef, useState, useEffect } from "react";
import { surahNames, tafseerTypes } from "../assets/data/quran-info";
import { FaArrowLeft, FaArrowRight, FaBars, FaFont, FaChevronDown, FaChevronUp } from "react-icons/fa";
import OutsideClickHandler from "./OutsideClickHandler";

function BottomBar({
	surahData,
	isSideBarDisplayed,
	onSideBarDisplayedChange,
	onPageChange,
	tafsirModeActive,
	currentTafsirId,
	fontSize,
	onDisplayStateChange,
	isListeningMode, // Add this prop to know if audio player is present
	audioPlayerVisible, // Add this prop to know if audio player is visible
	onVisibilityChange, // Callback to notify parent of visibility changes
}) {
	const [tafsirBoxVisible, setIsTafirBoxVisible] = useState(false);
	const [fontBoxVisible, setFontBoxVisible] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const scrollToRef = useRef();

	// Notify parent when visibility changes
	useEffect(() => {
		if (onVisibilityChange) {
			onVisibilityChange(isVisible);
		}
	}, [isVisible, onVisibilityChange]);

	// Keyboard shortcut for bottom bar minimize/maximize (B key)
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Don't interfere with input fields, textareas, or when typing
			if (
				event.target.tagName === 'INPUT' ||
				event.target.tagName === 'TEXTAREA' ||
				event.target.contentEditable === 'true'
			) {
				return;
			}

			if (event.key === 'b' || event.key === 'B') {
				event.preventDefault();
				// Toggle bottom bar visibility and close any open dropdowns
				setIsVisible(!isVisible);
				setTafirBoxVisible(false);
				setFontBoxVisible(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isVisible]);

	return (
		<>
			{/* Floating Toggle Button - Shows when bar is hidden */}
			{!isVisible && (
				<button
					onClick={() => setIsVisible(true)}
					className={`fixed  left-16 transform -translate-x-1/2 z-[11] bg-emerald-700/95 hover:bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl flex items-center gap-2 ${
						isListeningMode && audioPlayerVisible ? "bottom-[100px]" : "bottom-4"
					}`}
					title="إظهار شريط التحكم"
				>
					<FaChevronUp className="text-lg" />
					<span className="font-semibold">التحكم</span>
				</button>
			)}

			{/* Bottom Bar */}
			<div
				id="bottombar"
				className={`fixed w-full  min-w-full z-[10] left-0 bg-emerald-800/95 dark:bg-emerald-900/95 text-white shadow-lg transition-all duration-300 h-[85px] p-4 pt-5 border-t border-emerald-700/50 ${
					isVisible ? "bottom-0" : "bottom-[-100px]"
				}`}
			>
				{/* Hide Toggle Button */}
				<button
					onClick={() => {
						setIsVisible(false);
						setTafirBoxVisible(false);
						setFontBoxVisible(false);
					}}
					className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-emerald-700/80 hover:bg-emerald-600 rounded-full p-2 transition-all duration-200"
					title="إخفاء شريط التحكم"
				>
					<FaChevronDown className="text-sm" />
				</button>

				<div className="flex justify-between w-full items-center">
					<div className="flex gap-4 items-center">
						{/* Navigation Controls */}
						<div className="flex gap-3">
							<div
								onClick={(e) => {
									onPageChange("backward");
								}}
								className="flex items-center gap-2 p-3 cursor-pointer border-2 border-emerald-600 hover:border-white hover:bg-emerald-700 rounded-xl transition-all duration-200 hover:shadow-lg"
							>
								<FaArrowRight className="text-xl" />
								<span className="hidden sm:inline font-semibold">السابق</span>
							</div>
							<div
								onClick={(e) => {
									onPageChange("forward");
								}}
								className="flex items-center gap-2 p-3 cursor-pointer border-2 border-emerald-600 hover:border-white hover:bg-emerald-700 rounded-xl transition-all duration-200 hover:shadow-lg"
							>
								<span className="hidden sm:inline font-semibold">التالي</span>
								<FaArrowLeft className="text-xl" />
							</div>
						</div>

						{/* Font Size Control */}
						<div className="flex gap-3 items-center">
							<div
								className={`flex gap-2 items-center select-none p-3 cursor-pointer border-2 rounded-xl transition-all duration-200 ${
									fontBoxVisible
										? "bg-white text-emerald-800 border-white shadow-lg"
										: "border-emerald-600 hover:border-white hover:bg-emerald-700 hover:shadow-md"
								}`}
								id="fontBoxToggler"
								onClick={() => {
									setFontBoxVisible(!fontBoxVisible);
								}}
							>
								<span className="font-semibold">الخط</span>
								<FaFont className="text-lg" />
							</div>

							<OutsideClickHandler
								onOutsideClick={() => {
									setFontBoxVisible(false);
								}}
								excludedSelectors={["#fontBox", "#fontBoxToggler"]}
							>
								<div
									id="fontBox"
									className={`${
										!fontBoxVisible ? "hidden" : ""
									} absolute right-20 translate-y-[-140px] rounded-xl p-4 w-[200px] bg-white/95 dark:bg-gray-800/95 text-black dark:text-white shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-[20]`}
								>
									<div className="flex items-center justify-between mb-3">
										<span className="font-semibold">حجم الخط</span>
										<div className="flex gap-2">
											<button
												className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors duration-200"
												onClick={() => {
													onDisplayStateChange({
														fontSize: fontSize === 9 ? fontSize : fontSize + 1,
													});
												}}
											>
												+
											</button>
											<span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
												{fontSize - 2}
											</span>
											<button
												className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors duration-200"
												onClick={() => {
													onDisplayStateChange({
														fontSize: fontSize === 3 ? fontSize : fontSize - 1,
													});
												}}
											>
												−
											</button>
										</div>
									</div>
								</div>
							</OutsideClickHandler>
						</div>
					</div>

					{/* Tafsir and Navigation Controls */}
					<div className="flex gap-3 items-center">
						{/* Tafsir Toggle */}
						<div className="flex items-center space-x-3 rtl:space-x-reverse">
							<div className="relative">
								<OutsideClickHandler
									onOutsideClick={() => {
										setIsTafirBoxVisible(false);
									}}
									excludedSelectors={["#tafseerBox", "#tafseerBoxToggler"]}
								>
									<div
										id="tafseerBox"
										className={`${
											!tafsirBoxVisible ? "hidden" : ""
										} absolute bottom-full left-0 mb-2 rounded-xl p-4 w-[220px] bg-white/95 dark:bg-gray-800/95 text-black dark:text-white shadow-lg border border-gray-200/50 dark:border-gray-700/50 z-[20] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-emerald-800/30`}
									>
										<div className="flex items-center justify-between mb-4">
											<label htmlFor="toggle" className="cursor-pointer flex items-center gap-4">
												<span className="font-bold">إظهار التفسير</span>
												<div className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
													tafsirModeActive
														? "bg-emerald-600"
														: "bg-gray-300 dark:bg-gray-600"
												}`}>
													<input
														type="checkbox"
														id="toggle"
														className="hidden"
														checked={tafsirModeActive}
														onChange={() => {
															onDisplayStateChange({
																tafsirModeActive: !tafsirModeActive,
															});
														}}
													/>
													<div
														className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
															tafsirModeActive
																? "translate-x-7 bg-emerald-500"
																: "translate-x-0 bg-gray-400"
														}`}
													>
														{tafsirModeActive && (
															<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
																<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
															</svg>
														)}
													</div>
												</div>
											</label>
										</div>
										<div className="space-y-2">
											{Object.keys(tafseerTypes).map((tafId) => {
												return (
													<div
														key={tafseerTypes[tafId]}
														className={`${
															tafId == currentTafsirId ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200" : "hover:bg-gray-100 dark:hover:bg-gray-700"
														} p-2 rounded-lg cursor-pointer transition-colors duration-200`}
														onClick={() => {
															onDisplayStateChange({ tafsirId: tafId });
														}}
													>
														{tafseerTypes[tafId]}
													</div>
												);
											})}
										</div>
									</div>
								</OutsideClickHandler>

								<button
									id="tafseerBoxToggler"
									className={`p-3 cursor-pointer border-2 rounded-xl select-none transition-all duration-200 font-semibold ${
										tafsirBoxVisible
											? "bg-white text-emerald-800 border-white shadow-lg"
											: "border-emerald-600 hover:border-white hover:bg-emerald-700 hover:shadow-md"
									}`}
									onClick={() => {
										setIsTafirBoxVisible(!tafsirBoxVisible);
									}}
								>
									التفسير
								</button>
							</div>

							{/* Sidebar Toggle */}
							<div
								className={`flex gap-2 items-center hover:cursor-pointer select-none p-3 cursor-pointer border-2 rounded-xl transition-all duration-200 ${
									isSideBarDisplayed
										? "bg-white text-emerald-800 border-white shadow-lg"
										: "border-emerald-600 hover:border-white hover:bg-emerald-700 hover:shadow-md"
								}`}
								id="sidebarToggler"
								onClick={() => {
									onSideBarDisplayedChange(!isSideBarDisplayed);
								}}
							>
								<span className="font-semibold hidden sm:inline-block">الانتقال</span>
								<FaBars className="text-xl min-w-[15px]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default BottomBar;
