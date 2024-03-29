import React from "react";

function LoadingView({ text = "جاري التحميل" }) {
  return (
    <div className="flex justify-center h-full items-center gap-2 text-gray-500 font-sans">
      {text}
      <span className="h-6 w-6 block rounded-full border-4 border-t-emerald-500 animate-spin"></span>
    </div>
  );
}

export default LoadingView;
