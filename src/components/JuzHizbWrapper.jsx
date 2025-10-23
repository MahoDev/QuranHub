import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import LoadingView from '../components/LoadingView';
import JuzHizbReader from '../pages/JuzHizbReader';

function JuzHizbWrapper({ quranText, isDarkMode }) {
    const { number } = useParams();
    const type = window.location.pathname.startsWith('/juz/') ? 'juz' : 'hizb';
    const parsedNumber = parseInt(number);

    if (!quranText) {
        return <LoadingView />;
    }

    if (isNaN(parsedNumber)) {
        return <Navigate to={`/${type}/1`} />;
    }

    // Validate juz/hizb number ranges
    if (type === 'juz' && (parsedNumber < 1 || parsedNumber > 30)) {
        return <Navigate to="/juz/1" />;
    } else if (type === 'hizb' && (parsedNumber < 1 || parsedNumber > 60)) {
        return <Navigate to="/hizb/1" />;
    }

    return (
        <JuzHizbReader
            quranText={quranText}
            isDarkMode={isDarkMode}
            type={type}
        />
    );
}

export default JuzHizbWrapper;