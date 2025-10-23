import React from 'react';
import { findJuzBySurahAyah, findHizbBySurahAyah } from '../assets/data/quran-structure';
import { convertToArabicNumbers } from '../utility/text-utilities';

function JuzHizbIndicator({ surahNumber, ayahNumber }) {
    const juz = findJuzBySurahAyah(surahNumber, ayahNumber);
    const hizb = findHizbBySurahAyah(surahNumber, ayahNumber);
    
    if (!juz || !hizb) return null;

    const quarterIndex = hizb.quarters.findIndex(q => 
        q.startSurah === surahNumber && q.startAyah === ayahNumber
    );

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                    {juz.name}
                </span>
                {juz.commonName && (
                    <span className="text-emerald-600/90 dark:text-emerald-400/90 font-medium">
                        ({juz.commonName})
                    </span>
                )}
            </div>
            <div className="hidden sm:block h-4 w-px bg-emerald-600/30 dark:bg-emerald-400/30"></div>
            <div className="flex items-center gap-2">
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                    {hizb.name}
                </span>
                {quarterIndex !== -1 && (
                    <span className="text-emerald-600/90 dark:text-emerald-400/90 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                        الربع {convertToArabicNumbers(quarterIndex + 1)}
                    </span>
                )}
            </div>
        </div>
    );
}

export default JuzHizbIndicator;