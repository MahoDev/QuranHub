import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { DiAptana } from "react-icons/di";
import {
	convertToArabicNumbers,
	removeHtmlFromText,
} from "../utility/text-utilities";
import { useNavigate } from "react-router-dom";
import BasmalaWhite from "/src/assets/basmala_white.svg";
import BasmalaBlack from "/src/assets/basmala_black.svg";
import {
	reciterNames,
	surahNames,
	surahNumToPagesMap,
	surahVerses,
} from "../assets/data/quran-info";
import Ayah from "../components/Ayah";
import SideBar from "../components/SideBar";
import BottomBar from "../components/BottomBar";
import LoadingView from "../components/LoadingView";
import OutsideClickHandler from "../components/OutsideClickHandler";
import AddBookmarkForm from "../components/AddBookmarkForm";
import { useDisplaySettings } from "../contexts/display-settings-context";
import { useSurahSettings } from "../contexts/surah-settings-context";
import ListeningModeManager from "../components/ListeningModeManager";
import { Helmet } from "react-helmet-async";

function SurahDisplayer({ isDarkMode, quranText }) {
	const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();
	const { surahSettings, onSurahSettingsChange } = useSurahSettings();
	const { surahNumber } = useParams();
	const [currentPage, setCurrentPage] = useState(1);
	const [surahData, setSurahData] = useState([]);
	const [tafsirData, setTafsirData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [tafsirId, setTafsirId] = useState(16);
	const containerRef = useRef(null);
	const navigate = useNavigate();
	const [mode, setMode] = useState("reading");
	const [sideBarDisplayed, setSideBarDisplayed] = useState(false);
	const [bottomBarVisible, setBottomBarVisible] = useState(true);
	const [tafsirModeActive, setTafsirModeActive] = useState(false);
	const [loadingSurah, setLoadingSurah] = useState(false);
	const [currentVerse, setCurrentVerse] = useState(1);
	const [currentWordInfo, setCurrentWordInfo] = useState(null);
	const [fontSize, setFontSize] = useState(3);
	const [highlightVerse, setHighlightVerse] = useState(false); // For bookmark navigation
	const internalVerseChangeRequest = useRef({ exist: false, verse: 1 });
	const internalPageChangeRequest = useRef({ exist: false, page: 1 });

	useEffect(() => {
		if (quranText) {
			window.prerenderReady = true; // Signal when data is loaded
		}
	}, [quranText]);

	//Used to retrieve the previously chosen display settings after reload
	useEffect(() => {
		setTafsirModeActive(displaySettings.tafsirModeActive);
		setMode(displaySettings.displayMode);
		setTafsirId(displaySettings.tafsirId);
		setFontSize(displaySettings.fontSize);
	}, []);

	// Updates each state based on the key-value pairs in newState
	// Usage:
	// handleDisplayStateChange({ tafsirModeActive: true, displayMode: 'night' });
	const handleDisplayStateChange = (newState) => {
		Object.entries(newState).forEach(([key, value]) => {
			switch (key) {
				case "tafsirModeActive":
					setTafsirModeActive(value);
					break;
				case "displayMode":
					setMode(value);
					break;
				case "tafsirId":
					setTafsirId(value);
					break;
				case "fontSize":
					setFontSize(value);
					break;
				default:
					break;
			}
		});

		// Store the new state/s in localStorage
		onDisplaySettingsChange({ ...displaySettings, ...newState });
	};

	const handleSurahSettingsChange = (newState) => {
		Object.entries(newState).forEach(([key, value]) => {
			switch (key) {
				case "currentPage":
					setCurrentPage(value);
					break;
				case "currentVerse":
					setCurrentVerse(value);
					break;
				default:
					break;
			}
		});

		// Store the new state/s in sessionStorage
		onSurahSettingsChange({ ...surahSettings, ...newState });
	};

	let content = "";
	let ayahsInCurrentPage = null;

	//sets the current surah data.
	useEffect(() => {
		let subscribed = true;

		async function getSurah(num) {
			if (subscribed) {
				setLoadingSurah(true);
				try {
					const surah = quranText.get(+num);
					setSurahData(surah);
					console.log("set surah");
				} catch (error) {
					console.error("Error fetching surah data:", error);
				} finally {
					setIsLoading(false);
					setLoadingSurah(false);
					console.log("Finished loading");
				}
			}
		}

		if (quranText) {
			getSurah(surahNumber);
		}

		return () => {
			subscribed = false;
		};
	}, [surahNumber]);

	//Retrieves the current surah tafseer.
	useEffect(() => {
		if (tafsirModeActive && surahData) {
			let subscribed = true;

			async function getTafsir(surah) {
				try {
					const response = await fetch(
						`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_page/${currentPage}?locale=ar&mushaf=2&per_page=50`
					);
					const data = await response.json();
					if (subscribed) {
						//fixes bug with surahs sharing pages.
						const filteredTafsir = data.tafsirs.filter((ayahTafsir) =>
							ayahTafsir.verse_key.includes(`${surahNumber}:`)
						);
						setTafsirData(filteredTafsir);
					}
				} catch (error) {
					console.error("Error fetching tafseer data:", error);
				}
			}
			getTafsir(surahNumber);
			return () => {
				subscribed = false;
			};
		}
	}, [tafsirModeActive, surahNumber, tafsirId, currentPage]);


	//Used to retrieve previously chosen surah settings after reload
	useEffect(() => {
		if (surahNumber == surahSettings.currentSurah) {
			handleSurahSettingsChange({ currentSurah: +surahNumber });
			setCurrentPage(surahSettings.currentPage);
			setCurrentVerse(surahSettings.currentVerse);
			// Enable highlight if coming from bookmark navigation
			if (surahSettings.currentVerse > 1) {
				setHighlightVerse(true);
				// Auto-hide highlight after 5 seconds
				setTimeout(() => setHighlightVerse(false), 5000);
			}
		} else {
			//used mainly when navigating to surah by typing url link
			//set to first page and verse in surah
			handleSurahSettingsChange({
				currentSurah: +surahNumber,
				currentPage: surahNumToPagesMap[+surahNumber][0],
				currentVerse: 1,
			});
		}
	}, []);

	if (isLoading == false) {
		// ayahs = surahData;

		ayahsInCurrentPage = surahData?.filter((ayah) => ayah.page == currentPage);
		if (!tafsirModeActive)
			content = ayahsInCurrentPage.map((ayah) => {
				return (
					<Ayah
						onCurrentWordChange={setCurrentWordInfo}
						key={ayah["aya_no"]}
						ayahData={ayah}
						currentVerse={mode === "listening" || highlightVerse ? currentVerse : null}
						handleSurahSettingsChange={handleSurahSettingsChange}
						mode={mode}
					/>
				);
			});
		else {
			content = ayahsInCurrentPage.map((ayah) => {
				return (
					<div key={ayah["aya_no"]}>
						<Ayah
							onCurrentWordChange={setCurrentWordInfo}
							ayahData={ayah}
							key={ayah["aya_no"]}
							currentVerse={mode === "listening" || highlightVerse ? currentVerse : null}
							handleSurahSettingsChange={handleSurahSettingsChange}
							mode={mode}
						/>
						<div
							className={`tafseerText  text-gray-700 dark:text-gray-300  text-${
								fontSize - 1
							}xl`}
						>
							{removeHtmlFromText(
								tafsirData?.find((ayahTafsir) => {
									let ayahTafsirNum = ayahTafsir["verse_key"].split(":").pop();

									return Number.parseInt(ayahTafsirNum) === ayah["aya_no"];
								})?.text || "لا يتوفر تفسير لهذه الآية."
							)}
						</div>
						<div className="my-4 bg-emerald-700 h-[2px]"></div>
					</div>
				);
			});
		}
	} else {
		content = <LoadingView />;
	}

	const handlePageChange = (changeType) => {
		if (loadingSurah) {
			return; // Do nothing if a surah is currently being loaded
		}
		internalPageChangeRequest.current.exist = true;

		if (changeType === "backward") {
			const firstPage = surahData[0]?.page;
			if (+surahData[0]["sura_no"] === 1) {
				return;
			}
			if (currentPage - 1 >= firstPage) {
				const firstVerseInPreviousPage = surahData.find(
					(verse) => verse.page == currentPage - 1
				).aya_no;
				if (internalVerseChangeRequest.current.exist) {
					//currentVerse was set by handleVerseNavigation
					//directly before this, so we skip it.
					handleSurahSettingsChange({
						currentPage: currentPage - 1,
					});
					internalVerseChangeRequest.current.exist = false;
				} else {
					handleSurahSettingsChange({
						currentPage: currentPage - 1,
						currentVerse: firstVerseInPreviousPage,
					});
				}
			} else {
				const currAndPrevSurahsAreSharingPage =
					surahNumToPagesMap[surahNumber][0] ===
					surahNumToPagesMap[surahNumber - 1][1];

				if (!isLoading) {
					try {
						setLoadingSurah(true);
						const desiredPage = currAndPrevSurahsAreSharingPage
							? currentPage
							: currentPage - 1;
						navigate(`/surah/${+surahNumber - 1}`);

						//probably unwise to parse all of quranText
						const firstVerseInDesiredPageObj = quranText
							.get(surahNumber - 1)
							?.find((verse) => verse.page === desiredPage)?.aya_no;

						handleSurahSettingsChange({
							currentPage: desiredPage,
							currentVerse: firstVerseInDesiredPageObj,
							currentSurah: +surahNumber - 1,
						});
					} catch (error) {
						console.error("Error navigating to the previous surah:", error);
					} finally {
						setLoadingSurah(false);
					}
				}
			}
		} else if (changeType === "forward") {
			if (+surahData[0]["sura_no"] === 114) {
				return;
			}
			const firstVerseInNextPageObj = surahData?.find(
				(verse) => verse.page == currentPage + 1
			)?.aya_no;

			const lastPage = surahData[surahData.length - 1].page;
			if (currentPage + 1 <= lastPage) {
				handleSurahSettingsChange({
					currentPage: currentPage + 1,
					currentVerse: firstVerseInNextPageObj,
				});
			} else {
				try {
					setLoadingSurah(true);
					navigate(`/surah/${+surahNumber + 1}`);
					//could cause an error in surahs sharing pages
					const currAndNextSurahsAreSharingPage =
						surahNumToPagesMap[+surahNumber][1] ==
						surahNumToPagesMap[+surahNumber + 1][0];

					handleSurahSettingsChange({
						currentSurah: +surahNumber + 1,
						currentPage: currAndNextSurahsAreSharingPage
							? currentPage
							: currentPage + 1,
						currentVerse: 1,
					});
				} catch (error) {
					console.error("Error navigating to the next surah:", error);
				} finally {
					setLoadingSurah(false);
				}
			}
		}
	};

	const handleVerseNavigation = (direction) => {
		if (direction === "forward") {
			const nextVerseAvailable =
				currentVerse !== surahData[surahData.length - 1]["aya_no"];
			const nextPageAvailable = currentPage !== 604 && surahNumber !== 114;
			const isLastVerseInPage =
				ayahsInCurrentPage[ayahsInCurrentPage.length - 1]["aya_no"] ===
				currentVerse;
			if (nextVerseAvailable) {
				handleSurahSettingsChange({ currentVerse: currentVerse + 1 });
				if (nextPageAvailable && isLastVerseInPage) {
					handlePageChange("forward");
				}
			}
		} else if (direction === "backward") {
			const previousVerseAvailable = currentVerse !== surahData[0]["aya_no"];
			const previousPageAvailable = currentPage !== 1;
			const isFirstVerseInPage =
				ayahsInCurrentPage[0]["aya_no"] === currentVerse;
			if (previousVerseAvailable) {
				handleSurahSettingsChange({ currentVerse: currentVerse - 1 });
				if (previousPageAvailable && isFirstVerseInPage) {
					handlePageChange("backward");
					internalVerseChangeRequest.current.exist = true;
					internalVerseChangeRequest.current.verse = currentVerse - 1;
				}
			}
		}
	};

   const surahMetaDescription = `أقرأ ${surahNames[surahNumber]}
${surahVerses[+surahNumber][1]} هي سورة عدد آياتها 
${surahNumToPagesMap[+surahNumber][0]} وفي المصحف تبدأ من صفحة 
${surahNumToPagesMap[+surahNumber][1]} حتى صفحة 
بخط واضح مع التفسير والاستماع لتلاوة بصوت قراء مشهورين على منصة القرآن الكريم
`;
	return (
		<>
			<Helmet>
				<title>{`منصة القرآن | ${surahNames[+surahNumber]}`}</title>
				<meta name="description" content={surahMetaDescription} />
				<meta
					property="og:title"
					content={`منصة القرآن | ${surahNames[+surahNumber]}`}
				/>
				<meta property="og:description" content={surahMetaDescription} />
				<meta
					property="og:url"
					content={`https://quran-hub.vercel.app/surah/${surahNumber}`}
				/>
				<meta property="og:image" content="/public/social-media-pic.png" />

				{/* Twitter Card Tags */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content={`منصة القرآن |  ${surahNames[+surahNumber]}`}
				/>
				<meta name="twitter:description" content={surahMetaDescription} />
				<meta
					name="twitter:image"
					content="https://quran-hub.vercel.app/social-media-pic.png"
				/>

				<script type="application/ld+json">
					{`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "${surahNames[surahNumber]}",
            "description": "صفحة لعرض سورة ${surahNames[surahNumber]} من القرآن الكريم.",
            "url": "https://quran-hub.vercel.app/surah/${surahNumber}",
            "inLanguage": "ar",
            "about": {
              "@type": "Book",
              "name": "القرآن الكريم",
              "url": "https://quran-hub.vercel.app"
            }
          }
        `}
				</script>
			</Helmet>
			<div
				ref={containerRef}
				className="container mb-20 min-h-screen flex flex-col justify-between h-full text-black dark:text-white "
			>
				<div>
					<div className="relative gap-4 lg:gap-6 rounded-2xl pt-6 pb-4 flex flex-col lg:flex-row justify-center items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl mx-4 mb-6">
						<div className="view-mode lg:border-l-2 lg:pl-6 pt-2 border-gray-300 text-black dark:text-white w-full lg:w-auto">
							<div className="flex gap-4 justify-center items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 w-full">
								<p className="text-black dark:text-white font-semibold whitespace-nowrap">وضع العرض:</p>
								<select
									className="bg-white dark:bg-gray-700 border-2 border-emerald-200 dark:border-emerald-600 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-medium flex-1 min-w-[120px]"
									value={mode}
									onChange={(e) =>
										handleDisplayStateChange({ displayMode: e.target.value })
									}
								>
									{["reading", "listening"].map((displayMode) => {
										return (
											<option key={displayMode} value={displayMode}>
												{displayMode == "reading" ? "القراءة" : "الأستماع"}
											</option>
										);
									})}
								</select>
							</div>
						</div>
						<div className="w-full lg:w-auto">
							<AddBookmarkForm
								ayahsInCurrentPage={ayahsInCurrentPage}
								currentPage={currentPage}
								currentSurahNum={surahNumber}
							/>
						</div>
					</div>
					<div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-600 to-transparent my-6"></div>
					<div>
						<div className="mb-8">
							{!isLoading
								? surahData[0]?.page === currentPage && (
										<>
											<div className="text-center mb-6">
												<h1
													className={`font-surahName text-center text-${fontSize}xl text-emerald-800 dark:text-emerald-200 mb-4`}
												>
													{surahNames[+surahData[0]["sura_no"]]}
												</h1>
												<div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
													<span>سورة {surahNames[+surahData[0]["sura_no"]]}</span>
													<span>•</span>
													<span>{surahVerses[+surahNumber]?.[1] || 0} آية</span>
													<span>•</span>
													<span>صفحة {currentPage}</span>
												</div>
											</div>
											{surahNumber != 1 && (
												<div className="flex justify-center mb-6">
													<img
														className="w-48 max-w-[200px] opacity-80 hover:opacity-100 transition-opacity duration-300"
														src={isDarkMode ? BasmalaWhite : BasmalaBlack}
														alt="بسم الله الرحمن الرحيم بخط عربي"
														title="بسم الله الرحمن الرحيم"
														loading="eager"
													/>
												</div>
											)}
										</>
								  )
								: ""}
						</div>
						<div
							className={`font-quranMain text-justify text-${fontSize}xl leading-extra-loose m-auto `}
						>
							{content}
						</div>
					</div>
				</div>

				<div className="flex justify-center items-center gap-6 select-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl rounded-2xl p-6 mx-4">
					<div
						onClick={(e) => {
							handlePageChange("backward");
						}}
						className={`bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
							+surahData?.at(0)?.sura_no !== 1 ? "" : "opacity-50 cursor-not-allowed"
						}`}
					>
						<FaArrowRight className="text-xl" />
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
							{convertToArabicNumbers(currentPage)}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">الصفحة الحالية</div>
					</div>
					<div
						onClick={(e) => {
							handlePageChange("forward");
						}}
						className={`bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
							+surahData?.at(0)?.sura_no !== 114 ? "" : "opacity-50 cursor-not-allowed"
						}`}
					>
						<FaArrowLeft className="text-xl" />
					</div>
				</div>

				<BottomBar
					surahData={surahData}
					isSideBarDisplayed={sideBarDisplayed}
					onSideBarDisplayedChange={setSideBarDisplayed}
					onPageChange={handlePageChange}
					tafsirModeActive={tafsirModeActive}
					currentTafsirId={tafsirId}
					fontSize={fontSize}
					isListeningMode={mode === "listening"}
					onVisibilityChange={setBottomBarVisible}
					//used to set TafsirMode and TafsirId and fontSize
					onDisplayStateChange={handleDisplayStateChange}
				/>
				<OutsideClickHandler
					onOutsideClick={() => {
						setSideBarDisplayed(false);
					}}
					excludedSelectors={["#sidebar", "#sidebarToggler"]}
				>
					{sideBarDisplayed ? (
						<SideBar
							surahData={surahData}
							currentPage={currentPage}
							currentVerse={currentVerse}
							handleSurahSettingsChange={handleSurahSettingsChange}
							onVerseNavigation={(verseNumber) => {
								// Enable highlight for verse navigation from sidebar
								setHighlightVerse(true);
								// Auto-hide highlight after 5 seconds
								setTimeout(() => setHighlightVerse(false), 5000);
							}}
						/>
					) : (
						""
					)}
				</OutsideClickHandler>
				{surahData.length > 0 && mode == "listening" && (
					<ListeningModeManager
						surahNumber={+surahNumber}
						currentVerse={currentVerse}
						onVerseNavigation={handleVerseNavigation}
						currentWordInfo={currentWordInfo}
						bottomBarDisplayed={bottomBarVisible}
					/>
				)}
				{/* Static reciters list for crawlers */}
				<div style={{ display: "none" }} aria-hidden="true">
					<h2>القراء المتوفرون لـ {surahNames[surahNumber]}</h2>
					<ul>
						{reciterNames.map((reciter, index) => (
							<li key={index}>{reciter}</li>
						))}
					</ul>
				</div>
			</div>
		</>
	);
}
export default SurahDisplayer;
