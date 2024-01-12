import React, { useState } from "react";
import { surahNames, tafseerTypes } from "../assets/data/quran-info";
import { FaArrowLeft, FaArrowRight, FaBars, FaFont } from "react-icons/fa";
import OutsideClickHandler from "./OutsideClickHandler";

function BottomBar({
  surahData,
  isDisplayed,
  isSideBarDisplayed,
  onSideBarDisplayedChange,
  onPageChange,
  onTafsirActiveChange,
  tafsirModeActive,
  currentTafsirId,
  onTafsirTypeChange,
}) {
  let bottomBarStyles = "";
  if (isDisplayed) {
    bottomBarStyles = "fixed w-full ";
  } else {
    bottomBarStyles = "hidden w-0 ";
  }
  const [isTafirBoxVisible, setIsTafirBoxVisible] = useState(true);

  return (
    <div
      id="bottombar"
      className={
        bottomBarStyles +
        "z-[10] left-0 bottom-0 h-20 p-4  bg-emerald-800/90 text-white rounded shadow-inner transition "
      }
    >
      <div className="flex justify-between w-full ">
        <div className="flex gap-4 items-center">
          <div
            onClick={(e) => {
              onPageChange(e, "backward");
            }}
            className="hover:bg-amber-400/50 hover:cursor-pointer"
          >
            <FaArrowRight className="inline text-xl" />
            <span className="hidden sm:inline">السابق</span>
          </div>
          <div
            onClick={(e) => {
              onPageChange(e, "forward");
            }}
            className="hover:bg-amber-400/50 hover:cursor-pointer"
          >
            <span className="hidden sm:inline">التالي</span>
            <FaArrowLeft className="inline text-xl" />
          </div>
          <FaFont className="ml-2 text-xl" />
        </div>
        <div className="flex gap-1 items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 p-1 relative">
            {tafsirModeActive ? (
              <div
                style={{
                  position: "absolute",
                  left: isTafirBoxVisible ? "25px" : "auto",
                  top: isTafirBoxVisible ? "-175px" : "auto",
                  display: isTafirBoxVisible ? "block" : "none",
                  color: "black",
                  transition: "all 0.5s ",
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
                      !isTafirBoxVisible ? "hidden" : ""
                    }  rounded-t-lg p-2 w-[180px] h-[150px] overflow-y-scroll text-black dark:text-white bg-white/90 dark:bg-stone-950/[80] shadow-sm  shadow-black/60 border-[2px] border-gray-100/50 border-b-transparent dark:border-none select-none z-[-1] scrollbar scrollbar-thumb-[rgb(64,64,64)] scrollbar-track-white dark:scrollbar dark:scrollbar-thumb-[rgb(64,64,64)] dark:scrollbar-track-[rgb(33,33,33)]`}
                  >
                    <div>
                      {Object.keys(tafseerTypes).map((tafId) => {
                        return (
                          <div
                            key={tafseerTypes[tafId]}
                            className={`${
                              tafId === currentTafsirId ? "bg-emerald-500" : ""
                            } hover:bg-emerald-500 p-1 cursor-pointer `}
                            onClick={() => {
                              onTafsirTypeChange(tafId);
                            }}
                          >
                            {`${tafseerTypes[tafId]}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </OutsideClickHandler>
              </div>
            ) : (
              ""
            )}

            <input
              type="checkbox"
              id="toggle"
              className="hidden"
              checked={tafsirModeActive}
              onChange={() => {
                onTafsirActiveChange(!tafsirModeActive);
                setIsTafirBoxVisible(!isTafirBoxVisible);
              }}
            />

            <span
              id="tafseerBoxToggler"
              className="relative pb-1 cursor-pointer hover:before:absolute hover:before:bottom-0 hover:before:bg-amber-500 hover:before:w-full hover:before:h-[2px] select-none"
              onClick={() => {
                setIsTafirBoxVisible(!isTafirBoxVisible);
              }}
            >
              التفسير
            </span>

            <label htmlFor="toggle" className="cursor-pointer">
              <div className="relative w-10 h-4 bg-gray-300 rounded-full">
                <div
                  className={`toggle-dot absolute left-0 top-0 w-6 h-6 bg-red-700 rounded-full shadow-md transform transition-transform  translate-y-[calc(-15%)] ${
                    tafsirModeActive
                      ? "translate-x-full bg-emerald-600"
                      : "translate-x-[-40%]"
                  }`}
                ></div>
              </div>
            </label>
          </div>

          <div className="max-w-[53px] ">{surahNames[surahData?.number]}</div>
          <FaBars
            id="sidebarToggler"
            className="text-2xl min-w-[15px] hover:cursor-pointer"
            onClick={() => {
              console.log("clicked on bars icon");
              console.log(!isSideBarDisplayed);
              onSideBarDisplayedChange(!isSideBarDisplayed);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BottomBar;
