import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../config/firebase";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFormSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!email || !password || !confirmPassword) {
        setError("يرجى تعبئة جميع الحقول");
        return;
      }

      if (password !== confirmPassword) {
        setError("كلمة المرور غير مطابقة");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("يرجى إدخال عنوان بريد إلكتروني صحيح");
        return;
      }

      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const actionCodeSettings = {
        url: "https://quran-hub.vercel.app/user/login",
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      if (!auth.currentUser.emailVerified) {
        setMessage("يرجى تأكيد بريدك الالكتروني");
        setError("");
      }
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      //navigate("login");
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center text-emerald-700 dark:text-white">
      <div className="bg-white p-8 mx-4 rounded border border-gray-300 dark:border-0 shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">إنشاء حساب جديد</h2>
        {error && <p className="text-red-500 py-1">{error}</p>}
        {message && <p className="text-emerald-600 py-1">{message}</p>}
        <hr />
        <p className="my-3 text-center">بواسطة الايميل</p>

        <form onSubmit={handleFormSignup}>
          <div className="my-4 mb-4">
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
              placeholder="ادخل بريدك الإلكتروني"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-400 rounded dark:bg-sky-100 dark:text-black focus:outline-none"
              placeholder="ادخل كلمة المرور"
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
              className=" mt-1 p-2 w-full border border-gray-400 rounded dark:bg-sky-100 dark:text-black focus:outline-none"
              placeholder="تأكيد كلمة المرور"
              required
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs md:text-base">
            <button
              type="submit"
              className="bg-emerald-700   text-white px-4 py-2 rounded-full hover:bg-emerald-800"
            >
              إنشاء الحساب
            </button>
            <div className="text-center mt-4 text-xs md:text-base">
              <span className="text-emerald-500">لديك حساب؟</span>{" "}
              <Link
                to="/user/login"
                className=" text-emerald-500 dark:text-emerald-500 hover:underline"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
