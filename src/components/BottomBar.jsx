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

	return (
		<>
			{/* Floating Toggle Button - Shows when bar is hidden */}
			{!isVisible && (
				<button
					onClick={() => setIsVisible(true)}
					className={`fixed left-1/2 transform -translate-x-1/2 z-[11] bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-2 ${
						isListeningMode ? "bottom-[90px]" : "bottom-4"
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
				className={`fixed w-full z-[10] left-0 bg-emerald-800 text-white shadow-lg transition-all duration-300 h-[81px] p-4 pt-5 ${
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
					className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-emerald-700 hover:bg-emerald-600 rounded-full p-1 transition-all"
					title="إخفاء شريط التحكم"
				>
					<FaChevronDown className="text-sm" />
				</button>

				<div className="flex justify-between w-full">
				<div className="flex gap-3 items-center">
					<div
						onClick={(e) => {
							onPageChange("backward");
						}}
						className="flex items-center gap-1 p-2 cursor-pointer border-2 border-emerald-800 hover:border-white hover:bg-emerald-700 rounded-lg transition-all"
					>
						<FaArrowRight className="text-xl" />
						<span className="hidden sm:inline font-semibold">السابق</span>
					</div>
					<div
						onClick={(e) => {
							onPageChange("forward");
						}}
						className="flex items-center gap-1 p-2 cursor-pointer border-2 border-emerald-800 hover:border-white hover:bg-emerald-700 rounded-lg transition-all"
					>
						<span className="hidden sm:inline font-semibold">التالي</span>
						<FaArrowLeft className="text-xl" />
					</div>
							<div
								className={`flex gap-2 items-center select-none p-2 cursor-pointer border-2 rounded-lg transition-all ${
									fontBoxVisible
										? "bg-white text-emerald-800 border-white"
										: "border-emerald-800 hover:border-white hover:bg-emerald-700"
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
									} absolute right-16 translate-y-[-192px] rounded-t-lg p-2 w-[180px] h-[150px]  text-black dark:text-white  bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none z-[20]`}
								>
							<div className="flex gap-2">
								<div>حجم الخط</div>
								<div
									className=" font-bold px-2 hover:cursor-pointer bg-emerald-700"
									onClick={() => {
										onDisplayStateChange({
											fontSize: fontSize === 9 ? fontSize : fontSize + 1,
										});
									}}
								>
									+
								</div>
								<div>{fontSize - 2}</div>
								<div
									className="font-bold px-2 hover:cursor-pointer  bg-emerald-700"
									onClick={() => {
										onDisplayStateChange({
											fontSize: fontSize === 3 ? fontSize : fontSize - 1,
										});
									}}
								>
									-
								</div>
							</div>
						</div>
							</OutsideClickHandler>
				</div>
				<div className="flex gap-2 items-center">
						<div className="flex items-center space-x-2 sm:space-x-4 p-1 relative">
							<div
								style={{
									position: "relative",
								}}
							>
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
									}  absolute translate-y-[-182px] translate-x-[135px] rounded-t-lg p-2 w-[180px] h-[150px] overflow-y-scroll text-black dark:text-white bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none z-[20] scrollbar scrollbar-thumb-[rgb(64,64,64)] scrollbar-track-white dark:scrollbar dark:scrollbar-thumb-[rgb(64,64,64)] dark:scrollbar-track-[rgb(33,33,33)]`}
								>
									<div className="flex items-center justify-between mb-2">
										{" "}
										{/* Added this div */}
										<label htmlFor="toggle" className="cursor-pointer inline">
											<div className="flex gap-4">
												<span className="font-bold">إظهار</span>
												<div className="relative w-10 h-4 bg-gray-300 rounded-full transform scale-[80%] top-1">
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
														className={`toggle-dot absolute left-0 top-0 w-6 h-6  rounded-full shadow-md transform  transition-transform translate-y-[calc(-15%)] ${
															tafsirModeActive
																? "bg-emerald-600 translate-x-full "
																: "bg-red-700 translate-x-[-40%]"
														}`}
													></div>
												</div>
											</div>
										</label>
									</div>{" "}
									{/* Added closing div */}
									<div>
										{Object.keys(tafseerTypes).map((tafId) => {
											return (
												<div
													key={tafseerTypes[tafId]}
													className={`${
														tafId == currentTafsirId ? "bg-emerald-500" : ""
													} hover:bg-emerald-500 p-1 cursor-pointer `}
													onClick={() => {
														onDisplayStateChange({ tafsirId: tafId });
													}}
													// ref={tafId == currentTafsirId ? scrollToRef : null}
												>
													{`${tafseerTypes[tafId]}`}
												</div>
											);
										})}
									</div>
								</div>
							</OutsideClickHandler>

							<span
								id="tafseerBoxToggler"
								className={`relative left-4 p-2 cursor-pointer border-2 rounded-lg select-none transition-all font-semibold ${
									tafsirBoxVisible
										? "bg-white text-emerald-800 border-white"
										: "border-emerald-800 hover:border-white hover:bg-emerald-700"
								}`}
								onClick={() => {
									setIsTafirBoxVisible(!tafsirBoxVisible);
								}}
							>
								التفسير
							</span>
						</div>
					</div>

					{/* <div className="max-w-[53px] ">{surahNames[surahData?.number]}</div> */}
					<div
						className={`flex gap-2 items-center hover:cursor-pointer select-none p-2 cursor-pointer border-2 rounded-lg transition-all ${
							isSideBarDisplayed
								? "bg-white text-emerald-800 border-white"
								: "border-emerald-800 hover:border-white hover:bg-emerald-700"
						}`}
						id="sidebarToggler"
						onClick={() => {
							onSideBarDisplayedChange(!isSideBarDisplayed);
						}}
					>
						<span className="font-semibold">الانتقال</span>
						<FaBars className="text-xl min-w-[15px]" />
					</div>
				</div>
			</div>
		</div>
		</>
	);
}

export default BottomBar;
