import React, { useRef, useState } from "react";
import { surahNames, tafseerTypes } from "../assets/data/quran-info";
import { FaArrowLeft, FaArrowRight, FaBars, FaFont } from "react-icons/fa";
import OutsideClickHandler from "./OutsideClickHandler";

function BottomBar({
	surahData,
	isDisplayed,
	isSideBarDisplayed,
	onSideBarDisplayedChange,
	onPageChange,
	tafsirModeActive,
	currentTafsirId,
	fontSize,
	onDisplayStateChange,
}) {
	const [tafsirBoxVisible, setIsTafirBoxVisible] = useState(true);
	const [fontBoxVisible, setFontBoxVisible] = useState(false);
	const scrollToRef = useRef();

	let bottomBarStyles = "";
	if (isDisplayed) {
		bottomBarStyles = "fixed w-full ";
	} else {
		bottomBarStyles = "hidden w-0 ";
	}

	return (
		<div
			id="bottombar"
			className={
				bottomBarStyles +
				"z-[10] left-0 bottom-0 h-[81px] p-4 pt-5 bg-emerald-800 text-white rounded shadow-inner transition "
			}
		>
			<div className="flex justify-between w-full ">
				<div className="flex gap-4 items-center">
					<div
						onClick={(e) => {
							onPageChange("backward");
						}}
						className="p-1 cursor-pointer border-dashed border-2 border-emerald-800 hover:border-white rounded-lg"
					>
						<FaArrowRight className="inline text-xl" />
						<span className="hidden sm:inline">السابق</span>
					</div>
					<div
						onClick={(e) => {
							onPageChange("forward");
						}}
						className="p-1 cursor-pointer border-dashed border-2 border-emerald-800 hover:border-white rounded-lg"
					>
						<span className="hidden sm:inline">التالي</span>
						<FaArrowLeft className="inline text-xl" />
					</div>
					<div
						className="flex gap-1  select-none p-1 cursor-pointer border-dashed border-2 border-emerald-800 hover:border-white rounded-lg"
						id="fontBoxToggler"
						onClick={() => {
							setFontBoxVisible(!fontBoxVisible);
						}}
					>
						<span>الخط</span>
						<FaFont className="text-xl" />
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
							} absolute right-16 translate-y-[-192px] rounded-t-lg p-2 w-[180px] h-[150px]  text-black dark:text-white  bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none  z-[-1]`}
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
				<div className="flex gap-1 items-center">
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
									}  absolute translate-y-[-182px] translate-x-[135px] rounded-t-lg p-2 w-[180px] h-[150px] overflow-y-scroll text-black dark:text-white bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none z-[-1] scrollbar scrollbar-thumb-[rgb(64,64,64)] scrollbar-track-white dark:scrollbar dark:scrollbar-thumb-[rgb(64,64,64)] dark:scrollbar-track-[rgb(33,33,33)]`}
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
								className="relative left-4 p-1 cursor-pointer border-dashed border-2 border-emerald-800 hover:border-white rounded-lg select-none"
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
						className="flex gap-2 hover:cursor-pointer select-none
            p-1 cursor-pointer border-dashed border-2 border-emerald-800 hover:border-white rounded-lg"
						id="sidebarToggler"
						onClick={() => {
							onSideBarDisplayedChange(!isSideBarDisplayed);
						}}
					>
						<span>الانتقال</span>
						<FaBars className="text-2xl min-w-[15px] " />
					</div>
				</div>
			</div>
		</div>
	);
}

export default BottomBar;
