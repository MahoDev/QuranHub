import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { FcGoogle } from "react-icons/fc";
import { Helmet } from "react-helmet-async";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    // Password must be at least 8 characters with mix of letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleFormSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password || !confirmPassword) {
        setError("يرجى تعبئة جميع الحقول");
        return;
      }

      if (password !== confirmPassword) {
        setError("كلمة المرور غير مطابقة");
        return;
      }

      if (!validatePassword(password)) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أرقام وحروف");
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
        url: `${window.location.origin}/user/login`,
        handleCodeInApp: true,
      };

      await sendEmailVerification(userCredentials.user, actionCodeSettings);

      // Navigate to login with success message
      navigate("/user/login", {
        state: {
          message: "تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني لتسجيل الدخول"
        }
      });

    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError("البريد الإلكتروني مستخدم بالفعل");
          break;
        case 'auth/weak-password':
          setError("كلمة المرور ضعيفة جداً");
          break;
        case 'auth/invalid-email':
          setError("عنوان البريد الإلكتروني غير صحيح");
          break;
        case 'auth/operation-not-allowed':
          setError("إنشاء الحساب غير مفعل حالياً");
          break;
        default:
          setError("فشل في إنشاء الحساب: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        navigate("/", {
          state: {
            message: "تم تسجيل الدخول بنجاح باستخدام Google"
          }
        });
      }
    } catch (err) {
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError("تم إغلاق نافذة التسجيل");
          break;
        case 'auth/popup-blocked':
          setError("تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة");
          break;
        case 'auth/account-exists-with-different-credential':
          setError("الحساب موجود باستخدام طريقة تسجيل دخول مختلفة");
          break;
        default:
          setError("فشل في التسجيل بـ Google: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>منصة القرآن | إنشاء حساب</title>
        <meta
          name="description"
          content="صفحة إنشاء حساب جديد في موقع منصة القرآن"
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900 flex justify-center items-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 p-8 mx-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl w-full max-w-md transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌟</div>
            <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
              انضم إلينا
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              أنشئ حسابك وابدأ رحلتك مع القرآن الكريم
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Google Signup Button */}
          <div className="mb-8">
            <button
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-xl flex items-center justify-center transition-all duration-200 hover:border-blue-400 hover:shadow-lg group"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  جاري إنشاء الحساب...
                </div>
              ) : (
                <>
                  <FcGoogle className="h-6 w-6 mr-3 transition-transform duration-200" />
                  <span className="font-medium">إنشاء حساب بـ Google</span>
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

          {/* Signup Form */}
          <form onSubmit={handleFormSignup} className="space-y-6">
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
                placeholder="أدخل كلمة مرور قوية (8 أحرف على الأقل)"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وحروف وأرقام
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2"
              >
                تأكيد كلمة المرور 🔒
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                placeholder="أعد إدخال كلمة المرور"
                required
                disabled={loading}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  "إنشاء الحساب 🚀"
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              لديك حساب بالفعل؟
              <Link
                to="/user/login"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold hover:underline transition-colors duration-200 mr-2"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
