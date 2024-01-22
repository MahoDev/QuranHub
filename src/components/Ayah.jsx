import { useEffect, useRef } from "react";
import {
  convertToArabicNumbers,
  fixDiacritics,
} from "../utility/text-utilities";
function Ayah({ ayahData, currentVerse, setCurrentVerse }) {
  const text = ayahData["aya_text"];
  const highlightedAyah = useRef();

  useEffect(() => {
    if (highlightedAyah.current) {
      highlightedAyah.current.scrollIntoView({ block: "center" });
    }
  }, [currentVerse]);

  return (
    <div
      ref={ayahData["aya_no"] === currentVerse ? highlightedAyah : null}
      className={`${
        currentVerse === ayahData["aya_no"] ? "text-emerald-700" : ""
      } inline hover:text-emerald-700 hover:cursor-pointer`}
      onClick={() => {
        setCurrentVerse(ayahData["aya_no"]);
      }}
    >
      <p key={ayahData["aya_no"]} className="inline">
        {text.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")
          ? text.slice(38)
          : text.slice(0, text.length - 2)}
      </p>
      <span> {convertToArabicNumbers(ayahData["aya_no"])} </span>
    </div>
  );
}

export default Ayah;
