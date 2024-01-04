import { useState } from "react";
import SurahCard from "./SurahCard";
import { useNavigate } from "react-router-dom";

function SurahCards({ surahs }) {
  const [displayAll, setDisplayAll] = useState(false);
  const navigate = useNavigate();
  const surahsToDisplay = [];
  let limit = displayAll == false ? 15 : 113;

  for (let i = 0; i <= limit; i++) {
    surahsToDisplay.push(
      <SurahCard
        key={surahs[i]?.name}
        order={surahs[i]?.number}
        onClick={() => {
          navigate(`/surah/${surahs[i]?.number}`);
        }}
        name={surahs[i]?.name}
        versesCount={surahs[i]?.numberOfAyahs}
        type={surahs[i]?.revelationType}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-center flex-wrap gap-4 mb-10">
        {surahsToDisplay}
      </div>
      <button
        onClick={() => setDisplayAll(true)}
        className={
          displayAll
            ? "hidden"
            : "" +
              " w-[200px] block m-auto py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full"
        }
      >
        اظهر جميع السور
      </button>
    </div>
  );
}

export default SurahCards;
