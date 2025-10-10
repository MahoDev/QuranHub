import { FaBookOpen, FaHeadphones, FaSearch, FaMoon, FaBookmark, FaFont } from "react-icons/fa";

function FeaturesSection() {
	const features = [
		{
			icon: <FaBookOpen className="text-4xl text-emerald-600 mb-4" />,
			title: "قراءة مريحة",
			description: "قراءة القرآن الكريم بالرسم العثماني مع إمكانية تكبير وتصغير الخط حسب الرغبة والاستماع لطريقة نطق أي كلمة بالضغط عليها"
		},
		{
			icon: <FaMoon className="text-4xl text-emerald-600 mb-4" />,
			title: "الوضع الليلي",
			description: "قراءة مريحة للعين في الإضاءة الخافتة مع خلفية داكنة وألوان مناسبة"
		},
		{
			icon: <FaHeadphones className="text-4xl text-emerald-600 mb-4" />,
			title: "تلاوات متنوعة",
			description: "استماع لأكثر من 43 تسجيل لقراء مختلفين بجودات مختلفة مراعاة لسرعات الانترنت المختلفة"
		},
		{
			icon: <FaSearch className="text-4xl text-emerald-600 mb-4" />,
			title: "الانتقال والبحث السهل",
			description: "امكانية البحث عن السور والصفحات والآيات المرادة في القرآن بأكمله بسهولة"
		},
		{
			icon: <FaBookmark className="text-4xl text-emerald-600 mb-4" />,
			title: "حفظ المواضع المرجعية",
			description: "حفظ مواضع القراءة والعودة إليها من صفحة حسابك الشخصي في أي وقت مع المزامنة عبر مختلف الأجهزة"
		},
		{
			icon: <FaFont className="text-4xl text-emerald-600 mb-4" />,
			title: "تفسير الآيات",
			description: "إتاحة العديد من التفاسير من مختلف المفسرين"
		}
	];

	return (
		<div className="py-16 bg-gray-50 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white mb-4">
						مميزات منصة القرآن
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						نسعى لأن نوفر لك أفضل تجربة في قراءة وتدبر القرآن الكريم 
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
						>
							<div className="flex justify-center">
								{feature.icon}
							</div>
							<h3 className="text-xl font-semibold text-emerald-950 dark:text-white mb-3">
								{feature.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default FeaturesSection;
