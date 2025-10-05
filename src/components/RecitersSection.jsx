import { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { reciterNames, quranRecitations } from "../assets/data/quran-info";
import { reciterImages } from "../assets/data/reciter-images";

// Static imports for reciter images
import abdulBasitAbdulSamad from "../assets/images/reciters/abdul-basit-abdul-samad.jpg";
import abdullahBasfar from "../assets/images/reciters/abdullah-basfar.jpg";
import abdurrahmaanAsSudais from "../assets/images/reciters/abdurrahmaan-as-sudais.jpg";
import abuBakrAshShatri from "../assets/images/reciters/abu-bakr-ash-shaatree.jpg";
import ahmedIbnAliAlAjamy from "../assets/images/reciters/ahmed-ibn-ali-al-ajamy.jpg";
import alafasy from "../assets/images/reciters/alafasy.jpg";
import ghamadi from "../assets/images/reciters/ghamadi.jpg";
import haniRifai from "../assets/images/reciters/hani-rifai.jpg";
import mahmoudKhalilAlHusary from "../assets/images/reciters/mahmoud-khalil-al-husary.jpg";
import hudhaify from "../assets/images/reciters/hudhaify.jpg";
import ibrahimAkhdar from "../assets/images/reciters/ibrahim-akhdar.jpg";
import maherAlMuaiqly from "../assets/images/reciters/maher-al-muaiqly.jpg";
import muhammadSiddiqAlMinshawi from "../assets/images/reciters/muhammad-siddiq-al-minshawi.jpg";
import mohammadAlTablaway from "../assets/images/reciters/mohammad-al-tablaway.jpg";
import muhammadAyyoub from "../assets/images/reciters/muhammad-ayyoub.jpg";
import muhammadJibreel from "../assets/images/reciters/muhammad-jibreel.jpg";
import saoodAshShuraym from "../assets/images/reciters/saood-ash-shuraym.jpg";
import salaahAbdulrahmanBukhatir from "../assets/images/reciters/salaah-abdulrahman-bukhatir.jpg";
import muhsinAlQasim from "../assets/images/reciters/muhsin-al-qasim.jpg";
import abdullaahAwwaadAlJuhaynee from "../assets/images/reciters/abdullaah-awwaad-al-juhaynee.jpg";
import salahAlBudair from "../assets/images/reciters/salah-al-budair.jpg";
import abdullahMatroud from "../assets/images/reciters/abdullah-matroud.jpg";
import ahmedNeana from "../assets/images/reciters/ahmed-neana.jpg";
import muhammadAbdulKareem from "../assets/images/reciters/muhammad-abdul-kareem.jpg";
import khalefaAlTunaiji from "../assets/images/reciters/khalefa-al-tunaiji.jpg";
import mahmoudAliAlBanna from "../assets/images/reciters/mahmoud-ali-al-banna.jpg";
import yasserAdDussary from "../assets/images/reciters/yasser-ad-dussary.jpg";
import nasserAlQatami from "../assets/images/reciters/nasser-al-qatami.jpg";
import aliHajjajAlSuesy from "../assets/images/reciters/ali-hajjaj-al-suesy.jpg";
import sahlYassin from "../assets/images/reciters/sahl-yassin.jpg";
import karimMansoori from "../assets/images/reciters/karim-mansoori.jpg";
import azizAlili from "../assets/images/reciters/aziz-alili.jpg";
import yaserSalamah from "../assets/images/reciters/yaser-salamah.jpg";
import akramAlAlaqimy from "../assets/images/reciters/akram-al-alaqimy.jpg";
import aliJaber from "../assets/images/reciters/ali-jaber.jpg";
import faresAbbad from "../assets/images/reciters/fares-abbad.jpg";
import aymanSowaid from "../assets/images/reciters/ayman-sowaid.jpg";
import khaalidAbdullaahAlQahtaanee from "../assets/images/reciters/khaalid-abdullaah-al-qahtaanee.jpg";

// Map reciter IDs to their corresponding imported images
const reciterImageMap = {
  1: abdulBasitAbdulSamad,
  2: abdulBasitAbdulSamad,  // Same as #1
  3: abdullahBasfar,
  4: abdurrahmaanAsSudais,
  5: abuBakrAshShatri,
  6: ahmedIbnAliAlAjamy,
  7: alafasy,
  8: ghamadi,
  9: haniRifai,
  10: mahmoudKhalilAlHusary,
  11: mahmoudKhalilAlHusary,  // Same as #10
  12: hudhaify,
  13: ibrahimAkhdar,
  14: maherAlMuaiqly,
  15: muhammadSiddiqAlMinshawi,
  16: muhammadSiddiqAlMinshawi,  // Same as #15
  17: mohammadAlTablaway,
  18: muhammadAyyoub,
  19: muhammadJibreel,
  20: saoodAshShuraym,
  21: salaahAbdulrahmanBukhatir,
  22: muhsinAlQasim,
  23: abdullaahAwwaadAlJuhaynee,
  24: salahAlBudair,
  25: abdullahMatroud,
  26: ahmedNeana,
  27: muhammadAbdulKareem,
  28: khalefaAlTunaiji,
  29: mahmoudAliAlBanna,
  30: yasserAdDussary,
  31: nasserAlQatami,
  32: aliHajjajAlSuesy,
  33: sahlYassin,
  34: ahmedIbnAliAlAjamy,  // Same as #6
  35: karimMansoori,
  36: azizAlili,
  37: yaserSalamah,
  38: akramAlAlaqimy,
  39: aliJaber,
  40: faresAbbad,
  41: aymanSowaid,
  42: mahmoudKhalilAlHusary,  // Same as #10 and #11
  43: khaalidAbdullaahAlQahtaanee
};

console.log(reciterImageMap[41])
function RecitersSection() {
  const [playingReciter, setPlayingReciter] = useState(null);
  const [currentRandomVerse, setCurrentRandomVerse] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showAllReciters, setShowAllReciters] = useState(false);
  const recitersSectionRef = useRef(null);

  // List of verses numbers to choose from randomly
  const versesNums = [
    "017080", "003148", "002286", "002201", "007023",
    "021083", "021087", "009129", "014040", "014041",
    "003008","002255"
  ];

  // Stop any currently playing audio
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setPlayingReciter(null);
  };

  const handlePlaySample = (reciterIndex) => {
    // Stop any currently playing audio first
    stopCurrentAudio();

    if (playingReciter === reciterIndex) {
      // If clicking the same reciter that's playing, just stop it
      setPlayingReciter(null);
    } else {
      // Select a random verse for this specific reciter
      const randomIndex = Math.floor(Math.random() * versesNums.length);
      const selectedVerse = versesNums[randomIndex];
      setCurrentRandomVerse(selectedVerse);

      setPlayingReciter(reciterIndex);

      // Get the reciter's bitrate information
      const reciterData = quranRecitations[reciterIndex + 1]; // +1 because array is 0-indexed but reciter IDs start from 1
      if (reciterData && selectedVerse) {
        // Use the first available bitrate (usually the highest quality)
        const bitrateName = Object.keys(reciterData.bitrate)[Object.keys(reciterData.bitrate).length -1];
        const bitrateFolder = reciterData.bitrate[bitrateName];

        // Construct the audio URL
        const audioUrl = `https://everyayah.com/data/${bitrateFolder}/${selectedVerse}.mp3`;

        // Create and play audio
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          stopCurrentAudio();
        };

        audio.onerror = () => {
          console.error(`Failed to load audio for reciter ${reciterData.name}`);
          stopCurrentAudio();
        };

        audio.play().then(() => {
          setCurrentAudio(audio);
        }).catch(err => {
          console.error('Audio play failed:', err);
          stopCurrentAudio();
        });
      }
    }
  };

  // Get reciters to display based on showAllReciters state
  const recitersToDisplay = showAllReciters ? reciterNames : reciterNames.slice(0, 8);

  // Function to scroll to the reciters section
  const scrollToRecitersSection = () => {
    if (recitersSectionRef.current) {
      recitersSectionRef.current.scrollIntoView({
        behavior:'instant',
        block: 'start'
      });
    }
  };

  // Effect to scroll when showAllReciters changes from true to false
  useEffect(() => {
    if (!showAllReciters) {
		scrollToRecitersSection();

    }
  }, [showAllReciters]);

  return (
    <div className="py-16 bg-white dark:bg-gray-800" ref={recitersSectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white mb-4">
            تسجيلات متنوعة لمختلف القراء
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            استمع لتلاوتك المفضلة من بين 43 من التلاوات المميزة
          </p>
        </div>

        <div className={`grid gap-6 mb-8 ${showAllReciters ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
          {recitersToDisplay.map((reciter, index) => {
            const reciterId = index + 1; // Convert to 1-based reciter ID
            const imageFilename = reciterImages[reciterId];

			console.log(reciterImageMap[reciterId]);
            return (
              <div
                key={reciterId}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  {reciterImageMap[reciterId] ? (
                    <img
                      src={reciterImageMap[reciterId]}
                      alt={reciter}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to letter avatar if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold ${
                      reciterImageMap[reciterId] ? 'hidden' : ''
                    }`}
                  >
                    {reciter.charAt(0)}
                  </div>
                </div>
                <h3 className="font-semibold text-emerald-950 dark:text-white mb-2 text-sm">
                  {reciter}
                </h3>
                <button
                  onClick={() => handlePlaySample(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors duration-200 ${
                    playingReciter === index
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  } text-white`}
                >
                  {playingReciter === index ? (
                    <FaPause className="text-sm" />
                  ) : (
                    <FaPlay className="text-sm ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg inline-block">
            <p className="text-emerald-800 dark:text-emerald-200 mb-2">
               جودات متعددة متاحة لكل قارئ
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-300">
              اختر من بين جودات مختلفة حسب سرعة اتصالك بالإنترنت
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAllReciters(!showAllReciters)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200"
          >
            {showAllReciters ? 'عرض أقل' : 'اكتشف جميع القراء'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecitersSection;
