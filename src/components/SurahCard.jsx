import { convertToArabicNumbers } from "../utility/text-utilities";

function SurahCard({ order, name, versesCount, type, onClick }) {
  const isMeccan = type === "Meccan";

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-1 min-h-[140px] flex flex-col"
    >
      {/* Header with number badge and type */}
      <div className="flex items-start justify-between mb-3">
        <div className="bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 rounded-lg p-2 transition-colors duration-300">
          <span className="text-emerald-700 dark:text-emerald-300 font-bold text-base font-tajwal">
            {convertToArabicNumbers(order)}
          </span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isMeccan
            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
            : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
        }`}>
          {isMeccan ? "مكية" : "مدنية"}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex flex-col justify-center text-center">
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 font-tajwal">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {convertToArabicNumbers(versesCount)} آية
        </p>
      </div>

      {/* Progress bar on hover */}
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div className="bg-emerald-500 h-1 rounded-full w-1/3 transition-all duration-500 group-hover:w-full"></div>
        </div>
      </div>
    </div>
  );
}

export default SurahCard;
