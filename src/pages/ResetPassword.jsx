import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Helmet } from "react-helmet-async";
function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("يرجى إدخال عنوان بريد إلكتروني صحيح");
        return;
      }
      await sendPasswordResetEmail(auth, email, {
        url: "https://quran-hub.vercel.app/user/reset-confirmation",
      });
      setMessage("تم ارسال رسالة التأكيد بنجاح");
      setEmail("");
      setError("");
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  return (
    <>
      <Helmet>
        <title>منصة القرآن | صفحة إعادة تعيين كلمة المرور</title>
        <meta
          name="description"
          content="صفحة إعادة تعيين كلمة المرور في موقع منصة القرآن"
        ></meta>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex h-screen justify-center items-center text-emerald-700 dark:text-white">
        <div className="bg-white p-8 mx-4 rounded shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
          <h2 className="text-2xl font-semibold mb-4">
            إعادة تعيين كلمة المرور
          </h2>
          {error && <p className="text-red-500 py-1">{error}</p>}
          {message && <p className="text-emerald-600 py-1">{message}</p>}

          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-400 rounded dark:bg-sky-100 dark:text-black focus:outline-none"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-emerald-700 text-white px-4 py-2 rounded-full hover:bg-emerald-800"
              >
                إرسال رابط التعيين
              </button>
            </div>
          </form>

          <p className="my-3 text-center">
            <Link
              to="/user/login"
              className="text-sm text-emerald-500 dark:text-emerald-500 hover:underline"
            >
              الرجوع لصفحة تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
