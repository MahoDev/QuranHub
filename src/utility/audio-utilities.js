let currentAudio = null;

const generateWordAudioSrc = (currentWordInfo) => {
    if (!currentWordInfo) return null;
    const { surahNo, ayahNo, index, hash } = currentWordInfo;
    return `https://words.audios.quranwbw.com/${surahNo}/${surahNo
        .toString()
        .padStart(3, "0")}_${ayahNo.toString().padStart(3, "0")}_${index
        .toString()
        .padStart(3, "0")}.mp3#${hash}`;
};

export const playWordPronunciation = async (wordInfo) => {
    // Stop any currently playing audio
    stopWordPronunciation();

    // Create new audio element
    const audioSrc = generateWordAudioSrc(wordInfo);
    if (!audioSrc) return;

    currentAudio = new Audio(audioSrc);
    
    try {
        await currentAudio.play();
    } catch (error) {
        console.error('Error playing word pronunciation:', error);
    }
};

export const stopWordPronunciation = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};

// Clean up audio on window unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        stopWordPronunciation();
    });
}
