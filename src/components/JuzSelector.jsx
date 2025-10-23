import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurahSettings } from '../contexts/surah-settings-context';
import { juzData } from '../assets/data/quran-structure';
import { surahNames } from '../assets/data/quran-info';

function JuzSelector({ onClose }) {
    const navigate = useNavigate();
    const { surahSettings, onSurahSettingsChange } = useSurahSettings();

    const handleJuzSelect = (juz) => {
        // Navigate to the dedicated juz reader
        navigate(`/juz/${juz.number}`);
        
        // Update settings
        onSurahSettingsChange({
            ...surahSettings,
            currentJuz: juz.number
        });

        if (onClose) onClose();
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {juzData.map((juz) => (
                <div
                    key={juz.number}
                    onClick={() => handleJuzSelect(juz)}
                    className={`${
                        surahSettings.currentJuz === juz.number 
                            ? 'bg-emerald-600 text-white' 
                            : 'hover:bg-emerald-700/50'
                    } p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md text-center`}
                >
                    <div className="font-medium">{juz.name}</div>
                    <div className="text-xs mt-1 opacity-75">
                        {surahNames[juz.startSurah]} {juz.startAyah}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default JuzSelector;