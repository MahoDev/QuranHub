// Login.js
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  applyActionCode,
} from "firebase/auth";
import { auth } from "../config/firebase";
import SlidingNotification from "../components/SlidingNotifaction";
import { Helmet } from "react-helmet-async";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.recentLoginNeeded) {
      setShowNotification(true);
    }
  });

  const handleFormLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!email || !password) {
        setError("يرجى تعبئة جميع الحقول");
        return;
      }
      if (
        auth?.currentUser?.emailVerified == false &&
        searchParams.get("oobCode") == null
      ) {
        setError("يرجى تأكيد بريدك الالكتروني");
      }
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      // Check if the user is on a mobile device
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        await signInWithRedirect(auth, provider);
      } else {
        // Redirect user to Google login page for login on non-mobile devices
        await signInWithPopup(auth, provider);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const handleVerification = async () => {
      try {
        if (searchParams !== null && searchParams.get("oobCode") !== null)
          applyActionCode(auth, searchParams.get("oobCode"));
      } catch (err) {
        setError(err.message);
      }
    };
    handleVerification();
  }, []);

  return (
    <>
      <Helmet>
        <title>منصة القرآن | تسجيل الدخول</title>
        <meta
          name="description"
          content="صفحة تسجيل الدخول في موقع منصة القرآن"
        ></meta>
      </Helmet>
      <div className="flex h-screen justify-center items-center text-emerald-700 dark:text-white">
        <div className="bg-white p-8 mx-4 rounded border border-gray-300 dark:border-0 shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white">
          {error && <p className="text-red-500">{error}</p>}

          <h2 className="text-2xl font-semibold mb-4">تسجيل الدخول</h2>

          <div className="flex flex-col relative space-y-4 mb-4 text-xs md:text-base">
            <button
              className="bg-blue-800 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center justify-center"
              onClick={(e) => {
                handleGoogleLogin(e);
              }}
            >
              تسجيل الدخول بواسطة جوجل
              <FcGoogle className="h-5 w-5 mr-2   " />
            </button>
          </div>

          <hr />
          <p className="my-3 text-center">أو بواسطة الايميل</p>

          <form onSubmit={handleFormLogin}>
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
              <Link
                to="/user/reset"
                className="text-emerald-500 hover:underline"
              >
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
        {showNotification && (
          <SlidingNotification message="يجب تسجيل الدخول مرة أخرى قبل القيام بالحذف" />
        )}
      </div>
    </>
  );
}

export default Login;
