// Login.js
import React, { useState } from "react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Perform login logic here using email and password states
    console.log("Email:", email);
    console.log("Password:", password);

    // Clear form fields after submission if needed
    setEmail("");
    setPassword("");
  };
  return (
    <div className="flex h-screen justify-center items-center text-emerald-700 dark:text-white">
      <div className="bg-white p-8 mx-4 rounded border border-gray-300 dark:border-0 shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">تسجيل الدخول</h2>

        <div className="flex flex-col space-y-4 mb-4 text-xs md:text-base">
          <button className="bg-blue-600 hover:bg-blue-600/90 text-white px-3 py-2 rounded-full flex items-center justify-center">
            تسجيل الدخول بواسطة فيسبوك
            <FaFacebook className="h-5 w-5 mr-2" />
          </button>

          <button className="bg-red-500 hover:bg-red-500/90 text-white px-3 py-2 rounded-full flex items-center justify-center">
            تسجيل الدخول بواسطة جوجل
            <FaGoogle className="h-5 w-5 mr-2" />
          </button>

          <button className="bg-black hover:bg-black/90 text-white px-3 py-2 rounded-full flex items-center justify-center ">
            تسجيل الدخول بواسطة آبل
            <FaApple className="h-5 w-5 mr-2" />
          </button>
        </div>

        <hr />
        <p className="my-3 text-center">أو بواسطة الايميل</p>

        <form onSubmit={handleLogin}>
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
              placeholder="بريدك الإلكتروني"
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
              placeholder="كلمة المرور"
              required
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs md:text-base">
            <button
              type="submit"
              className="bg-emerald-700 text-white px-4 py-2 rounded-full hover:bg-emerald-800"
            >
              تسجيل الدخول
            </button>
            <Link to="/user/reset" className="text-emerald-500 hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className="text-center mt-4 text-xs md:text-base">
            <span className="text-emerald-500">ليس لديك حساب؟</span>{" "}
            <Link
              to="/user/signup"
              className="text-emerald-500 hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
