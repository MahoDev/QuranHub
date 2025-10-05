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
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";
import SlidingNotification from "../components/SlidingNotifaction";
import { Helmet } from "react-helmet-async";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.recentLoginNeeded) {
      setShowNotification(true);
    }
  });

  // Listen for auth state changes after Google login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate("/");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleFormLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("يرجى تعبئة جميع الحقول");
        return;
      }

      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Check if email is verified after successful login
      if (!userCredentials.user.emailVerified) {
        setError("يرجى تأكيد بريدك الإلكتروني أولاً");
        return;
      }

      navigate("/");
    } catch (err) {
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/user-not-found':
          setError("البريد الإلكتروني غير مسجل");
          break;
        case 'auth/wrong-password':
          setError("كلمة المرور غير صحيحة");
          break;
        case 'auth/too-many-requests':
          setError("تم حظر الحساب مؤقتاً بسبب محاولات تسجيل دخول متكررة");
          break;
        case 'auth/user-disabled':
          setError("تم تعطيل هذا الحساب");
          break;
        default:
          setError("فشل في تسجيل الدخول: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Use popup for all devices - it's more reliable on mobile
      const result = await signInWithPopup(auth, provider);

      // Check if email is verified (Google accounts are pre-verified)
      if (result.user) {
        navigate("/");
      }
    } catch (err) {
      // Handle specific Google auth errors
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError("تم إغلاق نافذة تسجيل الدخول");
          break;
        case 'auth/popup-blocked':
          setError("تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة");
          break;
        case 'auth/account-exists-with-different-credential':
          setError("الحساب موجود باستخدام طريقة تسجيل دخول مختلفة");
          break;
        case 'auth/operation-not-allowed':
          setError("تسجيل الدخول بـ Google غير مفعل");
          break;
        default:
          setError("فشل في تسجيل الدخول بـ Google: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        if (searchParams.get("oobCode")) {
          // Email verification is handled by Firebase automatically
          // when user clicks the verification link
          const currentUser = auth.currentUser;
          if (currentUser) {
            await currentUser.reload();
            if (currentUser.emailVerified) {
              navigate("/user/login", {
                state: { message: "تم تأكيد البريد الإلكتروني بنجاح" }
              });
            }
          }
        }
      } catch (err) {
        setError("فشل في تأكيد البريد الإلكتروني: " + err.message);
      }
    };
    handleEmailVerification();
  }, [searchParams, navigate]);

  return (
    <>
      <Helmet>
        <title>منصة القرآن | تسجيل الدخول</title>
        <meta
          name="description"
          content="صفحة تسجيل الدخول في موقع منصة القرآن"
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 flex justify-center items-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 mx-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌙</div>
            <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
              مرحباً بك
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              سجل دخولك للوصول إلى منصة القرآن
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <div className="mb-8">
            <button
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-xl flex items-center justify-center transition-all duration-200 hover:border-blue-400 hover:shadow-lg group"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                <>
                  <FcGoogle className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">تسجيل الدخول بـ Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                أو باستخدام البريد الإلكتروني
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleFormLogin} className="space-y-6">
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
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2"
              >
                كلمة المرور 🔒
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                placeholder="أدخل كلمة المرور"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  "تسجيل الدخول 🚀"
                )}
              </button>

              <Link
                to="/user/reset"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium hover:underline transition-colors duration-200"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              ليس لديك حساب؟
              <Link
                to="/user/signup"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold hover:underline transition-colors duration-200 mr-2"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Notification */}
        {showNotification && (
          <SlidingNotification message="يجب تسجيل الدخول مرة أخرى قبل القيام بالحذف" />
        )}
      </div>
    </>
  );
}

export default Login;
