import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import { DiAptana } from "react-icons/di";
import {
  convertToArabicNumbers,
  removeHtmlFromText,
} from "../utility/text-utilities";
import { useNavigate } from "react-router-dom";
import BasmalaWhite from "/src/assets/basmala_white.svg";
import BasmalaBlack from "/src/assets/basmala_black.svg";
import {
  quranRecitations,
  surahNames,
  surahNumToPagesMap,
  surahVerses,
} from "../assets/data/quran-info";
import Ayah from "../components/Ayah";
import SideBar from "../components/SideBar";
import BottomBar from "../components/BottomBar";
import AudioPlayer from "../components/AudioPlayer";
import LoadingView from "../components/LoadingView";
import OutsideClickHandler from "../components/OutsideClickHandler";
import AddBookmarkForm from "../components/AddBookmarkForm";
import { useDisplaySettings } from "../contexts/display-settings-context";

function SurahDisplayer({ isDarkMode, quranText }) {
  const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();
  const { surahNumber } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [surahData, setSurahData] = useState([]);
  const [tafsirData, setTafsirData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tafsirId, setTafsirId] = useState(16);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [bottomBarDisplayed, setBottomBarDisplayed] = useState(false);
  const [mode, setMode] = useState("reading");
  const [sideBarDisplayed, setSideBarDisplayed] = useState(false);
  const [tafsirModeActive, setTafsirModeActive] = useState(false);
  const [recitationId, setRecitationId] = useState(30);
  const [bitrate, setBitrate] = useState(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [currentWordInfo, setCurrentWordInfo] = useState(null);
  const [fontSize, setFontSize] = useState(3);
  const internalVerseChangeRequest = useRef({ exist: false, verse: 1 });
  const internalPageChangeRequest = useRef({ exist: false, page: 1 });
  const isFirstRun = useRef(true);

  //Used to retrieve the previously chosen display settings after reload
  useEffect(() => {
    setTafsirModeActive(displaySettings.tafsirModeActive);
    setMode(displaySettings.displayMode);
    setTafsirId(displaySettings.tafsirId);
    setFontSize(displaySettings.fontSize);
    setRecitationId(displaySettings.recitationId);
    setBitrate(
      displaySettings.bitrate == null ? null : displaySettings.bitrate
    );
  }, []);

  // Updates each state based on the key-value pairs in newState
  // Usage:
  // handleStateChange({ tafsirModeActive: true, displayMode: 'night' });
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

    // Store the new state/s in sessionStorage
    onDisplaySettingsChange({ ...displaySettings, ...newState });
  };

  const subfolder =
    bitrate == null
      ? quranRecitations[recitationId].bitrate[
          Object.keys(quranRecitations[recitationId].bitrate)[0]
        ]
      : quranRecitations[recitationId].bitrate[bitrate];

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

  let content = "";
  let ayahsInCurrentPage = null;

  //sets the current surah data.
  useEffect(() => {
    let subscribed = true;
    async function getSurah(num) {
      // if (isFirstRun.current) {
      //   isFirstRun.current = false;
      //   return;
      // }
      if (subscribed) {
        setLoadingSurah(true);
        try {
          const surah = quranText.filter((ayah) => ayah["sura_no"] === +num);
          setSurahData(surah);
          setIsLoading(false);

          //sets to first page in surah
          setCurrentPage(
            quranText.find((ayah) => {
              return +ayah["sura_no"] == num;
            }).page
          );
        } catch (error) {
          console.error("Error fetching surah data:", error);
        } finally {
          setLoadingSurah(false);
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
            `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_page/${currentPage}?locale=ar&mushaf=2`
          );
          const data = await response.json();
          if (subscribed) {
            setTafsirData(data);
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

  //scrolls to the top of the page everytime the page changes
  useEffect(() => {
    if (containerRef.current !== null) {
      window.scrollTo("0", "0");
    }
  }, [currentPage, surahNumber]);

  //sets currentPage to desiredPage
  useEffect(() => {
    if (location.state && location.state.desiredPage) {
      setCurrentPage(location.state.desiredPage);
    }
  }, [location?.state?.desiredPage]);

  //sets default current verse on navigation
  //or to any verse requested from external components

  //issue here (I think) when navigating by ayah with sidebar
  useEffect(() => {
    if (ayahsInCurrentPage && ayahsInCurrentPage.length > 0) {
      if (
        location.state &&
        location.state.externalVerseChangeRequest == true &&
        internalVerseChangeRequest.current.exist == false
      ) {
        setCurrentVerse(location.state.verseToNavigateTo);
        //To avoid repeated verse navigation
        //location.state.externalVerseChangeRequest = false;
        navigate(".", { state: { externalVerseChangeRequest: false } });
      } else if (internalVerseChangeRequest.current.exist == true) {
        setCurrentVerse(internalVerseChangeRequest.current.verse);
        internalVerseChangeRequest.current.exist = false;
      } else {
        //nothing

        if (internalPageChangeRequest.current.exist == true) {
          setCurrentVerse(ayahsInCurrentPage[0]["aya_no"]);
          internalPageChangeRequest.current.exist = false;
        }
      }
    }
  }, [surahData, currentPage, location?.state?.verseToNavigateTo]);

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
            currentVerse={currentVerse}
            setCurrentVerse={setCurrentVerse}
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
              currentVerse={currentVerse}
              setCurrentVerse={setCurrentVerse}
            />
            <div
              className={`text-gray-700 dark:text-gray-300 font-siteText text-${
                fontSize - 1
              }xl`}
            >
              {removeHtmlFromText(
                tafsirData.tafsirs?.find((ayahTafsir) => {
                  let ayahTafsirNum = ayahTafsir["verse_key"].split(":").pop();

                  return Number.parseInt(ayahTafsirNum) === ayah["aya_no"];
                })?.text
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

  const handlePageChange = (e, changeType) => {
    if (loadingSurah) {
      return; // Do nothing if a surah is currently being loaded
    }
    internalPageChangeRequest.current.exist = true;

    if (changeType === "backward") {
      const firstPage = surahData[0]?.page;
      const lastPage = surahData[surahData.length - 1]?.page;
      if (+surahData[0]["sura_no"] === 1) {
        return;
      }
      if (currentPage - 1 >= firstPage) {
        setCurrentPage(currentPage - 1);
      } else {
        const currAndPrevSurahsAreSharingPage =
          surahNumToPagesMap[surahNumber][0] ===
          surahNumToPagesMap[surahNumber - 1][1];

        let passedData = currAndPrevSurahsAreSharingPage
          ? { desiredPage: currentPage }
          : { desiredPage: currentPage - 1 };

        if (!isLoading) {
          try {
            setLoadingSurah(true);
            navigate(`/surah/${+surahNumber - 1}`, {
              state: passedData,
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
      const lastPage = surahData[surahData.length - 1].page;
      if (currentPage + 1 <= lastPage) {
        setCurrentPage(currentPage + 1);
      } else {
        try {
          setLoadingSurah(true);
          navigate(`/surah/${+surahNumber + 1}`);
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
        setCurrentVerse(currentVerse + 1);
        if (nextPageAvailable && isLastVerseInPage) {
          handlePageChange(null, "forward");
        }
      }
    } else if (direction === "backward") {
      const previousVerseAvailable = currentVerse !== surahData[0]["aya_no"];
      const previousPageAvailable = currentPage !== 1;
      const isFirstVerseInPage =
        ayahsInCurrentPage[0]["aya_no"] === currentVerse;
      if (previousVerseAvailable) {
        setCurrentVerse(currentVerse - 1);
        if (previousPageAvailable && isFirstVerseInPage) {
          handlePageChange(null, "backward");
          internalVerseChangeRequest.current.exist = true;
          internalVerseChangeRequest.current.verse = currentVerse - 1;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="container mb-20 min-h-screen flex flex-col justify-between h-full text-black dark:text-white "
    >
      <div>
        <div className=" gap-3 rounded-lg pt-2 flex flex-col md:flex-row justify-center items-center ">
          <div className="md:border-l-2 md:pl-2 pt-2 border-gray-300 text-black dark:text-white md:self-end">
            <div className="flex gap-[4px] justify-center items-center">
              <p className="text-black dark:text-white">وضع العرض:</p>
              <select
                className="bg-white  dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:border-emerald-500"
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
          <AddBookmarkForm
            ayahsInCurrentPage={ayahsInCurrentPage}
            currentPage={currentPage}
            currentSurahNum={surahNumber}
          />
        </div>
        <div className="h-[1px] w-full bg-gray-900 my-2"></div>
        <div>
          <div>
            {!isLoading
              ? surahData[0]?.page === currentPage && (
                  <>
                    <p className="font-surahName text-center text-3xl">
                      {surahNames[+surahData[0]["sura_no"]]}
                    </p>
                    {surahNumber != 1 && (
                      <img
                        className="max-w-[180px] m-auto"
                        src={isDarkMode ? BasmalaWhite : BasmalaBlack}
                      />
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

      <div className="flex justify-center items-center gap-5 select-none ">
        <div
          onClick={(e) => {
            handlePageChange(e, "backward");
          }}
          className={`bg-transparent cursor-pointer p-4 rounded hover:bg-gray-400 " ${
            +surahData[0]["sura_no"] !== 1 ? "" : "opacity-50"
          }`}
        >
          <FaArrowRight />
        </div>
        {convertToArabicNumbers(currentPage)}
        <div
          onClick={(e) => {
            handlePageChange(e, "forward");
          }}
          className={`bg-transparent cursor-pointer p-4 rounded hover:bg-gray-400 ${
            +surahData[0]["sura_no"] !== 114 ? "" : "opacity-50"
          }`}
        >
          <FaArrowLeft />
        </div>
      </div>
      <DiAptana
        className="fixed right-0 bottom-20 text-3xl z-10  rounded hover:text-amber-500 hover:cursor-pointer"
        onClick={() => {
          setBottomBarDisplayed(!bottomBarDisplayed);
        }}
      />
      <BottomBar
        surahData={surahData}
        isDisplayed={bottomBarDisplayed}
        isSideBarDisplayed={sideBarDisplayed}
        onSideBarDisplayedChange={setSideBarDisplayed}
        onPageChange={handlePageChange}
        tafsirModeActive={tafsirModeActive}
        currentTafsirId={tafsirId}
        fontSize={fontSize}
        //used to set TafsirMode and TafsirId and fontSize
        onDisplayStateChange={handleDisplayStateChange}
      />
      <OutsideClickHandler
        onOutsideClick={() => {
          setSideBarDisplayed(false);
        }}
        excludedSelectors={["#sidebar", "#sidebarToggler"]}
      >
        {sideBarDisplayed && bottomBarDisplayed ? (
          <SideBar
            surahData={surahData}
            currentPage={currentPage}
            currentVerse={currentVerse}
            setCurrentVerse={setCurrentVerse}
          />
        ) : (
          ""
        )}
      </OutsideClickHandler>
      {surahData.length > 0 && (
        <AudioPlayer
          mode={mode}
          recitationId={recitationId}
          bitrate={bitrate}
          //used to set recitationId and bitrate
          onDisplayStateChange={handleDisplayStateChange}
          verseAudioSrc={currentVerseAudioSrc}
          nextVerseAudioSrc={nextVerseAudioSrc}
          currentWordAudioSrc={currentWordAudioSrc}
          onVerseNavigation={handleVerseNavigation}
        />
      )}
    </div>
  );
}
export default SurahDisplayer;
