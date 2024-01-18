import React, { useEffect, useState } from "react";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { MdSpatialAudioOff, MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { useAudio } from "react-use";
import { formatTime } from "../utility/text-utilities";
import { quranRecitations } from "../assets/data/quran-info";
import OutsideClickHandler from "./OutsideClickHandler";
import { FaGear } from "react-icons/fa6";

function AudioPlayer({
  mode,
  recitationId,
  onRecitationChange,
  bitrate,
  onBitrateChange,
  audioSrc,
  nextAudioSrc,
  onVerseNavigation,
}) {
  const [audio, state, controls, ref] = useAudio({ src: audioSrc });
  const [hoverData, setHoverData] = useState({ xPosition: null, time: null });
  const progressPercentage = ((state.time * 100) / state.duration).toFixed(2);
  const [recitersDisplayed, setRecitersDisplayed] = useState(false);
  const [bitratesDisplayed, setBitratesDisplayed] = useState(false);

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
      if (nextAudioSrc != null) {
        new Promise((resolve) => {
          const nextAudio = new Audio(nextAudioSrc);
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

    // Additional cleanup in case ref.current is null
    return () => {};
  }, [audioSrc]);

  const jumpToClickPosition = (event) => {
    const elementWidth = event.currentTarget.getBoundingClientRect().width;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeXPosition = event.clientX - rect.left;
    //معادلة التناسب
    const timeToJumpTo =
      ((relativeXPosition / elementWidth) * 100 * state.duration) / 100;
    controls.seek(timeToJumpTo);
  };

  const findHoverTime = (event) => {
    const elementWidth = event.currentTarget.getBoundingClientRect().width;
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeXPosition = event.clientX - rect.left;

    const currentHoverTime =
      ((relativeXPosition / elementWidth) * 100 * state.duration) / 100;
    const proccessedTime = Math.max(0, currentHoverTime);
    const formattedTime = formatTime(proccessedTime);
    setHoverData({
      time: formattedTime,
      xPosition:
        (relativeXPosition / elementWidth) * 100 <= 80
          ? (relativeXPosition / elementWidth) * 100
          : 80,
    });
  };

  const recitationsContent = Object.keys(quranRecitations).map((recId) => {
    return (
      <div
        key={quranRecitations[recId].name}
        className={`${
          recId === recitationId ? "bg-emerald-500" : ""
        } hover:bg-emerald-500 p-1 cursor-pointer `}
        onClick={() => {
          onRecitationChange(recId);
          onBitrateChange(null);
        }}
      >
        {`${quranRecitations[recId].name}`}
      </div>
    );
  });
  const bitratesContent = Object.keys(
    quranRecitations[recitationId].bitrate
  ).map((bitr, index) => {
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
          onBitrateChange(bitr);
        }}
      >
        {`${bitr}`}
      </div>
    );
  });

  return (
    <div
      id="audioPlayer"
      className={`${
        mode === "listening" ? "fixed" : "hidden"
      } left-0 bottom-0 translate-x-[0.5%] z-[5] h-[76px] p-2 w-[99%] bg-white/80 dark:bg-stone-950/[80] shadow-2xl shadow-black border-[2px] border-gray-100/50 border-t-transparent dark:border-none select-none`}
    >
      {audio}
      <div
        className="buffer peer group absolute left-0 top-[-1px] w-full h-[4px] hover:h-[6px] bg-gray-200 cursor-pointer"
        onClick={(event) => {
          jumpToClickPosition(event);
        }}
        onMouseMove={(event) => {
          findHoverTime(event);
        }}
      >
        <div
          style={{ width: `${progressPercentage}%` }}
          className={`current-progress absolute left-0 top-0 h-[4px] group-hover:h-[6px] bg-emerald-700 cursor-pointer`}
        ></div>
        <div
          style={{ left: `${progressPercentage}%`, translate: "-8px" }}
          className={`dot absolute translate-y-[-40%] top-[1px] w-3 h-3 group-hover:h-4 group-hover:w-4 rounded-[50%] bg-emerald-700 cursor-pointer`}
        ></div>
      </div>

      <div
        style={{ left: `${hoverData.xPosition}%` }}
        className="hover-time peer-hover:block hidden w-16 h-6 absolute  top-[-35px] bg-gray-500/90 rounded text-sm mx-auto"
      >
        <span className=" block w-fit m-auto text-white">
          {hoverData?.time}
        </span>
      </div>

      <div className="w-fit m-auto mt-3 flex justify-center items-center gap-7 text-black">
        <MdSkipNext
          size={30}
          className="cursor-pointer hover:text-emerald-500 dark:text-white"
          onClick={() => {
            onVerseNavigation("backward");
          }}
        />
        <div className="cursor-pointer rounded-full p-2 bg-emerald-500 relative w-[40px] h-[40px] flex justify-center items-center ">
          {state.playing ? (
            <IoMdPause
              size={20}
              className="absolute left-[10px]"
              onClick={() => {
                state.playing ? controls.pause() : controls.play();
              }}
            />
          ) : (
            <IoMdPlay
              size={25}
              className="absolute left-[10px]"
              onClick={() => {
                state.playing ? controls.pause() : controls.play();
              }}
            />
          )}
        </div>
        <MdSkipPrevious
          size={30}
          className="cursor-pointer hover:text-emerald-500 dark:text-white"
          onClick={() => {
            onVerseNavigation("forward");
          }}
        />
      </div>
      <span className="current-time text-gray-500 text-md absolute left-1 top-1">
        {formatTime(state.time)}
      </span>
      <span className="full-duration text-gray-500 text-md absolute right-1 top-1">
        {formatTime(state.duration)}
      </span>
      <div className="relative h-fit ">
        <MdSpatialAudioOff
          id="recitersBoxToggler"
          className="absolute left-4 bottom-[8px] text-2xl cursor-pointer"
          onClick={() => {
            setRecitersDisplayed(!recitersDisplayed);
          }}
        />
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
            } absolute left-4 translate-y-[-218px] rounded-t-lg p-2 w-[180px] h-[150px] overflow-y-scroll  bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none scrollbar scrollbar-thumb-[rgb(64,64,64)] scrollbar-track-white dark:scrollbar dark:scrollbar-thumb-[rgb(64,64,64)] dark:scrollbar-track-[rgb(33,33,33)] z-[-1]`}
          >
            <div>{recitationsContent}</div>
          </div>
        </OutsideClickHandler>
      </div>
      <div className="relative h-fit ">
        <FaGear
          id="bitratesBoxToggler"
          className="absolute left-12 bottom-[8px] text-2xl cursor-pointer"
          onClick={() => {
            setBitratesDisplayed(!bitratesDisplayed);
          }}
        />
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
            } absolute left-12 translate-y-[-218px] rounded-t-lg p-2 w-[180px] h-[150px] overflow-y-scroll  bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none scrollbar scrollbar-thumb-[rgb(64,64,64)] scrollbar-track-white dark:scrollbar dark:scrollbar-thumb-[rgb(64,64,64)] dark:scrollbar-track-[rgb(33,33,33)] z-[-1]`}
          >
            <div>{bitratesContent}</div>
          </div>
        </OutsideClickHandler>
      </div>
    </div>
  );
}

export default AudioPlayer;
