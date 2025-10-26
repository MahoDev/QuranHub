import { useState, useEffect } from "react";
import { FaBookmark, FaTimes } from "react-icons/fa";
import { convertToArabicNumbers } from "../utility/text-utilities";
import { useBookmarks } from "../contexts/bookmark-context";
import { surahNames } from "../assets/data/quran-info";

function JuzHizbBookmarkForm({ currentData, surahData, type, onClose }) {
	const [selectedVerse, setSelectedVerse] = useState("");
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { toggleBookmark, isBookmarked, loading: bookmarkLoading } = useBookmarks();

	// Get all verses in the current juz/hizb
	const getAllVersesInJuzHizb = () => {
		if (!surahData || surahData.length === 0) return [];

		// Group verses by surah and ayah to get unique verses
		const verseMap = new Map();
		surahData.forEach(verse => {
			const key = `${verse.sura_no}_${verse.aya_no}`;
			if (!verseMap.has(key)) {
				verseMap.set(key, verse);
			}
		});

		return Array.from(verseMap.values()).sort((a, b) => {
			if (a.sura_no !== b.sura_no) return a.sura_no - b.sura_no;
			return a.aya_no - b.aya_no;
		});
	};

	const handleBookmark = async () => {
		if (!selectedVerse) {
			setError("يرجى اختيار آية صالحة");
			return;
		}

		try {
			// Find the selected verse data
			const allVerses = getAllVersesInJuzHizb();
			let verseData = allVerses.find(verse => verse.aya_no == selectedVerse && verse.sura_no === currentData.startSurah);

			if (!verseData) {
				// Try to find in other surahs within the juz/hizb
				const targetVerse = allVerses.find(verse => verse.aya_no == selectedVerse);
				if (!targetVerse) {
					setError("لم يتم العثور على الآية المحددة");
					return;
				}
				verseData = targetVerse;
			}

			const bookmarkSuccess = await toggleBookmark(
				verseData.sura_no,
				surahNames[verseData.sura_no], // Use actual surah name
				verseData.page,
				selectedVerse,
				verseData.aya_text,
				type, // 'juz' or 'hizb'
				type === 'juz' ? currentData.number : null,
				type === 'hizb' ? currentData.number : null,
				type === 'juz' ? currentData.name : null,
				type === 'hizb' ? currentData.name : null
			);

			if (bookmarkSuccess) {
				setSuccess(true);
				setError("");
				setTimeout(() => {
					setSuccess(false);
					onClose();
				}, 1500);
			} else {
				setError("فشل في حفظ العلامة المرجعية");
			}
		} catch (err) {
			console.error("Error bookmarking:", err);
			console.log("Error bookmarking:");
			setError("فشل في حفظ العلامة المرجعية");
		} finally {
			setLoading(false);
		}
	};

	// Auto-select first verse when component mounts
	useEffect(() => {
		if (surahData && surahData.length > 0) {
			setSelectedVerse(surahData[0].aya_no);
		}
	}, [surahData]);

	const allVerses = getAllVersesInJuzHizb();

	// Helper function to clip text
	const clipText = (text, maxLength = 60) => {
		if (!text) return "";
		return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
	};

	// Check if current selection is bookmarked
	const currentVerseData = allVerses.find(verse => verse.aya_no == selectedVerse);
	const isCurrentSelectionBookmarked = currentVerseData ?
		isBookmarked(currentVerseData.sura_no, selectedVerse, type, type === 'juz' ? currentData.number : null, type === 'hizb' ? currentData.number : null) :
		false;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<div>
						<h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
							<FaBookmark className="inline ml-2 text-emerald-600" />
							حفظ علامة مرجعية
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
							{type === 'juz' ? `الجزء ${convertToArabicNumbers(currentData.number)}` : `الحزب ${convertToArabicNumbers(currentData.number)}`}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
					>
						<FaTimes className="text-lg" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							اختر الآية المراد حفظها:
						</label>
						<select
							className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							value={selectedVerse}
							onChange={(e) => setSelectedVerse(e.target.value)}
							disabled={!allVerses || allVerses.length === 0}
						>
							<option value="" disabled>
								{!allVerses || allVerses.length === 0 ? "جاري التحميل..." : "اختر الآية"}
							</option>
							{allVerses.map((verse) => (
								<option key={`${verse.sura_no}_${verse.aya_no}`} value={verse.aya_no}>
									آية {convertToArabicNumbers(verse.aya_no)} - {clipText(verse.aya_text_emlaey || "", 50)}
								</option>
							))}
						</select>
					</div>

					{/* Preview */}
					{currentVerseData && (
						<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
							<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">معاينة:</h4>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								السورة: {currentData.name}
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
								الآية: {convertToArabicNumbers(selectedVerse)}
							</p>
							<p className="text-sm text-gray-800 dark:text-gray-200 font-quranMain leading-relaxed">
								{clipText(currentVerseData.aya_text || "", 100)}
							</p>
						</div>
					)}

					{/* Status Messages */}
					<div className="min-h-[24px] mb-4">
						{loading || bookmarkLoading ? (
							<div className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
								جاري الحفظ...
							</div>
						) : (
							<>
								{success && (
									<p className="text-green-600 dark:text-green-400 text-sm flex items-center">
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										تم الحفظ بنجاح!
									</p>
								)}
								{error && (
									<p className="text-red-600 dark:text-red-400 text-sm flex items-center">
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
										{error}
									</p>
								)}
							</>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<button
							onClick={handleBookmark}
							disabled={!selectedVerse || loading || bookmarkLoading}
							className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
								!selectedVerse || loading || bookmarkLoading
									? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
									: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
							}`}
						>
							{isCurrentSelectionBookmarked ? 'إزالة العلامة المرجعية' : 'حفظ العلامة المرجعية'}
						</button>
						<button
							onClick={onClose}
							className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
						>
							إلغاء
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default JuzHizbBookmarkForm;
