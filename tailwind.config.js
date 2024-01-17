/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {},
      container: {
        padding: {
          DEFAULT: "2rem",
          xs: "2rem",
          sm: "2rem",
          md: "2rem",
          lg: "2rem",
          xl: "2rem",
        },
        width: {
          md: "100%",
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
  plugins: [require("tailwind-scrollbar")],
  variants: {
    // ...
    scrollbar: ["dark"],
  },
};
