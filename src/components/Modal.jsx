import React from "react";

function Modal({
  bodyText,
  confirmBtnText = "تأكيد",
  cancelBtnText = "إلغاء",
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-xl font-semibold mb-4">{bodyText}</p>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-full mr-2"
          >
            {cancelBtnText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-full"
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
