function SurahCard({ order, name, versesCount, type, onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-full sm:w-[calc(100%/2-16px)] lg:w-[calc(100%/4-16px)] flex items-center p-2 gap-3 cursor-pointer text-emerald-950 dark:text-white rounded-lg border-solid border-2 border-stone-400 border-opacity-70  hover:bg-emerald-700 hover:border-emerald-700 hover:text-white group"
    >
      <div className="bg-slate-300 dark:bg-slate-600 rounded text-sm px-2 py-1 h-fit group-hover:bg-white  group-hover:text-emerald-700">
        {order}
      </div>
      <div>
        <p className="font-bold text-base ">{name}</p>
        <p className="font-bold text-xs">{versesCount} آيات</p>
      </div>
      <p>{type == "Meccan" ? "مكية" : "مدنية"}</p>
    </div>
  );
}

export default SurahCard;
