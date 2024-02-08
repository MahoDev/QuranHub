import { useNavigate, useSearchParams } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import SurahsSection from "../components/SurahsSection";

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
      <HeroSection />
      <SurahsSection />
    </>
  );
}

export default Home;
