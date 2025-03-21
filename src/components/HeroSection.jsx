import { useNavigate } from "react-router-dom";
import quranPic1 from "../assets/imgs/quran1.png";
import quranPic2 from "../assets/imgs/quran2.png";
import { useSurahSettings } from "../contexts/surah-settings-context";
import { useDisplaySettings } from "../contexts/display-settings-context";

function HeroSection() {
  const navigate = useNavigate();
  const { surahSettings, onSurahSettingsChange } = useSurahSettings();
  const { displaySettings, onDisplaySettingsChange } = useDisplaySettings();

  let buttonTexts = [];
  if (
    (surahSettings.currentSurah == 1 &&
      surahSettings.currentPage == 1 &&
      surahSettings.currentVerse == 1) ||
    surahSettings == {} ||
    surahSettings == undefined
  ) {
    buttonTexts = ["ابدأ القراءة", "ابدأ الاستماع"];
  } else {
    buttonTexts = ["اكمل القراءة", "أكمل الاستماع"];
  }

  return (
    <div className="container pt-10 ">
      <h1 className="pb-8 text-4xl dark:text-white text-emerald-950  font-quranMain text-justify leading-relaxed">
        إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ
        وَأَنفَقُوا مِمَّا رَزَقْنَاهُمْ سِرًّا وَعَلَانِيَةً يَرْجُونَ
        تِجَارَةً لَّن تَبُورَ
      </h1>
      <div className="hero flex flex-wrap justify-center">
        <div className="flex flex-wrap justify-center gap-[15px] w-full lg:w-[calc(100%*2/3)] h-auto lg:order-1">
          <img
            src={quranPic1}
            alt="صورة قران 1"
            className="w-full lg:w-[calc(100%/2-30px)] h-[350px] object-cover rounded-xl"
            title="شخص يقلب صفحات القرآن"
          />
          <img
            src={quranPic2}
            alt="صورة قرآن 2"
            className="hidden  w-full  h-[350px] object-cover rounded-xl lg:w-[calc(100%/2-30px)] lg:block"
            title="شخص يجلب القرآن من بين الكتب"
          />
        </div>
        <div className="w-[350px] h-[350px] lg:w-[calc(100%/3)] mt-4">
          <p className="text-xl text-gray-500 dark:text-gray-500 w-full mb-8 font-quranMain">
            {" "}
            قال تعالى: الَّذِينَ آَمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ
            اللَّهِ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </p>
          <button
            onClick={() => {
              if (displaySettings.displayMode == "listening") {
                onDisplaySettingsChange({
                  ...displaySettings,
                  displayMode: "reading",
                });
              }
              navigate(`/surah/${+surahSettings.currentSurah}`);
            }}
            className="w-full py-4 bg-emerald-700 text-white rounded-full mb-4 hover:bg-emerald-600"
          >
            {buttonTexts[0]}
          </button>
          <button
            onClick={() => {
              if (displaySettings.displayMode == "reading") {
                onDisplaySettingsChange({
                  ...displaySettings,
                  displayMode: "listening",
                });
              }
              navigate(`/surah/${+surahSettings.currentSurah}`);
            }}
            className="w-full py-4 bg-amber-500 text-black rounded-full hover:bg-amber-400"
          >
            {buttonTexts[1]}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
