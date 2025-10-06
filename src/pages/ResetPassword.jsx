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
        url: "https://koranread.com/user/reset-confirmation",
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
        <title>منصة القرآن | إعادة تعيين كلمة المرور</title>
        <meta
          name="description"
          content="صفحة إعادة تعيين كلمة المرور في موقع منصة القرآن"
        />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 flex justify-center items-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 mx-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔑</div>
            <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{message}</p>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2"
              >
                البريد الإلكتروني 📧
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                إرسال رابط إعادة التعيين 📬
              </button>
            </div>
          </form>

          {/* Back to Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              تذكرت كلمة المرور؟
              <Link
                to="/user/login"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold hover:underline transition-colors duration-200 mr-2"
              >
                العودة لتسجيل الدخول
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
              سنرسل رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
              تأكد من التحقق من مجلد البريد المزعج إذا لم تجد الرسالة.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
export default ResetPassword;
