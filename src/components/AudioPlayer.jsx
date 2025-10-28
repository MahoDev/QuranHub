import React, { useEffect, useRef, useState } from "react";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { MdSpatialAudioOff, MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { IoVolumeHigh, IoVolumeMedium } from "react-icons/io5";
import { HiVolumeOff } from "react-icons/hi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { useAudio } from "react-use";
import { formatTime } from "../utility/text-utilities";
import { quranRecitations } from "../assets/data/quran-info";
import OutsideClickHandler from "./OutsideClickHandler";
import { FaGear } from "react-icons/fa6";
import { useDisplaySettings } from "../contexts/display-settings-context";

function AudioPlayer({
	recitationId,
	bitrate,
	verseAudioSrc,
	nextVerseAudioSrc,
	currentWordAudioSrc,
	onVerseNavigation,
	onDisplayStateChange,
	bottomBarDisplayed,
	audioPlayerVisible,
	onVisibilityChange,
	juzHizbMode,
}) {
	const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();

	const [audio, state, controls, ref] = useAudio({
		src: verseAudioSrc,
	});
	const [hoverData, setHoverData] = useState({ xPosition: null, time: null });
	const progressPercentage = ((state.time * 100) / state.duration).toFixed(2);
	const [recitersDisplayed, setRecitersDisplayed] = useState(false);
	const [bitratesDisplayed, setBitratesDisplayed] = useState(false);
	const [volume, setVolume] = useState(displaySettings.volume); // Initial volume (can be adjusted)
	const [volumeDisplayed, setVolumeDisplayed] = useState(false);
	const [ayahWordAudio, setAyahWordAudio] = useState(null);
	const scrollToRef = useRef();
	const [isVisible, setIsVisible] = useState(true);

	const handleVolumeChange = (newValue) => {
		onDisplaySettingsChange({ ...displaySettings, volume: newValue });
		setVolume(newValue);
	};

	// Keyboard shortcut for audio player minimize/maximize (A key)
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

			if (event.key === 'a' || event.key === 'A' || event.key === 'ش' || event.code === 'KeyA') {
				event.preventDefault();
				// Toggle audio player visibility and close any open dropdowns
				onVisibilityChange(!audioPlayerVisible);
				setRecitersDisplayed(false);
				setBitratesDisplayed(false);
				setVolumeDisplayed(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [audioPlayerVisible, onVisibilityChange]);

	useEffect(() => {
		if (scrollToRef.current) {
			scrollToRef.current.scrollIntoView({
				block: "start",
			});
		}
	}, [recitersDisplayed]);

	useEffect(() => {
		if (ayahWordAudio) {
			ayahWordAudio.pause();
			ayahWordAudio.currentTime = 0;
		}
		const newAudio = new Audio(currentWordAudioSrc);
		newAudio.preload = "auto";

		if (state.playing) {
			controls.pause();
		}
		newAudio.play();
		setAyahWordAudio(newAudio);
	}, [currentWordAudioSrc]);

	useEffect(() => {
		if (state.playing == true && !ayahWordAudio.paused) {
			ayahWordAudio.pause();
			ayahWordAudio.currentTime = 0;
		}
	}, [state.playing]);

	useEffect(() => {
		const audioElement = ref.current;
		audioElement.volume = volume; // Set volume when audio source changes
	}, [volume, verseAudioSrc]);

	useEffect(() => {
		const audioElement = ref.current;
		const handleAudioEnded = () => {
			onVerseNavigation("forward");
		};
		if (audioElement) {
			audioElement.addEventListener("ended", handleAudioEnded);
			//ensure no playback issues occurs when the audio source changes
			audioElement.autoplay = true;
			//load the next verse,placing it automatically in cache.
			//This is done for smooth audio playing regardless of connection speed.
			if (nextVerseAudioSrc != null) {
				new Promise((resolve) => {
					const nextAudio = new Audio(nextVerseAudioSrc);
					nextAudio.preload = "auto";
					nextAudio.volume = 0;
					nextAudio.play().then(() => {
						nextAudio.pause();
						nextAudio.currentTime = 0; // Reset the currentTime to the beginning
					});
					resolve();
				});
			}

			// Cleanup function
			return () => {
				audioElement.removeEventListener("ended", handleAudioEnded);
			};
		}
	}, [verseAudioSrc]);

	const jumpToClickPosition = (event) => {
		const elementWidth = event.currentTarget.getBoundingClientRect().width;
		const rect = event.currentTarget.getBoundingClientRect();
		const relativeXPosition = event.clientX - rect.left;
		//معادلة التناسب
		const timeToJumpTo =
			((relativeXPosition / elementWidth) * 100 * state.duration) / 100;
		controls.seek(state.duration - timeToJumpTo);
	};

	const findHoverTime = (event) => {
		const elementWidth = event.currentTarget.getBoundingClientRect().width;
		const rect = event.currentTarget.getBoundingClientRect();
		const relativeXPosition = event.clientX - rect.left;

		const currentHoverTime =
			((relativeXPosition / elementWidth) * 100 * state.duration) / 100;
		const proccessedTime = Math.max(0, currentHoverTime);
		const formattedTime = formatTime(state.duration - proccessedTime);
		setHoverData({
			time: formattedTime,
			xPosition:
				(1 - relativeXPosition / elementWidth) * 100 <= 80
					? (1 - relativeXPosition / elementWidth) * 100
					: 80,
		});
	};

	const getQualityLabel = (bitrateValue) => {
		const bitrate = parseInt(bitrateValue)	;
		if (bitrate <= 16) return "منخفضة جداً";
		if (bitrate <= 32) return "منخفضة";
		if (bitrate <= 40) return "منخفضة متوسطة";
		if (bitrate <= 64) return "متوسطة";
		if (bitrate <= 128) return "عالية";
		return "عالية جداً";
	};

	const recitationsContent = Object.keys(quranRecitations)
		// Sort the recitations based on the name property of each recitation
		.sort((a, b) => {
			const nameA = quranRecitations[a].name.toLowerCase();
			const nameB = quranRecitations[b].name.toLowerCase();
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
			return 0;
		})
		// Map over the sorted keys to render the content
		.map((recId) => {
			return (
				<div
					key={quranRecitations[recId].name}
					className={`${
						recId == recitationId ? "bg-emerald-500" : ""
					} hover:bg-emerald-500 p-1 mb-1 cursor-pointer `}
					onClick={() => {
						onDisplayStateChange({ recitationId: recId, bitrate: null });
					}}
					ref={recId == recitationId ? scrollToRef : null}
				>
					{`${quranRecitations[recId].name}`}
				</div>
			);
		});

	let bitratesContent = [""];

	if (quranRecitations && quranRecitations[recitationId] && quranRecitations[recitationId].bitrate) {
		bitratesContent = Object.keys(quranRecitations[recitationId].bitrate).map(
			(bitr, index) => {
				return (
					<div
						key={bitr}
						className={`${
							bitrate === null
								? index == 0
									? "bg-emerald-500"
									: ""
								: bitrate === bitr
								? "bg-emerald-500"
								: ""
						} hover:bg-emerald-500 p-1 cursor-pointer `}
						onClick={() => {
							onDisplayStateChange({ bitrate: bitr });
						}}
					>
						{getQualityLabel(bitr)}
					</div>
				);
			}
		);
	}

	return (
		<>
			{/* Floating Toggle Button - Shows when player is hidden */}
			{!audioPlayerVisible && (
				<button
					onClick={() => onVisibilityChange(true)}
					className={`fixed transform translate-x-1/2 z-[11] bg-emerald-600/80 hover:bg-emerald-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl flex items-center gap-2 ${
						juzHizbMode
							? "left-[50%] translate-x-[-50%] bottom-6"
							: `right-16 ${bottomBarDisplayed ? "bottom-[100px]" : "bottom-4"}`
					}`}
					title="إظهار مشغل الصوت"
				>
					<FaChevronUp className="text-lg" />
					<span className="font-semibold">الصوت</span>
				</button>
			)}

			{/* Audio Player */}
			<div
				id="audioPlayer"
				className={`fixed left-0 h-[80px] p-3 w-[100%] bg-white/95 dark:bg-stone-900/95 shadow-2xl shadow-black/20 border border-gray-200/60 dark:border-gray-700/60 border-t-transparent dark:border-none select-none rounded-t-lg transition-all duration-200
				${audioPlayerVisible
					? bottomBarDisplayed ? "bottom-[80px] z-[0]" : "bottom-0 z-[5]"
					: "bottom-[-100px] z-[-1]"
				}
				`}
			>
			{audio}
			<div
				className="buffer peer group absolute left-0 top-0 w-full h-[5px] hover:h-[7px] bg-gray-200/80 dark:bg-gray-600/80 cursor-pointer rounded-full transition-all duration-200" style={{ willChange: 'height' }}
				onClick={(event) => {
					jumpToClickPosition(event);
				}}
				onMouseMove={(event) => {
					findHoverTime(event);
				}}
			>
				<div
					style={{ width: `${progressPercentage}%` }}
					className={`current-progress absolute right-0 top-0 h-[5px] group-hover:h-[7px] bg-gradient-to-r from-emerald-500 to-emerald-600 cursor-pointer rounded-full transition-all duration-200`}
				></div>
				<div
					style={{ right: `${progressPercentage}%`, translate: "1px" }}
					className={`dot absolute translate-y-[-40%] top-[1px] w-4 h-4 group-hover:h-5 group-hover:w-5 rounded-[50%] bg-emerald-500 hover:bg-emerald-600 cursor-pointer transition-all duration-200 shadow-lg`}
				></div>
			</div>

			<div
				style={{ right: `${hoverData.xPosition}%` }}
				className="hover-time peer-hover:flex hidden w-20 h-7 absolute top-[-40px] bg-gray-800/95 dark:bg-gray-700/95 rounded-lg text-sm mx-auto items-center justify-center shadow-lg border border-gray-600/50 "
			>
				<span className="text-white font-medium px-2">
					{hoverData?.time}
				</span>
			</div>

			<div className="flex flex-col items-center relative mr-6 ">
				<div
					onMouseEnter={() => {
						setVolumeDisplayed(true);
					}}
					onClick={() => {
						handleVolumeChange(0);
					}}
					className="absolute right-6 top-[10px] p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md group z-[2]"
					id="volumeBoxToggler"
					title="كتم الصوت"
				>
					{(() => {
						// Check if audio element is muted
						const audioElement = ref.current;
						const isMuted = audioElement ? audioElement.muted : false;
						const currentVolume = audioElement ? audioElement.volume : volume;

						if (isMuted || currentVolume === 0) {
							return <HiVolumeOff className="text-2xl text-red-500 group-hover:text-red-600 transition-colors duration-200" />;
						} else if (currentVolume > 0 && currentVolume <= 0.5) {
							return <IoVolumeMedium className="text-2xl text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200" />;
						} else {
							return <IoVolumeHigh className="text-2xl text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200" />;
						}
					})()}
				</div>
				<OutsideClickHandler
					onOutsideClick={() => {
						setVolumeDisplayed(false);
					}}
					excludedSelectors={["#volumeBox", "#volumeBoxToggler"]}
				>
					<div
						id="volumeBox"
						className={`${
							!volumeDisplayed ? "hidden" : ""
						} transform rotate-[-270deg] absolute right-[-20px] top-[-70px] w-32 h-12 bg-white/95 dark:bg-stone-800/95 shadow-lg rounded-lg border border-gray-200/60 dark:border-gray-700/60 z-[1] flex items-center justify-center`}
					>
						<input
							type="range"
							min="0"
							max="1"
							step="0.05"
							value={volume}
							onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
							className="volume-slider w-full h-2 mx-2"
							style={{
								background: '#10b981',
							}}
						/>
					</div>
				</OutsideClickHandler>
			</div>
			<div className="w-fit m-auto mt-3 flex justify-center items-center gap-4 md:gap-8 text-black">
				<MdSkipNext
					size={32}
					className="cursor-pointer hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition-colors duration-200 p-1 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
					onClick={() => {
						onVerseNavigation("backward");
					}}
					title="السابق"
				/>
				<div className="cursor-pointer rounded-full p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 relative w-[50px] h-[50px] flex justify-center items-center shadow-lg hover:shadow-xl transition-all duration-200">
					{state.playing ? (
						<IoMdPause
							size={24}
							className="absolute left-[13px] text-white"
							onClick={() => {
								state.playing ? controls.pause() : controls.play();
							}}
						/>
					) : (
						<IoMdPlay
							size={28}
							className="absolute left-[13px] text-white"
							onClick={() => {
								state.playing ? controls.pause() : controls.play();
							}}
						/>
					)}
				</div>
				<MdSkipPrevious
					size={32}
					className="cursor-pointer hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition-colors duration-200 p-1 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
					onClick={() => {
						onVerseNavigation("forward");
					}}
					title="التالي"
				/>
			</div>
			<span className="current-time text-gray-500 text-md absolute right-1 top-1">
				{formatTime(state.time)}
			</span>
			<span className="full-duration text-gray-500 text-md absolute left-1 top-1">
				{formatTime(state.duration)}
			</span>

			{/* Minimize Toggle Button */}
			<button
				onClick={() => {
					onVisibilityChange(false);
					setRecitersDisplayed(false);
					setBitratesDisplayed(false);
					setVolumeDisplayed(false);
				}}
				className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full p-2 transition-all duration-200"
				title="تصغير مشغل الصوت"
			>
				<FaChevronDown className="text-sm text-gray-600 dark:text-gray-300" />
			</button>
			<div className="relative h-fit">
				<div
					id="recitersBoxToggler"
					className="absolute left-4 bottom-[12px] p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md group"
					onClick={() => {
						setRecitersDisplayed(!recitersDisplayed);
					}}
					title="اختيار القارئ"
				>
					<MdSpatialAudioOff className="text-2xl text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200" />
				</div>
				<OutsideClickHandler
					onOutsideClick={() => {
						setRecitersDisplayed(false);
					}}
					excludedSelectors={["#recitersBox", "#recitersBoxToggler"]}
				>
					<div
						id="recitersBox"
						className={`${
							!recitersDisplayed ? "hidden" : ""
						} absolute left-4 translate-y-[-240px] rounded-lg p-3 w-[200px] h-[160px] overflow-y-scroll dark:text-white bg-white/95 dark:bg-stone-800/95 shadow-xl border border-gray-200/60 dark:border-gray-700/60 select-none scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent z-15`}
					>
						<div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">اختيار القارئ</div>
						<div>{recitationsContent}</div>
					</div>
				</OutsideClickHandler>
			</div>
			<div className="relative h-fit">
				<div
					id="bitratesBoxToggler"
					className="absolute left-16 bottom-[12px] p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md group"
					onClick={() => {
						setBitratesDisplayed(!bitratesDisplayed);
					}}
					title="جودة الصوت"
				>
					<FaGear className="text-2xl text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200" />
				</div>
				<OutsideClickHandler
					onOutsideClick={() => {
						setBitratesDisplayed(false);
					}}
					excludedSelectors={["#bitratesBox", "#bitratesBoxToggler"]}
				>
					<div
						id="bitratesBox"
						className={`${
							!bitratesDisplayed ? "hidden" : ""
						} absolute left-16 translate-y-[-240px] rounded-lg p-3 w-[200px] h-[160px] bg-white/95 dark:bg-stone-800/95 shadow-xl border border-gray-200/60 dark:border-gray-700/60 select-none z-15 dark:text-white`}
					>
						<div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">جودة الصوت</div>
						<div>{bitratesContent}</div>
					</div>
				</OutsideClickHandler>
			</div>
		</div>
		</>
	);
}

export default AudioPlayer;
