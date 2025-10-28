import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaArrowUp, FaSearch, FaBookmark } from 'react-icons/fa';
import {
	convertToArabicNumbers,
} from '../utility/text-utilities';
import { juzData, hizbData } from '../assets/data/quran-structure';
import { surahNames } from '../assets/data/quran-info';
import Ayah from '../components/Ayah';
import LoadingView from '../components/LoadingView';
import BasmalaBlack from "/src/assets/basmala_black.svg";
import BasmalaWhite from "/src/assets/basmala_white.svg";
import JuzHizbListeningManager from '../components/JuzHizbListeningManager';
import JuzHizbBookmarkForm from '../components/JuzHizbBookmarkForm';
import { Helmet } from 'react-helmet-async';

function JuzHizbReader({ quranText, isDarkMode, type }) {
	const { number } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const parsedNumber = parseInt(number);

	const [scrollProgress, setScrollProgress] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [showScrollToTop, setShowScrollToTop] = useState(false);
	const [currentData, setCurrentData] = useState(null);
	const [surahData, setSurahData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [mode, setMode] = useState('reading');
	const [currentVerse, setCurrentVerse] = useState(null); // Will hold {surahNo: number, verseNo: number}
	const [currentWordInfo, setCurrentWordInfo] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [dropdownType, setDropdownType] = useState("juz"); // "juz" or "hizb"
	const [showVerseJump, setShowVerseJump] = useState(false);
	const [verseJumpSearch, setVerseJumpSearch] = useState('');
	const [filteredVerses, setFilteredVerses] = useState([]);
	const [audioPlayerVisible, setAudioPlayerVisible] = useState(true);
	const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const [highlightedVerse, setHighlightedVerse] = useState(null); // For brief highlighting after search navigation
	const [showFloatingSearch, setShowFloatingSearch] = useState(false); // For floating search window
	const [showBookmarkForm, setShowBookmarkForm] = useState(false);

	const handleCurrentWordChange = (wordInfo) => {
		setCurrentWordInfo(wordInfo);
		// The word audio will be handled by JuzHizbListeningManager through the currentWordInfo prop
	};

	const handleNavigation = (direction) => {
		setIsNavigating(true);
		setTimeout(() => {
			if (direction === 'next') {
				const maxNumber = type === 'juz' ? juzData.length : hizbData.length;
				if (parsedNumber < maxNumber) {
					navigate(`/${type}/${parsedNumber + 1}`, { state: { shouldScroll: true } });
				}
			} else if (direction === 'prev') {
				if (parsedNumber > 1) {
					navigate(`/${type}/${parsedNumber - 1}`, { state: { shouldScroll: true } });
				}
			}
			// Scroll to top after navigation
			window.scrollTo({ top: 0, behavior: 'auto' });
			setIsNavigating(false);
		}, 100);
	};

	// Quick navigation to specific juz/hizb
	const handleQuickNav = (newType, number) => {
		setIsNavigating(true);
		setShowDropdown(false); // Close dropdown immediately
		setTimeout(() => {
			navigate(`/${newType}/${number}`, { state: { shouldScroll: true } });
			// Scroll to top after navigation
			window.scrollTo({ top: 0, behavior: 'auto' });
			setIsNavigating(false);
		}, 100);
	};

	// Verse navigation for listening mode
	const handleVerseNavigation = (direction) => {
		if (direction === "forward") {
			const currentIndex = surahData.findIndex(ayah => ayah.aya_no === currentVerse.verseNo && ayah.sura_no === currentVerse.surahNo);

			if (currentIndex !== -1 && currentIndex < surahData.length - 1) {
				const nextAyah = surahData[currentIndex + 1];
				setCurrentVerse({surahNo: nextAyah.sura_no, verseNo: nextAyah.aya_no});
				setTimeout(() => {
					const verseElement = document.querySelector(`[data-verse-number="${nextAyah.aya_no}"][data-surah-number="${nextAyah.sura_no}"]`);
					if (verseElement) {
						verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}, 100);
			}
		} else if (direction === "backward") {
			const currentIndex = surahData.findIndex(ayah => ayah.aya_no === currentVerse.verseNo && ayah.sura_no === currentVerse.surahNo);

			if (currentIndex > 0) {
				const prevAyah = surahData[currentIndex - 1];
				setCurrentVerse({surahNo: prevAyah.sura_no, verseNo: prevAyah.aya_no});
				setTimeout(() => {
					const verseElement = document.querySelector(`[data-verse-number="${prevAyah.aya_no}"][data-surah-number="${prevAyah.sura_no}"]`);
					if (verseElement) {
						verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}, 100);
			}
		}
	};

	// Handle verse jump and navigation
	const handleVerseJump = (surahNo, verseNo) => {
		setCurrentVerse({ surahNo, verseNo });
		setShowVerseJump(false);
		setVerseJumpSearch('');

		// Set brief highlighting for the navigated verse
		setHighlightedVerse({ surahNo, verseNo });

		// Scroll to the verse after a short delay
		setTimeout(() => {
			const verseElement = document.querySelector(`[data-verse-number="${verseNo}"][data-surah-number="${surahNo}"]`);
			if (verseElement) {
				verseElement.scrollIntoView({ behavior: 'instant', block: 'nearest' });
			}
		}, 100);
	};

	// Handle search filtering for verse jump
	const handleVerseJumpSearch = (searchText) => {
		setVerseJumpSearch(searchText);

		if (!searchText.trim()) {
			setFilteredVerses(surahData);
			return;
		}

		const searchLower = searchText.toLowerCase();

		const filtered = surahData.filter(ayah => {
			// Search in multiple fields
			const surahName = surahNames[ayah.sura_no]?.toLowerCase() || '';
			const uthmaniText = ayah.aya_text?.toLowerCase() || ''; // Text with tashkeel
			const imlaeyText = ayah.aya_text_emlaey?.toLowerCase() || ''; // Text without tashkeel
			const verseNumber = ayah.aya_no.toString();
			const verseNumberArabic = convertToArabicNumbers(ayah.aya_no);

			// Check both Uthmani (with tashkeel) and Imla'iy (without tashkeel) text
			const matchesSurahName = surahName.includes(searchLower);
			const matchesUthmaniText = uthmaniText.includes(searchLower);
			const matchesImlaeyText = imlaeyText.includes(searchLower);
			const matchesVerseNumber = verseNumber.includes(searchLower) || verseNumberArabic.includes(searchLower);
			const matchesSurahNumber = ayah.sura_no.toString().includes(searchLower);

			return matchesSurahName || matchesUthmaniText || matchesImlaeyText || matchesVerseNumber || matchesSurahNumber;
		});

		setFilteredVerses(filtered);
	};

	// Handle floating search filtering (reuses existing logic)
	const handleFloatingSearch = (searchText) => {
		setVerseJumpSearch(searchText);

		if (!searchText.trim()) {
			setFilteredVerses(surahData);
			return;
		}

		const searchLower = searchText.toLowerCase();

		const filtered = surahData.filter(ayah => {
			// Search in multiple fields
			const surahName = surahNames[ayah.sura_no]?.toLowerCase() || '';
			const uthmaniText = ayah.aya_text?.toLowerCase() || ''; // Text with tashkeel
			const imlaeyText = ayah.aya_text_emlaey?.toLowerCase() || ''; // Text without tashkeel
			const verseNumber = ayah.aya_no.toString();
			const verseNumberArabic = convertToArabicNumbers(ayah.aya_no);

			// Check both Uthmani (with tashkeel) and Imla'iy (without tashkeel) text
			const matchesSurahName = surahName.includes(searchLower);
			const matchesUthmaniText = uthmaniText.includes(searchLower);
			const matchesImlaeyText = imlaeyText.includes(searchLower);
			const matchesVerseNumber = verseNumber.includes(searchLower) || verseNumberArabic.includes(searchLower);
			const matchesSurahNumber = ayah.sura_no.toString().includes(searchLower);

			return matchesSurahName || matchesUthmaniText || matchesImlaeyText || matchesVerseNumber || matchesSurahNumber;
		});

		setFilteredVerses(filtered);
	};

	const handleClickOutside = (event) => {
		if (!event.target.closest('.dropdown-container') && !event.target.closest('.verse-jump-container')) {
			setShowDropdown(false);
			setShowVerseJump(false);
		}
		if (!event.target.closest('.floating-search-container') && !event.target.closest('.floating-search-button')) {
			setShowFloatingSearch(false);
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.pageYOffset;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const scrollPercent = (scrollTop / docHeight) * 100;
			setScrollProgress(Math.min(scrollPercent, 100));
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial calculation

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.pageYOffset;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// Show scroll-to-top button when near bottom (within 20% of bottom)
			setShowScrollToTop(scrollPosition + windowHeight > documentHeight * 0.35);

			// Show progress bar when scrolled down
			setIsVisible(scrollPosition > 250);
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial check

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		// Data-loading effect for the current juz/hizb
		if (!quranText) return;

		let data = null;
		if (type === 'juz') {
			data = juzData.find(j => j.number === parsedNumber);
		} else if (type === 'hizb') {
			data = hizbData.find(h => h.number === parsedNumber);
		}

		if (data) {
			setCurrentData(data);
			const relevantSurahs = new Set();
			for (let s = data.startSurah; s <= data.endSurah; s++) {
				relevantSurahs.add(s);
			}

			const allAyahs = [];
			relevantSurahs.forEach(surahNum => {
				const surah = quranText.get(surahNum);
				if (surah) {
					allAyahs.push(...surah);
				}
			});

			let filteredAyahs = [];
			filteredAyahs = allAyahs.filter(ayah => {
				if (data.startSurah === data.endSurah) {
					return ayah.sura_no === data.startSurah &&
						ayah.aya_no >= data.startAyah &&
						ayah.aya_no <= data.endAyah;
				}
				return (ayah.sura_no === data.startSurah && ayah.aya_no >= data.startAyah) ||
					(ayah.sura_no > data.startSurah && ayah.sura_no < data.endSurah) ||
					(ayah.sura_no === data.endSurah && ayah.aya_no <= data.endAyah);
			});

			setSurahData(filteredAyahs);
			setFilteredVerses(filteredAyahs); // Initialize filtered verses for search
			setCurrentPage(data.startPage || 1);
			if (filteredAyahs.length > 0) {
				setCurrentVerse({surahNo: filteredAyahs[0].sura_no, verseNo: filteredAyahs[0].aya_no});
			}
		}

		setIsLoading(false);
	}, [quranText, type, parsedNumber]);

	// If navigated here with a target verse (from Profile), wait until surahData
	// is populated and then scroll + highlight the target verse. Clear the
	// navigation state afterwards so this only runs once.
	useEffect(() => {
		if (!location?.state) return;
		const startSurah = location.state.startSurah;
		const startVerse = location.state.startVerse;
		if (!startSurah || !startVerse) return;
		if (!surahData || surahData.length === 0) return; // wait until content rendered

		setHighlightedVerse({ surahNo: startSurah, verseNo: startVerse });

		const verseElement = document.querySelector(`[data-verse-number="${startVerse}"][data-surah-number="${startSurah}"]`);
		if (verseElement) {
			verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}

		// Clear the location state so repeated renders won't re-trigger
		navigate(location.pathname, { replace: true });
	}, [surahData, location?.state]);

	// Reset currentWordInfo when switching from listening to reading mode
	useEffect(() => {
		if (mode === 'reading') {
			setCurrentWordInfo(null);
		}
	}, [mode]);

	// Clear highlighted verse when mode changes or after timeout
	useEffect(() => {
		if (highlightedVerse) {
			const timer = setTimeout(() => {
				setHighlightedVerse(null);
			}, 2000); // Clear after 2 seconds

			return () => clearTimeout(timer);
		}
	}, [highlightedVerse]);

	// Keyboard navigation
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

			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault();
					// Context-aware: if in listening mode, control verses; otherwise juz/hizb navigation
					if (mode === 'listening') {
						handleVerseNavigation('forward'); // Reversed: left arrow = forward
					} else {
						handleNavigation('next'); // Next juz/hizb
					}
					break;

				case 'ArrowRight':
					event.preventDefault();
					// Context-aware: if in listening mode, control verses; otherwise juz/hizb navigation
					if (mode === 'listening') {
						handleVerseNavigation('backward'); // Reversed: right arrow = backward
					} else {
						handleNavigation('prev'); // Previous juz/hizb
					}
					break;

				case ' ': // Spacebar
					event.preventDefault();
					// Play/Pause audio if in listening mode
					if (mode === 'listening') {
						// Find and control the audio element directly
						const audioElements = document.querySelectorAll('audio');
						const quranAudio = Array.from(audioElements).find(audio =>
							audio.src && audio.src.includes('everyayah.com')
						);

						if (quranAudio) {
							if (quranAudio.paused) {
								quranAudio.play().catch(e => console.log('Play failed:', e));
							} else {
								quranAudio.pause();
							}
						}
					}
					break;

				case 'm':
				case 'M':
					event.preventDefault();
					// Mute/Unmute if in listening mode
					if (mode === 'listening') {
						// Find and control the audio element directly
						const audioElements = document.querySelectorAll('audio');
						const quranAudio = Array.from(audioElements).find(audio =>
							audio.src && audio.src.includes('everyayah.com')
						);

						if (quranAudio) {
							quranAudio.muted = !quranAudio.muted;
						}
					}
					break;

				case 't':
				case 'T':
					event.preventDefault();
					setMode(prevMode => prevMode === 'reading' ? 'listening' : 'reading');
					break;

				case 'a':
				case 'A':
					event.preventDefault();
					// Toggle audio player visibility and close any open dropdowns
					setAudioPlayerVisible(!audioPlayerVisible);
					setShowDropdown(false);
					setShowVerseJump(false);
					break;

				case 'v':
				case 'V':
					event.preventDefault();
					// Toggle verse jump modal
					setShowVerseJump(!showVerseJump);
					setShowDropdown(false);
					break;

				case 'Escape':
					event.preventDefault();
					// Close all modals
					setShowVerseJump(false);
					setShowDropdown(false);
					setShowBookmarkForm(false);
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [mode, parsedNumber, type, handleVerseNavigation, handleNavigation, showVerseJump, audioPlayerVisible, showKeyboardHelp, showBookmarkForm]);

	if (isNavigating) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
					<p className="text-emerald-800 dark:text-emerald-200">جار التحميل...</p>
				</div>
			</div>
		);
	}

	if (isLoading || !currentData) {
		return <LoadingView />;
	}

	const maxNumber = type === 'juz' ? juzData.length : hizbData.length;
	if (parsedNumber < 1 || parsedNumber > maxNumber) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">
						{type === 'juz' ? 'الجزء غير موجود' : 'الحزب غير موجود'}
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						الرقم المطلوب {convertToArabicNumbers(parsedNumber)} خارج النطاق المتاح
					</p>
					<button
						onClick={() => navigate(`/${type}/1`)}
						className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
					>
						{type === 'juz' ? 'الانتقال إلى الجزء الأول' : 'الانتقال إلى الحزب الأول'}
					</button>
				</div>
			</div>
		);
	}

	const title = type === 'juz' ? `الجزء ${parsedNumber}` : `الحزب ${parsedNumber}`;
	const displayName = currentData.name;

	return (
		<>
			<Helmet>
				<title>منصة القرآن | {displayName}</title>
				<meta
					name="description"
					content={`اقرأ ${displayName} من القرآن الكريم`}
				/>
			</Helmet>

			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-4 font-tajwal">
						{displayName}
					</h1>
					<div className="text-gray-600 dark:text-gray-300 mb-4">
						من {surahNames[currentData.startSurah]} الآية {convertToArabicNumbers(currentData.startAyah)} حتى {surahNames[currentData.endSurah]} الآية {convertToArabicNumbers(currentData.endAyah)}
					</div>

					<div className="flex justify-center gap-4 mb-6 dropdown-container">
						<div className="relative verse-jump-container">
							<button
								onClick={() => { setShowVerseJump(!showVerseJump); setShowDropdown(false); }}
								disabled={isNavigating}
								className="flex items-center gap-2 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-gray-800"
							>
								<FaSearch className="text-sm" />
								<span className="text-sm">البحث في الآيات</span>
							</button>
							{showVerseJump && (
								<div className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
									<div className="p-4 border-b border-gray-200 dark:border-gray-700">
										<input
											type="text"
											placeholder="ابحث في السور، الآيات، أو النصوص..."
											value={verseJumpSearch}
											onChange={(e) => handleVerseJumpSearch(e.target.value)}
											className="w-full px-3 py-2 border border-emerald-200 dark:border-emerald-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-gray-700 text-emerald-800 dark:text-emerald-200 placeholder-gray-500 dark:placeholder-gray-400"
											autoFocus
										/>
									</div>
									<div className="max-h-80 overflow-y-auto">
										{filteredVerses.length === 0 ? (
											<div className="text-center py-8 text-gray-500 dark:text-gray-400">
												<FaSearch className="mx-auto mb-2 text-2xl text-gray-400" />
												<p>لم يتم العثور على نتائج</p>
											</div>
										) : (
											<>
												<div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
													<p className="text-xs text-gray-600 dark:text-gray-400">
														تم العثور على {convertToArabicNumbers(filteredVerses.length)} نتيجة
													</p>
												</div>
												{filteredVerses.map((ayah, index) => (
													<button
														key={`${ayah.sura_no}-${ayah.aya_no}`}
														onClick={() => handleVerseJump(ayah.sura_no, ayah.aya_no)}
														className="w-full text-right px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
													>
														<div className="flex justify-between items-start">
															<div className="flex-1 text-right">
																<div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
																	{surahNames[ayah.sura_no]}
																</div>
																<div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
																	الآية {convertToArabicNumbers(ayah.aya_no)}
																</div>
																<div className="text-xs text-gray-500 dark:text-gray-500 overflow-hidden" style={{
																	display: '-webkit-box',
																	WebkitLineClamp: 2,
																	WebkitBoxOrient: 'vertical'
																}}>
																	{ayah.aya_text?.slice(0, 100)}...
																</div>
															</div>
															<div className="text-emerald-600 dark:text-emerald-400 text-lg mr-3">
																{convertToArabicNumbers(ayah.aya_no)}
															</div>
														</div>
													</button>
												))}
											</>
										)}
									</div>
								</div>
							)}
						</div>

						<div className="relative">
							<button
								onClick={() => { setShowDropdown(!showDropdown); setDropdownType("juz"); }}
								disabled={isNavigating}
								className="flex items-center gap-2 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-gray-800"
							>
								<span className="text-sm">الانتقال لجزء آخر</span>
								<FaChevronDown className={`transition-transform duration-200 ${showDropdown && dropdownType === "juz" ? "rotate-180" : ""}`} />
							</button>
							{showDropdown && dropdownType === "juz" && (
								<div className="absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
									{juzData.map((juz) => (
										<button
											key={juz.number}
											onClick={() => handleQuickNav("juz", juz.number)}
											disabled={isNavigating}
											className="w-full text-right px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-gray-800"
										>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600 dark:text-gray-400">{juz.commonName}</span>
												<span className="font-bold text-emerald-600 dark:text-emerald-400">الجزء {convertToArabicNumbers(juz.number)}</span>
											</div>
										</button>
									))}
								</div>
							)}
						</div>

						<div className="relative">
							<button
								onClick={() => { setShowDropdown(!showDropdown); setDropdownType("hizb"); }}
								disabled={isNavigating}
								className="flex items-center gap-2 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-gray-800"
							>
								<span className="text-sm">الانتقال لحزب آخر</span>
								<FaChevronDown className={`transition-transform duration-200 ${showDropdown && dropdownType === "hizb" ? "rotate-180" : ""}`} />
							</button>
							{showDropdown && dropdownType === "hizb" && (
								<div className="absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
									{hizbData.map((hizb) => (
										<button
											key={hizb.number}
											onClick={() => handleQuickNav("hizb", hizb.number)}
											disabled={isNavigating}
											className="w-full text-right px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-gray-800"
										>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600 dark:text-gray-400">{hizb.name}</span>
												<span className="font-bold text-emerald-600 dark:text-emerald-400">الحزب {convertToArabicNumbers(hizb.number)}</span>
											</div>
										</button>
									))}
								</div>
							)}
						</div>
					</div>

				</div>

				<div className="flex justify-center mb-6">
					<div className="bg-white/90 dark:bg-gray-800/90 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg p-4">
						<div className="flex flex-col md:flex-row items-center gap-4">
							<span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">وضع العرض:</span>
							<select
								className="bg-white dark:bg-gray-700 border-2 border-emerald-200 dark:border-emerald-600 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-medium"
								value={mode}
								onChange={(e) => setMode(e.target.value)}
							>
								<option value="reading">القراءة</option>
								<option value="listening">الاستماع</option>
							</select>
							<button
								onClick={() => setShowBookmarkForm(true)}
								className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
								title="حفظ علامة مرجعية"
							>
								<FaBookmark className="text-sm" />
								<span className="">حفظ علامة مرجعية</span>
							</button>
							<button
								onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
								className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
								title="اختصارات لوحة المفاتيح"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21v-1.5a3 3 0 013-3h6a3 3 0 013 3V21M9 21H5a2 2 0 01-2-2v-4.5a2 2 0 012-2h14a2 2 0 012 2V19a2 2 0 01-2 2h-4M9 21h6m-6-6h6m-6 0V9a3 3 0 013-3h0a3 3 0 013 3v6m-6 0h6m-9-9V5a3 3 0 013-3h0a3 3 0 013 3v1" />
								</svg>
								<span className="">اختصارات لوحة المفاتيح</span>
							</button>
						</div>
					</div>
				</div>

				<div className="flex justify-center items-center gap-6 mb-8 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-xl p-6 mx-4 mt-4">
					<button
						onClick={() => handleNavigation('prev')}
						disabled={parsedNumber <= 1 || isNavigating}
						className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
					>
						<FaArrowRight className="text-xl" />
					</button>

					<div className="text-center">
						<div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{convertToArabicNumbers(parsedNumber)}</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">{type === 'juz' ? 'الجزء' : 'الحزب'}</div>
					</div>

					<button
						onClick={() => handleNavigation('next')}
						disabled={parsedNumber >= (type === 'juz' ? juzData.length : hizbData.length) || isNavigating}
						className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
					>
						<FaArrowLeft className="text-xl" />
					</button>
				</div>

				{isVisible && (
					<div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-white/80 dark:bg-gray-800/80 rounded-full px-4 py-2 shadow-lg border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{convertToArabicNumbers(Math.round(scrollProgress))}%</span>
							<div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
								<div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
							</div>
						</div>
					</div>
				)}

				{showScrollToTop && (
					<button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed left-6 z-50 bg-emerald-600/80 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5 ${mode === 'listening' ? (audioPlayerVisible ? 'bottom-[184px]' : 'bottom-[104px]') : 'bottom-24'}`} title="العودة للأعلى">
						<FaArrowUp className="text-lg" />
					</button>
				)}

				<div className={`fixed right-6 z-50 ${mode === 'listening' ? (audioPlayerVisible ? 'bottom-[104px]' : 'bottom-6') : 'bottom-6'}`}>
					<button onClick={() => handleNavigation('prev')} disabled={parsedNumber <= 1 || isNavigating} className="bg-emerald-600/80 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5" title={`الانتقال إلى ${type === 'juz' ? 'الجزء' : 'الحزب'} السابق`}>
						<FaArrowRight className="text-lg" />
					</button>
				</div>

				<div className={`fixed right-6 z-50 ${mode === 'listening' ? (audioPlayerVisible ? 'bottom-[184px]' : 'bottom-[104px]') : 'bottom-24'}`}>
					<button
						onClick={() => setShowFloatingSearch(!showFloatingSearch)}
						className="bg-emerald-600/80 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
						title="البحث في الآيات"
					>
						<FaSearch className="text-lg" />
					</button>
				</div>

				<div className={`fixed left-6 z-50 ${mode === 'listening' ? (audioPlayerVisible ? 'bottom-[104px]' : 'bottom-6') : 'bottom-6'}`}>
					<button onClick={() => handleNavigation('next')} disabled={parsedNumber >= (type === 'juz' ? juzData.length : hizbData.length) || isNavigating} className="bg-emerald-600/80 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5" title={`الانتقال إلى ${type === 'juz' ? 'الجزء' : 'الحزب'} التالي`}>
						<FaArrowLeft className="text-lg" />
					</button>
				</div>

				<div className="font-quranMain mb-28 text-justify text-3xl leading-extra-loose m-auto max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-4xl px-4 sm:px-0" style={{ paddingBottom: mode === 'listening' ? (audioPlayerVisible ? '180px' : '100px') : '0px' }}>
					{surahData.map((ayah, index) => {
						const currentSurahNumber = ayah.sura_no;
						const nextAyah = surahData[index + 1];
						const nextSurahNumber = nextAyah?.sura_no;
						const isSurahStart = index === 0 || currentSurahNumber !== surahData[index - 1].sura_no;
						const isSurahEnd = !nextAyah || currentSurahNumber !== nextSurahNumber;

						// Calculate the actual first and last ayah for this surah in the current juz/hizb
						const surahAyahsInJuz = surahData.filter(ayah => ayah.sura_no === currentSurahNumber);
						const actualFirstAyah = surahAyahsInJuz.length > 0 ? Math.min(...surahAyahsInJuz.map(ayah => ayah.aya_no)) : 1;
						const actualLastAyah = surahAyahsInJuz.length > 0 ? Math.max(...surahAyahsInJuz.map(ayah => ayah.aya_no)) : 1;

						return (
							<React.Fragment key={ayah.sura_no + "_" + ayah.aya_no}>
								{isSurahStart && (
									<div className="text-center my-8 py-4">
										<div className="bg-gradient-to-r from-emerald-100/50 to-emerald-50/50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30 p-4 mb-6">
											<h2 className="font-surahName text-3xl text-emerald-800 dark:text-emerald-200 mb-2">{surahNames[currentSurahNumber]}</h2>
											{!isSurahEnd ? (
												<div className="text-emerald-600 dark:text-emerald-400 text-base">
													<div className="font-[Tajawal]">من آية {convertToArabicNumbers(actualFirstAyah)} إلى آية {convertToArabicNumbers(actualLastAyah)}</div>
												</div>
											) : null}
										</div>
										{currentSurahNumber !== 1 && (
											<div className="flex justify-center">
												<img className="w-48 max-w-[200px] opacity-80 hover:opacity-100 transition-opacity duration-300" src={isDarkMode ? BasmalaWhite : BasmalaBlack} alt="بسم الله الرحمن الرحيم بخط عربي" title="بسم الله الرحمن الرحيم" loading="eager" />
											</div>
										)}
									</div>
								)}

								<Ayah
									ayahData={ayah}
									mode={mode}
									currentVerse={currentVerse}
									onCurrentWordChange={handleCurrentWordChange}
									handleSurahSettingsChange={(settings) => {
										if (settings.currentVerse) {
											// settings.currentVerse is just a number, convert to object format
											setCurrentVerse({surahNo: ayah.sura_no, verseNo: settings.currentVerse});
										}
									}}
									surahNumber={ayah.sura_no}
									surahName={surahNames[ayah.sura_no]}
									pageNumber={ayah.page}
									bookmarkType={type}
									juzNumber={type === 'juz' ? parsedNumber : null}
									hizbNumber={type === 'hizb' ? parsedNumber : null}
									highlightedVerse={highlightedVerse}
								/>
							</React.Fragment>
						);
					})}
				</div>
			</div>

			{surahData.length > 0 && mode === 'listening' && (
				<JuzHizbListeningManager
					surahNumber={currentVerse?.surahNo}
					currentVerse={currentVerse}
					onVerseNavigation={handleVerseNavigation}
					currentWordInfo={currentWordInfo}
					bottomBarDisplayed={false}
					audioPlayerVisible={audioPlayerVisible}
					onAudioPlayerVisibilityChange={setAudioPlayerVisible}
					surahData={surahData}
					juzHizbMode={true}
				/>
			)}

			{/* Keyboard Shortcuts Help */}
			{showKeyboardHelp && (
				<div className="fixed top-20 right-4 z-50">
					<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-emerald-200 dark:border-emerald-700 max-w-xs">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
								⌨️ اختصارات لوحة المفاتيح
							</h3>
							<button
								onClick={() => setShowKeyboardHelp(false)}
								className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Mode-dependent note */}
						<div className="mb-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
							<p className="text-xs text-emerald-700 dark:text-emerald-300 text-center">
								💡 في وضع <strong>القراءة</strong> تتحكم الأسهم في الأجزاء/الأحزاب، أما في وضع <strong>الاستماع</strong> فتتحكم في الآيات
							</p>
						</div>

						<div className="space-y-2 text-xs">
							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">التنقل في الأجزاء/الأحزاب:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">← →</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">التنقل في الآيات:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">← →</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">تشغيل/إيقاف الصوت:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Space</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">كتم/إلغاء كتم الصوت:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">M</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">البحث في الآيات:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">V</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">حفظ/إزالة العلامات المرجعية:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">انقر على رقم الآية</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">نموذج حفظ المرجعية:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">زر المرجعية</kbd>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-700 dark:text-gray-300">تبديل وضع القراءة/الاستماع:</span>
								<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">T</kbd>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Floating Search Window */}
			{showFloatingSearch && (
				<div className="floating-search-container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 max-w-[90vw]">
					<div className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
									🔍 البحث في الآيات
								</h3>
								<button
									onClick={() => setShowFloatingSearch(false)}
									className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<input
								type="text"
								placeholder="ابحث عن آية..."
								value={verseJumpSearch}
								onChange={(e) => handleFloatingSearch(e.target.value)}
								className="w-full px-3 py-2 border border-emerald-200 dark:border-emerald-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-gray-700 text-emerald-800 dark:text-emerald-200 placeholder-gray-500 dark:placeholder-gray-400"
								autoFocus
							/>
						</div>
						<div className="max-h-80 overflow-y-auto">
							{filteredVerses.length === 0 ? (
								<div className="text-center py-8 text-gray-500 dark:text-gray-400">
									<FaSearch className="mx-auto mb-2 text-2xl text-gray-400" />
									<p>لم يتم العثور على نتائج</p>
								</div>
							) : (
								<>
									<div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
										<p className="text-xs text-gray-600 dark:text-gray-400">
											تم العثور على {convertToArabicNumbers(filteredVerses.length)} نتيجة
										</p>
									</div>
									{filteredVerses.map((ayah, index) => (
										<button
											key={`${ayah.sura_no}-${ayah.aya_no}`}
											onClick={() => {
												handleVerseJump(ayah.sura_no, ayah.aya_no);
												setShowFloatingSearch(false);
											}}
											className="w-full text-right px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1 text-right">
													<div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
														{surahNames[ayah.sura_no]}
													</div>
													<div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
														الآية {convertToArabicNumbers(ayah.aya_no)}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-200 overflow-hidden" style={{
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical'
													}}>
														{ayah.aya_text?.slice(0, 100)}...
													</div>
												</div>
												<div className="text-emerald-600 dark:text-emerald-400 text-lg mr-3">
													{convertToArabicNumbers(ayah.aya_no)}
												</div>
											</div>
										</button>
									))}
								</>
							)}
						</div>
					</div>
				</div>)}
			{/* Bookmark Form Modal */}
			{showBookmarkForm && (
				<JuzHizbBookmarkForm
					currentData={currentData}
					surahData={surahData}
					type={type}
					onClose={() => setShowBookmarkForm(false)}
				/>
			)}
		</>
	);
}

export default JuzHizbReader;
