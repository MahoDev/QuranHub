import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();

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
            src="/src/assets/imgs/quran1.png"
            alt="قرآن 1"
            className="w-full lg:w-[calc(100%/2-30px)] h-[350px] object-cover rounded-xl"
          />
          <img
            src="/src/assets/imgs/quran2.png"
            alt="قرآن 1"
            className="hidden  w-full  h-[350px] object-cover rounded-xl lg:w-[calc(100%/2-30px)] lg:block"
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
              navigate("/surah/1");
            }}
            className="w-full py-4 bg-emerald-700 text-white rounded-full mb-4 hover:bg-emerald-600"
          >
            ابدء القراءة
          </button>
          <button
            onClick={() => {
              navigate("/surah/1");
            }}
            className="w-full py-4 bg-amber-500 text-black rounded-full hover:bg-amber-400"
          >
            ابدء الاستماع
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
