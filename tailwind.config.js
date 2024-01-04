/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "375px",
      },
      container: {
        padding: {
          DEFAULT: "2rem",
          xs: "2rem",
          sm: "0",
          md: "0",
          lg: "0",
          xl: "0",
        },

        center: true,
      },
      lineHeight: {
        "extra-loose": "2.2",
      },
      fontFamily: {
        quranMain: ["UthmanicHafs_v22"],
        siteText: ["Lateef", "serif"],
        surahName: ['"Surah Name - Ejazah style"'],
      },
    },
  },
  plugins: [],
};
