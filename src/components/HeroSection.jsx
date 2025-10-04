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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              منصة القرآن - تجربة حديثة للقراءة والاستماع
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-emerald-950 dark:text-white mb-6 leading-tight">
            <span className="block">اقرأ واستمع</span>
            <span className="block text-emerald-600 dark:text-emerald-400">
              للقرآن الكريم
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            منصة متطورة تقدم القرآن الكريم بخط واضح وبالتشكيل الكامل مع إمكانية الاستماع لتلاوات أكثر من 100 قارئ مشهور
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-16">
          <div className="flex-1 max-w-2xl">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-emerald-950 dark:text-white mb-6">
                مميزات المنصة
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">قراءة بالتشكيل الكامل</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">تلاوات عالية الجودة</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">الوضع الليلي المريح</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">حفظ مواضع القراءة</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>{buttonTexts[0]}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
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
                  className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>{buttonTexts[1]}</span>
                  <span className="text-lg">🎧</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-2xl blur opacity-20"></div>
              <img
                src={quranPic1}
                alt="صورة قران 1"
                className="relative w-full h-96 object-cover rounded-2xl shadow-2xl"
                title="شخص يقلب صفحات القرآن"
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">114</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">سورة</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">6,236</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">آية</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">43</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">تسجيل</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
