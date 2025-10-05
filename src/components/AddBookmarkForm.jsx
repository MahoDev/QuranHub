import React, { useEffect, useState } from "react";
import { surahNames, quranPages } from "../assets/data/quran-info";
import { auth, firestore } from "../config/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import LoadingView from "./LoadingView";

function AddBookmarkForm({ currentSurahNum, currentPage, ayahsInCurrentPage }) {
	const [pageNumber, setPageNumber] = useState(currentPage);
	const [ayahNumber, setAyahNumber] = useState("");
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleAddBookmark = async () => {
		// Check if ayahsInCurrentPage is available and not empty
		if (!ayahsInCurrentPage || ayahsInCurrentPage.length === 0) {
			setError("جاري تحميل بيانات السورة، يرجى المحاولة مرة أخرى");
			return;
		}

		// Check if ayahNumber is valid
		if (!ayahNumber) {
			setError("يرجى اختيار آية صالحة");
			return;
		}

		try {
			const ayahText = ayahsInCurrentPage?.find(
				(ayah) => ayahNumber == ayah.aya_no
			)?.aya_text;

			// Check if ayahText is available
			if (!ayahText) {
				setError("لم يتم العثور على نص الآية، يرجى المحاولة مرة أخرى");
				return;
			}

			const bookmarkObj = {
				userId: auth.currentUser.uid,
				surahNumber: currentSurahNum,
				surahName: surahNames[currentSurahNum],
				pageNumber: currentPage,
				ayahNumber: ayahNumber,
				ayahText: ayahText?.slice(0, ayahText?.length - 2),
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
		const firstAyahInPage = ayahsInCurrentPage?.at(0)?.aya_no;
		if (firstAyahInPage) {
			setAyahNumber(firstAyahInPage);
		}
		setPageNumber(currentPage);
	}, [currentPage, ayahsInCurrentPage]);

	return (
		<div className="text-black dark:text-white text-center w-full">
			<h2 className="text-lg font-semibold mt-4 md:mt-2 mb-4">احفظ نقطة مرجعية</h2>
			<div className="flex flex-col gap-3 justify-center items-center max-w-full">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
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
						<p className="text-sm mb-1">الصفحة</p>
						<input
							type="text"
							className="w-full text-center py-2 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-emerald-500 text-sm"
							value={pageNumber}
							readOnly
							disabled
						/>
					</div>
					<div>
						<p className="text-sm mb-1">اختر الآية</p>
						<select
							className="w-full py-2 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-emerald-500 text-sm"
							value={ayahNumber}
							onChange={(e) => setAyahNumber(e.target.value)}
							required
							disabled={!ayahsInCurrentPage || ayahsInCurrentPage.length === 0}
						>
							<option value="" disabled>
								{!ayahsInCurrentPage || ayahsInCurrentPage.length === 0
									? "جاري التحميل..."
									: "اختر الآية"}
							</option>
							{ayahsInCurrentPage?.map((ayah) => (
								<option key={ayah?.id} value={ayah?.aya_no}>
									{ayah?.aya_no}
								</option>
							))}
						</select>
					</div>
				</div>
				<button
					type="submit"
					className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-6 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
					onClick={handleAddBookmark}
					disabled={!ayahsInCurrentPage || ayahsInCurrentPage.length === 0 || !ayahNumber}
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
