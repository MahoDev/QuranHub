import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurahSettings } from '../contexts/surah-settings-context';
import { hizbData } from '../assets/data/quran-structure';
import { surahNames } from '../assets/data/quran-info';

function HizbSelector({ onClose }) {
    const navigate = useNavigate();
    const { surahSettings, onSurahSettingsChange } = useSurahSettings();

    const handleHizbSelect = (hizb, quarter = null) => {
        if (quarter) {
            // Navigate to hizb with specific quarter
            navigate(`/hizb/${hizb.number}?quarter=${hizb.quarters.indexOf(quarter) + 1}`);
        } else {
            // Navigate to hizb start
            navigate(`/hizb/${hizb.number}`);
        }
        
        // Update settings
        onSurahSettingsChange({
            ...surahSettings,
            currentHizb: hizb.number,
            currentQuarter: quarter ? hizb.quarters.indexOf(quarter) + 1 : 1
        });

        if (onClose) onClose();
    };

    return (
        <div className="space-y-6 p-4">
            {hizbData.map((hizb) => (
                <div key={hizb.number} className="space-y-2">
                    <div 
                        onClick={() => handleHizbSelect(hizb)}
                        className={`${
                            surahSettings.currentHizb === hizb.number 
                                ? 'bg-emerald-600 text-white' 
                                : 'hover:bg-emerald-700/50'
                        } p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md`}
                    >
                        <div className="font-medium">{hizb.name}</div>
                        <div className="text-xs mt-1 opacity-75">
                            {surahNames[hizb.startSurah]} {hizb.startAyah}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mr-4">
                        {hizb.quarters.map((quarter, index) => (
                            <div
                                key={index}
                                onClick={() => handleHizbSelect(hizb, quarter)}
                                className={`${
                                    surahSettings.currentHizb === hizb.number &&
                                    surahSettings.currentQuarter === index + 1
                                        ? 'bg-emerald-500 text-white' 
                                        : 'hover:bg-emerald-600/50'
                                } p-2 rounded-lg cursor-pointer text-sm transition-all duration-200`}
                            >
                                ربع {index + 1}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HizbSelector;