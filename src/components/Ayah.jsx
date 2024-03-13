import { useEffect, useRef } from "react";
import {
  convertToArabicNumbers,
  fixDiacritics,
} from "../utility/text-utilities";
function Ayah({
  ayahData,
  currentVerse,
  handleSurahSettingsChange,
  onCurrentWordChange,
}) {
  const verseText = ayahData["aya_text"].startsWith(
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
  )
    ? ayahData["aya_text"].slice(38)
    : ayahData["aya_text"].slice(0, ayahData["aya_text"].length - 2);

  const verseWords = verseText.split(" ");
  const highlightedAyah = useRef();

  useEffect(() => {
    if (highlightedAyah.current) {
      highlightedAyah.current.scrollIntoView({ block: "center" });
    }
  }, [currentVerse]);

  //example of "ayaText" = ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ ﰁ

  return (
    <div
      ref={ayahData["aya_no"] === currentVerse ? highlightedAyah : null}
      className={`${
        currentVerse === ayahData["aya_no"] ? "text-emerald-700" : ""
      } inline group`}
    >
      <div className="inline">
        {verseWords.map((word, index) => {
          return (
            <p
              key={`${ayahData["sura_no"]}:${ayahData["aya_no"]}:${index + 1}`}
              className={`${
                ayahData["aya_no"] === currentVerse
                  ? "hover:text-emerald-900"
                  : ""
              } inline hover:text-emerald-700 hover:cursor-pointer`}
              onClick={() => {
                onCurrentWordChange({
                  surahNo: ayahData["sura_no"],
                  ayahNo: ayahData["aya_no"],
                  index: index + 1,
                });
              }}
            >
              {word + " "}
            </p>
          );
        })}
      </div>
      <span
        className="hover:cursor-pointer"
        onClick={() => {
          console.log("test");
          handleSurahSettingsChange({ currentVerse: ayahData["aya_no"] });
        }}
        onMouseEnter={(e) => {
          e.target.parentElement.classList.add(
            "hover:text-emerald-700",
            "hover:cursor-pointer"
          );
        }}
        onMouseLeave={(e) => {
          e.target.parentElement.classList.remove(
            "hover:text-emerald-700",
            "hover:cursor-pointer"
          );
        }}
      >
        {" "}
        {convertToArabicNumbers(ayahData["aya_no"])}{" "}
      </span>
    </div>
  );
}

export default Ayah;
