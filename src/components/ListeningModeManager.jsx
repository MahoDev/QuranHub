import React, { useEffect, useState, useRef } from "react";
import { quranRecitations, surahVerses } from "../assets/data/quran-info";
import AudioPlayer from "./AudioPlayer";
import { useDisplaySettings } from "../contexts/display-settings-context";

function ListeningModeManager({
	surahNumber,
	currentVerse,
	onVerseNavigation,
	currentWordInfo,
	bottomBarDisplayed,
}) {
	const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();
	const [recitationId, setRecitationId] = useState(30);
	const [bitrate, setBitrate] = useState(null);
	const [qualityNotification, setQualityNotification] = useState({ show: false, message: "" });
	const notificationTimeoutRef = useRef(null);
	const notificationIntervalRef = useRef(null);
	const [isNotificationHovered, setIsNotificationHovered] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(7);

	const startNotificationTimer = () => {
		// Clear any existing timers
		if (notificationTimeoutRef.current) {
			clearTimeout(notificationTimeoutRef.current);
		}
		if (notificationIntervalRef.current) {
			clearInterval(notificationIntervalRef.current);
		}

		// Reset progress (start from 0)
		setTimeRemaining(0);

		// Start countdown updates every 100ms for smooth animation
		notificationIntervalRef.current = setInterval(() => {
			setTimeRemaining(prev => {
				const newValue = prev + (100 / 70); // Fill over 7 seconds (100% / 7s)
				if (newValue >= 100) {
					if (notificationIntervalRef.current) {
						clearInterval(notificationIntervalRef.current);
						notificationIntervalRef.current = null;
					}
					// Auto-hide when progress reaches 100%
					setTimeout(() => {
						setQualityNotification({ show: false, message: "" });
						setTimeRemaining(0);
					}, 50);
					return 100;
				}
				return newValue;
			});
		}, 100);

		// Start main timer (backup)
		notificationTimeoutRef.current = setTimeout(() => {
			setQualityNotification({ show: false, message: "" });
			setTimeRemaining(0);
			if (notificationIntervalRef.current) {
				clearInterval(notificationIntervalRef.current);
				notificationIntervalRef.current = null;
			}
		}, 7000);
	};

	const clearNotificationTimer = () => {
		if (notificationTimeoutRef.current) {
			clearTimeout(notificationTimeoutRef.current);
			notificationTimeoutRef.current = null;
		}
		if (notificationIntervalRef.current) {
			clearInterval(notificationIntervalRef.current);
			notificationIntervalRef.current = null;
		}
		setTimeRemaining(0); // Reset to empty when paused
	};

	const hideNotification = () => {
		setQualityNotification({ show: false, message: "" });
		clearNotificationTimer();
		setTimeRemaining(0);
	};

	const handleNotificationMouseEnter = () => {
		setIsNotificationHovered(true);
		clearNotificationTimer();
	};

	const handleNotificationMouseLeave = () => {
		setIsNotificationHovered(false);
		// Restart timer only if notification is still supposed to be visible
		if (qualityNotification.show) {
			startNotificationTimer();
		}
	};

	const handleDisplayStateChange = (newState) => {
		Object.entries(newState).forEach(([key, value]) => {
			switch (key) {
				case "recitationId":
					setRecitationId(value);
					break;
				case "bitrate":
					setBitrate(value);
					break;
				default:
					break;
			}
		});
		// Store the new state/s in localStorage
		onDisplaySettingsChange({ ...displaySettings, ...newState });
	};

	//Used to retrieve the previously chosen and stored value after reload
	useEffect(() => {
		setRecitationId(displaySettings.recitationId);
		setBitrate(
			displaySettings.bitrate == null ? null : displaySettings.bitrate
		);
	}, []);

	// Check if we should show quality notification when reciter changes
	useEffect(() => {
		if (quranRecitations[recitationId] && quranRecitations[recitationId].bitrate) {
			const availableBitrates = Object.keys(quranRecitations[recitationId].bitrate);
			const currentBitrate = bitrate || availableBitrates[0]; // Use first available if no bitrate set

			// Check if current quality is low and higher qualities exist
			const bitrateValue = parseInt(currentBitrate);
			const hasHigherQuality = availableBitrates.some(br => parseInt(br) > bitrateValue);
			const isLowQuality = bitrateValue <= 32; // Consider 32kbps and below as low quality

			if (isLowQuality && hasHigherQuality) {
				const qualityLabel = getQualityLabel(currentBitrate);
				setQualityNotification({
					show: true,
					message: qualityLabel
				});

				// Start the auto-hide timer
				startNotificationTimer();
			}
		}
	}, [recitationId, bitrate]);

	const getQualityLabel = (bitrateValue) => {
		const bitrate = parseInt(bitrateValue);
		if (bitrate <= 16) return "منخفضة جداً";
		if (bitrate <= 32) return "منخفضة";
		if (bitrate <= 40) return "منخفضة متوسطة";
		if (bitrate <= 64) return "متوسطة";
		if (bitrate <= 128) return "عالية";
		return "عالية جداً";
	};

	let subfolder = "";
	if (
		quranRecitations != undefined &&
		quranRecitations[recitationId] != undefined
	) {
		subfolder =
			bitrate == null
				? quranRecitations[recitationId].bitrate[
						Object.keys(quranRecitations[recitationId].bitrate)[0]
				  ]
				: quranRecitations[recitationId].bitrate[bitrate];
	}

	const generateVerseAudioSrc = (subfolder, surahNumber, verseNumber) => {
		return `https://everyayah.com/data/${subfolder}/${surahNumber
			.toString()
			.padStart(3, "0")}${verseNumber.toString().padStart(3, "0")}.mp3`;
	};

	const generateWordAudioSrc = (currentWordInfo) => {
		if (!currentWordInfo) return null;
		const { surahNo, ayahNo, index, hash } = currentWordInfo;
		return `https://words.audios.quranwbw.com/${surahNo}/${surahNo
			.toString()
			.padStart(3, "0")}_${ayahNo.toString().padStart(3, "0")}_${index
			.toString()
			.padStart(3, "0")}.mp3#${hash}`;
	};

	const currentVerseAudioSrc = generateVerseAudioSrc(
		subfolder,
		surahNumber,
		currentVerse
	);
	const nextVerseAvailable = currentVerse !== surahVerses[surahNumber][1];
	const nextVerseAudioSrc = nextVerseAvailable
		? generateVerseAudioSrc(subfolder, surahNumber, currentVerse + 1)
		: null;
	const currentWordAudioSrc = generateWordAudioSrc(currentWordInfo);

	return (
		<div>
			<AudioPlayer
				recitationId={recitationId}
				bitrate={bitrate}
				//used to set recitationId and bitrate
				onDisplayStateChange={handleDisplayStateChange}
				verseAudioSrc={currentVerseAudioSrc}
				nextVerseAudioSrc={nextVerseAudioSrc}
				currentWordAudioSrc={currentWordAudioSrc}
				onVerseNavigation={onVerseNavigation}
				bottomBarDisplayed={bottomBarDisplayed}
			/>

			{/* Quality Notification */}
			<div
				className={`${
					!qualityNotification.show ? "hidden" : ""
				} fixed top-6 right-6 z-[60] max-w-md animate-in slide-in-from-top-2 duration-300`}
				onMouseEnter={handleNotificationMouseEnter}
				onMouseLeave={handleNotificationMouseLeave}
			>
				<div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl shadow-2xl backdrop-blur-md ring-2 ring-amber-200 dark:ring-amber-800 relative overflow-hidden">
					{/* Progress Bar - TOP */}
					<div className="w-full bg-amber-200 dark:bg-amber-800 h-1">
						<div
							className="bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 h-1 transition-all duration-100 ease-linear"
							style={{ width: `${timeRemaining}%` }}
						></div>
					</div>

					<div className="p-[26px] pt-3">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
									<svg className="h-5 w-5 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
								</div>
							</div>
							<div className="ml-4 w-0 flex-1 mt-6">
								<p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
									🚨 جودة منخفضة
								</p>
								<p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
									جودة الصوت: <span className="font-semibold text-red-500 dark:text-red-400">{qualityNotification.message}</span>
								</p>
								<p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
									انقر ⚙️ لترقية الجودة
								</p>
							</div>
							<div className="flex-shrink-0 flex">
								<button
									className="bg-amber-100 dark:bg-amber-800 hover:bg-amber-200 dark:hover:bg-amber-700 rounded-full p-1.5 inline-flex text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
									onClick={hideNotification}
									title="إغلاق التنبيه"
								>
									<span className="sr-only">إغلاق</span>
									<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ListeningModeManager;
