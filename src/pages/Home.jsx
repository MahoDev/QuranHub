import { useNavigate, useSearchParams } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import SurahsSection from "../components/SurahsSection";
import { Helmet } from "react-helmet-async";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const mode = searchParams.get("mode");
  if (mode) {
    let navigatePath = "";
    switch (mode) {
      case "verifyEmail":
        navigatePath = `${
          new URL(searchParams.get("continueUrl")).pathname
        }?oobCode=${searchParams.get("oobCode")}`;
        break;
      case "resetPassword":
        navigatePath = `${
          new URL(searchParams.get("continueUrl")).pathname
        }?oobCode=${searchParams.get("oobCode")}`;
        break;
      default:
        console.error("No such mode.");
    }

    navigate(navigatePath);
  }

  return (
    <>
      <Helmet>
        <title>منصة القرآن | الصفحة الرئيسية</title>
        <meta
          name="description"
          content="موقع منصة القرآن هو موقع بسيط وسهل لقراءة القرآن مع مختلف التفاسير والاستماع لتلاوته من قبل مختلف القراء"
        ></meta>
      </Helmet>
      <HeroSection />
      <SurahsSection />
    </>
  );
}

export default Home;
