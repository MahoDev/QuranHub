import React, { useEffect, useState } from "react";
import { quranRecitations, surahVerses } from "../assets/data/quran-info";
import AudioPlayer from "./AudioPlayer";
import { useDisplaySettings } from "../contexts/display-settings-context";

function ListeningModeManager({
  surahNumber,
  currentVerse,
  onVerseNavigation,
  currentWordInfo,
}) {

  const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();
  const [recitationId, setRecitationId] = useState(30);
  const [bitrate, setBitrate] = useState(null);

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
      />
    </div>
  );
}

export default ListeningModeManager;
