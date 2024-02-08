// ResetPasswordConfirmation.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";

function ResetPasswordConfirmation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (newPassword !== confirmPassword) {
        setError("كلمة المرور غير مطابقة");
        return;
      }
      await confirmPasswordReset(
        auth,
        searchParams.get("oobCode"),
        newPassword
      );
      signInWithEmailAndPassword(auth, email, newPassword);
      navigate("/", {
        state: {
          successMessage: "تم تغيير كلمة السر بنجاح",
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const emailAddress = await verifyPasswordResetCode(
          auth,
          searchParams.get("oobCode")
        );
        setEmail(emailAddress);
      } catch (err) {
        navigate("/", {
          state: {
            errorMessage: err.message,
          },
        });
      }
    };
    if (searchParams.get("oobCode")) {
      handleVerification();
    }
  }, []);

  return (
    <div className="flex h-screen mx-4 justify-center items-center text-emerald-700 dark:text-white">
      <div className="bg-white p-8 border border-gray-300 dark:border-0 rounded shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">إعادة تعيين كلمة المرور</h2>
        {error && <p className="text-red-500 py-1">{error}</p>}

        <form onSubmit={handleFormSubmit}>
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
          <div className="flex justify-center  text-xs md:text-base">
            <button
              type="submit"
              className="bg-emerald-700 text-white px-4 py-2 rounded-full hover:bg-emerald-800"
            >
              تأكيد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordConfirmation;
