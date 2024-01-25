// ResetPasswordConfirmation.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";

function ResetPasswordConfirmation() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Make a request to the server to reset the password using the token and new password
    // Handle success and error scenarios
  };

  return (
    <div className="flex h-screen mx-4 justify-center items-center text-emerald-700 dark:text-white">
      <div className="bg-white p-8 border border-gray-300 dark:border-0 rounded shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">إعادة تعيين كلمة المرور</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-400 rounded dark:bg-sky-100 dark:text-black focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-400 rounded dark:bg-sky-100 dark:text-black focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-center  text-xs md:text-base">
            <button
              type="submit"
              className="bg-emerald-700 text-white px-4 py-2 rounded-full hover:bg-emerald-800"
            >
              إعادة تعيين كلمة المرور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordConfirmation;
