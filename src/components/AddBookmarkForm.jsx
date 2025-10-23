import React, { useEffect, useState } from "react";
import { surahNames } from "../assets/data/quran-info";
import JuzHizbIndicator from "./JuzHizbIndicator";
import { auth, firestore } from "../config/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import LoadingView from "./LoadingView";

function AddBookmarkForm({ currentSurahNum, currentPage, ayahsInCurrentPage, surahData }) {
	const [ayahNumber, setAyahNumber] = useState("");
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	console.log(surahData)

	// Get all ayahs in the current surah
	const getAllAyahsInSurah = () => {
		if (!surahData || surahData.length === 0) return [];

		// Group ayahs by aya_no to get unique ayahs
		const ayahMap = new Map();
		surahData.forEach(ayah => {
			if (!ayahMap.has(ayah.aya_no)) {
				ayahMap.set(ayah.aya_no, ayah);
			}
		});

		return Array.from(ayahMap.values()).sort((a, b) => a.aya_no - b.aya_no);
	};

	const handleAddBookmark = async () => {
		// Check if ayahNumber is valid
		if (!ayahNumber) {
			setError("يرجى اختيار آية صالحة");
			return;
		}

		try {
			// Get the selected ayah data
			const allAyahs = getAllAyahsInSurah();
			const selectedAyah = allAyahs.find(ayah => ayah.aya_no == ayahNumber);

			if (!selectedAyah) {
				setError("لم يتم العثور على الآية المحددة");
				return;
			}

			const bookmarkObj = {
				userId: auth.currentUser.uid,
				surahNumber: currentSurahNum,
				surahName: surahNames[currentSurahNum],
				pageNumber: selectedAyah.page || currentPage,
				ayahNumber: ayahNumber,
				ayahText: selectedAyah.aya_text?.slice(0, selectedAyah.aya_text?.length - 2) || selectedAyah.aya_text,
				bookmarkDate: Timestamp.fromDate(new Date()),
			};
			console.log(bookmarkObj);
			const collectionRef = collection(firestore, "bookmarks");
			setLoading(true);
			await addDoc(collectionRef, bookmarkObj);
			setSuccess(true);
			setError("");
		} catch (err) {
			console.error("Error adding bookmark: " + err.message);
			setError("فشل الحفظ");
			setSuccess(false);
		} finally {
			if (auth.currentUser === null) {
				setError("يجب تسجيل الدخول أولا");
			}
			setTimeout(() => {
				setSuccess(false);
				setError("");
			}, 3000); // Clear success or error message after 3 seconds
			setLoading(false);
		}
	};

	useEffect(() => {
		// Auto-select first ayah of current page when page or surah data changes
		if (surahData && surahData.length > 0 && currentPage) {
			// Find the first ayah in the current page
			const ayahsInCurrentPage = surahData.filter(ayah => ayah.page === currentPage);
			const firstAyahInPage = ayahsInCurrentPage.length > 0 ? ayahsInCurrentPage[0] : null;

			if (firstAyahInPage) {
				setAyahNumber(firstAyahInPage.aya_no);
			}
		}
	}, [surahData, currentPage]);

	const allAyahsInSurah = getAllAyahsInSurah();

	// Helper function to clip text
	const clipText = (text, maxLength = 50) => {
		if (!text) return "";
		return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
	};

	return (
		<div className="text-black dark:text-white text-center w-full">
			<h2 className="text-lg font-semibold mb-4">احفظ نقطة مرجعية</h2>
			<div className="flex flex-col gap-3 justify-center items-center max-w-full">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
					<div>
						<p className="text-sm mb-1">السورة</p>
						<input
							type="text"
							className="w-full text-center py-2 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-emerald-500 text-sm"
							value={surahNames[currentSurahNum]}
							title={surahNames[currentSurahNum]}
							readOnly
							disabled
						/>
					</div>
					<div>
						<p className="text-sm mb-1">اختر الآية</p>
						<select
							className="w-full py-2 px-3 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-emerald-500 text-sm"
							value={ayahNumber}
							onChange={(e) => setAyahNumber(e.target.value)}
							required
							disabled={!allAyahsInSurah || allAyahsInSurah.length === 0}
						>
							<option value="" disabled>
								{!allAyahsInSurah || allAyahsInSurah.length === 0
									? "جاري التحميل..."
									: "اختر الآية"}
							</option>
							{allAyahsInSurah.map((ayah) => (
								<option key={ayah.aya_no} value={ayah.aya_no}>
									آية {ayah.aya_no}: {clipText(ayah.aya_text_emlaey || "", 40)}
								</option>
							))}
						</select>
					</div>
				</div>
				<button
					type="submit"
					className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-6 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
					onClick={handleAddBookmark}
					disabled={!allAyahsInSurah || allAyahsInSurah.length === 0 || !ayahNumber}
				>
					حفظ
				</button>
			</div>
			<div className="mt-3 min-h-[24px]">
				{loading ? (
					<div className="text-emerald-600 dark:text-emerald-400">جاري الحفظ...</div>
				) : (
					<>
						{success && <p className="text-green-500 text-sm">تم الحفظ بنجاح</p>}
						{error && <p className="text-red-500 text-sm">{error}</p>}
					</>
				)}
			</div>
		</div>
	);
}

export default AddBookmarkForm;
