import React, { useEffect, useState } from "react";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { MdSpatialAudioOff, MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { useAudio } from "react-use";
import { formatTime } from "../utility/text-utilities";
import { quranRecitations } from "../assets/data/quran-info";
import OutsideClickHandler from "./OutsideClickHandler";

function AudioPlayer({
  mode,
  recitationId,
  onRecitationChange,
  audioSrc,
  onAudioEnded,
}) {
  const [audio, state, controls, ref] = useAudio({ src: audioSrc });
  const [hoverData, setHoverData] = useState({ xPosition: null, time: null });
  const progressPercentage = ((state.time * 100) / state.duration).toFixed(2);
  const [recitersDisplayed, setRecitersDisplayed] = useState(false);

  useEffect(() => {
    const audioElement = ref.current;
    const handleAudioEnded = () => {
      onAudioEnded();
    };
    if (audioElement) {
      audioElement.addEventListener("ended", handleAudioEnded);
      //ensure no playback issues occurs when the audio source changes
      audioElement.autoplay = true;
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

  const uniqueNamesSet = new Set();
  const uniqueRecitations = Object.values(quranRecitations).filter(
    (recitation) => {
      const isUnique = !uniqueNamesSet.has(recitation.name);
      if (isUnique) {
        uniqueNamesSet.add(recitation.name);
      }
      return isUnique;
    }
  );
  const recitationsContent = Object.keys(uniqueRecitations).map((recId) => {
    return (
      <div
        key={uniqueRecitations[recId].name}
        className={`${
          recId === recitationId ? "bg-emerald-500" : ""
        } hover:bg-emerald-500 p-1 cursor-pointer `}
        onClick={() => {
          onRecitationChange(recId);
        }}
      >
        {`${uniqueRecitations[recId].name}`}
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
            } absolute left-4 translate-y-[-218px] rounded-t-lg p-2 w-[180px] h-[150px] overflow-y-scroll  bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none z-[-1]`}
          >
            <div>{recitationsContent}</div>
          </div>
        </OutsideClickHandler>
      </div>
    </div>
  );
}

export default AudioPlayer;
