import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { juzData, hizbData } from "../assets/data/quran-structure";
import { surahNames } from "../assets/data/quran-info";
import { convertToArabicNumbers } from "../utility/text-utilities";

function JuzHizbSection() {
	const [activeTab, setActiveTab] = useState("juz"); // "juz" or "hizb"
	const navigate = useNavigate();

	const currentData = activeTab === "juz" ? juzData : hizbData;

	const handleCardClick = (item) => {
		navigate(`/${activeTab}/${item.number}`);
	};

	return (
		<div id="JuzHizbSection" className="py-16 bg-gray-50 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white mb-4">
						تصفح الأجزاء والأحزاب
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						تصفح واختر من بين {convertToArabicNumbers(30)} جزء أو {convertToArabicNumbers(60)} حزب من القرآن الكريم للقراءة المركزة
					</p>
				</div>

				{/* Quick Navigation Buttons */}
				<div className="flex justify-center gap-4 mb-8">
					<button
						onClick={() => {
							setActiveTab("juz");
						}}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
							activeTab === "juz"
								? "bg-emerald-600 hover:bg-emerald-700 text-white"
								: "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600"
						}`}
					>
						الأجزاء ({convertToArabicNumbers(30)})
					</button>
					<button
						onClick={() => {
							setActiveTab("hizb");
						}}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
							activeTab === "hizb"
								? "bg-emerald-600 hover:bg-emerald-700 text-white"
								: "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600"
						}`}
					>
						الأحزاب ({convertToArabicNumbers(60)})
					</button>
				</div>

				{/* Quick Access Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
					{currentData.map((item) => (
						<div
							key={item.number}
							onClick={() => handleCardClick(item)}
							className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-1 min-h-[140px] flex flex-col"
						>
							{/* Header with number badge only */}
							<div className="flex items-start justify-center mb-3">
								<div className="bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 rounded-lg p-2 transition-colors duration-300">
									<span className="text-emerald-700 dark:text-emerald-300 font-bold text-base font-tajwal">
										{convertToArabicNumbers(item.number)}
									</span>
								</div>
							</div>

							{/* Main content */}
							<div className="flex-grow flex flex-col justify-center text-center">
								<h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 font-tajwal">
									{activeTab === "juz" ? "الجزء" : "الحزب"} {convertToArabicNumbers(item.number)}
								</h3>

								{/* Common name if available */}
								{item.commonName && (
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
										{item.commonName}
									</p>
								)}

								{/* Show surah range for juz */}
								{activeTab === "juz" && (
									<div className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
										<div className="font-medium mb-1">الآيات:</div>
										<div className="text-xs leading-tight">
											{surahNames[item.startSurah]} : {convertToArabicNumbers(item.startAyah)}
											<br />
											<span className="text-gray-500 dark:text-gray-500">إلى</span>
											<br />
											{surahNames[item.endSurah]} : {convertToArabicNumbers(item.endAyah)}
										</div>
									</div>
								)}

								{/* Show hizb quarters for hizb */}
								{activeTab === "hizb" && (
									<div className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
										<div className="font-medium mb-1">الأرباع:</div>
										<div className="text-xs leading-tight space-y-0.5">
											<div>١: {surahNames[item.quarters?.[0]?.startSurah]}: {convertToArabicNumbers(item.quarters?.[0]?.startAyah)}</div>
											<div>٢: {surahNames[item.quarters?.[1]?.startSurah]}: {convertToArabicNumbers(item.quarters?.[1]?.startAyah)}</div>
											<div>٣: {surahNames[item.quarters?.[2]?.startSurah]}: {convertToArabicNumbers(item.quarters?.[2]?.startAyah)}</div>
											<div>٤: {surahNames[item.quarters?.[3]?.startSurah]}: {convertToArabicNumbers(item.quarters?.[3]?.startAyah)}</div>
										</div>
									</div>
								)}
							</div>

							{/* Progress bar on hover */}
							<div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
									<div className="bg-emerald-500 h-1 rounded-full w-1/3 transition-all duration-500 group-hover:w-full"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default JuzHizbSection;
