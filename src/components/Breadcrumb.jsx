import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { surahNames } from '../assets/data/quran-info';
import { juzData, hizbData } from '../assets/data/quran-structure';
import { convertToArabicNumbers } from '../utility/text-utilities';

function Breadcrumb({ surahNumber, currentVerse, currentPage }) {
    // Find current juz and hizb based on surah and verse
    const currentJuz = juzData.find(juz => {
        if (juz.startSurah === juz.endSurah) {
            return surahNumber === juz.startSurah && 
                   currentVerse >= juz.startAyah && 
                   currentVerse <= juz.endAyah;
        }
        return (surahNumber > juz.startSurah || (surahNumber === juz.startSurah && currentVerse >= juz.startAyah)) &&
               (surahNumber < juz.endSurah || (surahNumber === juz.endSurah && currentVerse <= juz.endAyah));
    });

    const currentHizb = hizbData.find(hizb => {
        if (hizb.startSurah === hizb.endSurah) {
            return surahNumber === hizb.startSurah && 
                   currentVerse >= hizb.startAyah && 
                   currentVerse <= hizb.endAyah;
        }
        return (surahNumber > hizb.startSurah || (surahNumber === hizb.startSurah && currentVerse >= hizb.startAyah)) &&
               (surahNumber < hizb.endSurah || (surahNumber === hizb.endSurah && currentVerse <= hizb.endAyah));
    });

    // Determine which quarter (Rub') within the current hizb contains the current (surah, ayah)
    const comparePos = (s1, a1, s2, a2) => {
        if (s1 !== s2) return s1 - s2;
        return a1 - a2;
    };

    let currentQuarter = -1;
    if (currentHizb && Array.isArray(currentHizb.quarters) && currentHizb.quarters.length > 0) {
        for (let i = 0; i < currentHizb.quarters.length; i++) {
            const start = currentHizb.quarters[i];
            const next = currentHizb.quarters[i + 1];
            // end boundary is next quarter start, or the hizb end for the last quarter
            const end = next ? { startSurah: next.startSurah, startAyah: next.startAyah } : { startSurah: currentHizb.endSurah, startAyah: currentHizb.endAyah };

            const afterOrEqualStart = comparePos(surahNumber, currentVerse, start.startSurah, start.startAyah) >= 0;
            // For last quarter we include equality to end, otherwise treat end as exclusive
            const beforeEnd = next ? comparePos(surahNumber, currentVerse, end.startSurah, end.startAyah) < 0 : comparePos(surahNumber, currentVerse, end.startSurah, end.startAyah) <= 0;

            if (afterOrEqualStart && beforeEnd) {
                currentQuarter = i;
                break;
            }
        }
        // If we couldn't find an exact quarter match (edge cases), fall back to the last quarter whose start <= current position
        if (currentQuarter === -1) {
            let fallback = 0;
            for (let i = 0; i < currentHizb.quarters.length; i++) {
                const s = currentHizb.quarters[i];
                if (comparePos(surahNumber, currentVerse, s.startSurah, s.startAyah) >= 0) {
                    fallback = i;
                } else {
                    break;
                }
            }
            currentQuarter = fallback;
        }
    }

    return (
        <nav className="w-full flex justify-center">
            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50 overflow-x-auto whitespace-nowrap text-center">
                {/* Visual-only breadcrumb: non-interactive spans */}
                {currentJuz && (
                    <>
                        <FaChevronLeft className="text-emerald-600/50 dark:text-emerald-400/50" />
                        <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                            {currentJuz.name}{currentJuz.commonName ? ` (${currentJuz.commonName})` : ''}
                        </span>
                    </>
                )}

                {currentHizb && (
                    <>
                        <FaChevronLeft className="text-emerald-600/50 dark:text-emerald-400/50" />
                        <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                            {currentHizb.name}{currentQuarter !== -1 ? ` (الربع ${convertToArabicNumbers(currentQuarter + 1)})` : ''}
                        </span>
                    </>
                )}

                <FaChevronLeft className="text-emerald-600/50 dark:text-emerald-400/50" />
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                    {surahNames[surahNumber]}
                </span>

                <FaChevronLeft className="text-emerald-600/50 dark:text-emerald-400/50" />
                <span className="text-emerald-600 dark:text-emerald-400">صفحة {convertToArabicNumbers(currentPage)}</span>
            </div>
        </nav>
    );
}

export default Breadcrumb;