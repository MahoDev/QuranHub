export function convertToArabicNumbers(inputString) {
  const englishNumerals = /[0-9]/g;
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return inputString
    ?.toString()
    ?.replace(englishNumerals, (match) => arabicNumerals[parseInt(match)]);
}
//
export function fixDiacritics(arabicText) {
  const wrongSukunRegex = /[\u06dfۡ]/g;

  // Use the regular expression to replace faulty sukun characters with correct one
  const processedText = arabicText?.replace(wrongSukunRegex, "\u0652");
  //do nothing temporarliy
  return arabicText.trim();
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.round(seconds % 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

/*To allow dynamic classnames in jsx
/* text-xxl , text-3xl , text-4xl , text-5xl , text-6xl , text-7xl , text-8xl , text-9xl */
