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
    buttonTexts = ["أكمل القراءة", "أكمل الاستماع"];
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 flex flex-col justify-center min-h-[calc(100vh-2rem)]">
      <div className="container mx-auto px-4 py-6 lg:pt-2 lg:pb-8">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-950 dark:text-white mb-3 leading-tight">
            <span className="block">اقرأ واستمع</span>
            <span className="block text-emerald-600 dark:text-emerald-400">
              للقرآن الكريم
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
            اقرأ القرآن الكريم بالرسم العثماني برواية حفص عن عاصم، استمع إلى تلاوات القراء المتميزين، وتعمَّق في فهم الآيات مع مختلف التفاسير، واستمتع بتجربة مريحة قابلة للتخصيص
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-2xl">
            <div className="bg-white/80 dark:bg-gray-800/80 py-6 px-6 lg:py-8 lg:px-8 rounded-2xl shadow-xl">
              <h2 className="text-lg lg:text-xl font-bold text-emerald-950 dark:text-white mb-3">
                ابدأ رحلتك مع القرآن
              </h2>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
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
                  className="flex-1 py-2.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <span className="whitespace-nowrap">{buttonTexts[0]}</span>
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
                  className="flex-1 py-2.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <span className="whitespace-nowrap">{buttonTexts[1]}</span>
                  <span className="text-lg">🎧</span>
                </button>
              </div>

              {/* Quran Stats - shown inside card on desktop */}
              <div className="hidden lg:block text-center mt-6 mb-4">
                <div className="inline-flex items-center gap-4 lg:gap-6 bg-white/90 dark:bg-gray-800/90 px-4 lg:px-6 py-2 lg:py-3 rounded-full shadow-lg">
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-emerald-600">114</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">سورة</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-emerald-600">6,236</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">آية</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-lg lg:text-xl font-bold text-emerald-600">43</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">تلاوة</div>
                  </div>
                </div>
              </div>

              {/* Browse button - shown inside card on desktop */}
              <div className="hidden lg:block mt-3 lg:mt-4 text-center">
                <button
                  onClick={() => {
                    const surahsSection = document.getElementById('SurahsSection');
                    if (surahsSection) {
                      surahsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/40 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/50 text-emerald-700 dark:text-emerald-300 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="text-base font-medium">تصفح السور</span>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-emerald-400 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative p-1.5 rounded-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
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
                className="relative w-full h-72 lg:h-80 object-cover rounded-2xl shadow-2xl"
                title="شخص يقلب صفحات القرآن"
              />
            </div>
          </div>
        </div>

        {/* Quran Stats - shown below main content on mobile */}
        <div className="text-center quran-stats-btn lg:hidden">
          <div className="inline-flex items-center gap-4 lg:gap-6 bg-white/90 dark:bg-gray-800/90 px-4 lg:px-6 py-2 lg:py-3 rounded-full shadow-lg">
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold text-emerald-600">114</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">سورة</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold text-emerald-600">6,236</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">آية</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold text-emerald-600">43</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">تلاوة</div>
            </div>
          </div>
        </div>

        {/* Browse button - shown below main content on mobile */}
        <div className="mt-3 lg:mt-4 text-center browse-btn lg:hidden">
          <button
            onClick={() => {
              const surahsSection = document.getElementById('SurahsSection');
              if (surahsSection) {
                surahsSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/40 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/50 text-emerald-700 dark:text-emerald-300 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1"
          >
            <span className="text-base font-medium">تصفح السور</span>
            <div className="relative">
              <div className="absolute -inset-1 bg-emerald-400 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative p-1.5 rounded-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
