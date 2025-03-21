import { useNavigate, useSearchParams } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import SurahsSection from "../components/SurahsSection";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

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

	useEffect(() => {
		window.prerenderReady = true;
	}, []);

	return (
		<>
			<Helmet>
				<title>منصة القرآن | الصفحة الرئيسية</title>
				<meta
					name="description"
					content="موقع يقدم القران الكريم مكتوب بخط واضح وبالتشكيل مع امكانية تكبير وتصغير الخط والقراءة بالوضع الليلي مع تفسير الايات والاستماع لتلاوات مختلف القراء وحفظ مواضع القراءة"
				></meta>
				<script type="application/ld+json">
					{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "منصة القرآن",
            "url": "https://quran-hub.vercel.app/",
            "description": "موقع يقدم القران الكريم مكتوب بخط واضح وبالتشكيل مع امكانية تكبير وتصغير الخط والقراءة بالوضع الليلي مع تفسير الايات والاستماع لتلاوات مختلف القراء وحفظ مواضع القراءة"
          }
        `}
				</script>
			</Helmet>
			<HeroSection />
			<SurahsSection />
		</>
	);
}

export default Home;
