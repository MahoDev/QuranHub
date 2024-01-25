import React, { useState } from "react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle form submission
  const handleSignup = (e) => {
    e.preventDefault();

    // Perform signup logic here using name, email, password, and confirmPassword states
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    // Clear form fields after submission if needed
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex h-screen justify-center items-center text-emerald-700 dark:text-white">
      <div className="bg-white p-8 mx-4 rounded border border-gray-300 dark:border-0 shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">إنشاء حساب جديد</h2>

        <div className="flex flex-col space-y-4 mb-4 text-xs md:text-base">
          <button className="bg-blue-600 hover:bg-blue-600/90 text-white px-3 py-2 rounded-full flex items-center justify-center">
            التسجيل بواسطة فيسبوك
            <FaFacebook className="h-5 w-5 mr-2" />
          </button>

          <button className="bg-red-500 hover:bg-red-500/90 text-white px-3 py-2 rounded-full flex items-center justify-center">
            التسجيل بواسطة جوجل
            <FaGoogle className="h-5 w-5 mr-2" />
          </button>

          <button className="bg-black hover:bg-black/90 text-white px-3 py-2 rounded-full flex items-center justify-center ">
            تسجيل الدخول بواسطة آبل
            <FaApple className="h-5 w-5 mr-2" />
          </button>
        </div>

        <hr />
        <p className="my-3 text-center">أو بواسطة الايميل</p>

        <form onSubmit={handleSignup}>
          <div className="my-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              اسم الحساب
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-400 rounded dark:bg-sky-100 dark:text-black focus:outline-none"
              placeholder="ادخل اسم الحساب"
              required
            />
          </div>
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
            <Link
              to="/user/login"
              className=" text-emerald-500 dark:text-emerald-500 hover:underline"
            >
              لديك حساب؟ تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
