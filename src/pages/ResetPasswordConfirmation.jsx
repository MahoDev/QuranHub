// ResetPasswordConfirmation.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { Helmet } from "react-helmet-async";

function ResetPasswordConfirmation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) => {
    // Password must be at least 8 characters with mix of letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        setError("يرجى تعبئة جميع الحقول");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("كلمة المرور غير مطابقة");
        return;
      }

      if (!validatePassword(newPassword)) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أرقام وحروف");
        return;
      }

      await confirmPasswordReset(
        auth,
        searchParams.get("oobCode"),
        newPassword
      );

      setSuccess(true);

      // Don't auto-login for security reasons
      // Instead, redirect to login page with success message
      setTimeout(() => {
        navigate("/user/login", {
          state: {
            message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بحسابك"
          }
        });
      }, 2000);

    } catch (err) {
      switch (err.code) {
        case 'auth/expired-action-code':
          setError("انتهت صلاحية رابط إعادة تعيين كلمة المرور");
          break;
        case 'auth/invalid-action-code':
          setError("رابط إعادة تعيين كلمة المرور غير صالح");
          break;
        case 'auth/user-disabled':
          setError("الحساب معطل");
          break;
        case 'auth/weak-password':
          setError("كلمة المرور ضعيفة جداً");
          break;
        default:
          setError("فشل في تغيير كلمة المرور: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleVerification = async () => {
      try {
        if (!searchParams.get("oobCode")) {
          navigate("/user/reset", {
            state: {
              errorMessage: "رابط إعادة تعيين كلمة المرور غير صالح"
            }
          });
          return;
        }

        const emailAddress = await verifyPasswordResetCode(
          auth,
          searchParams.get("oobCode")
        );
        setEmail(emailAddress);
      } catch (err) {
        navigate("/user/reset", {
          state: {
            errorMessage: "رابط إعادة تعيين كلمة المرور منتهي الصلاحية أو غير صالح"
          }
        });
      }
    };
    handleVerification();
  }, [searchParams, navigate]);

  if (success) {
    return (
      <>
        <Helmet>
          <title>منصة القرآن | تم تغيير كلمة المرور</title>
        </Helmet>
        <div className="flex h-screen justify-center items-center text-emerald-700 dark:text-white">
          <div className="bg-white p-8 mx-4 rounded-lg border border-gray-300 dark:border-0 shadow-2xl w-full max-w-md dark:bg-emerald-900 dark:text-white text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold mb-4">تم بنجاح!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              تم تغيير كلمة المرور بنجاح
            </p>
            <p className="text-sm text-gray-500">
              سيتم توجيهك إلى صفحة تسجيل الدخول...
            </p>
          </div>
        </div>
      </>
    );
  }

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
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
              كلمة مرور جديدة
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              أدخل كلمة مرور جديدة لحسابك
            </p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Account Info */}
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">
              إعادة تعيين كلمة المرور لحساب: <strong>{email}</strong>
            </p>
          </div>

          {/* Password Reset Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2"
              >
                كلمة المرور الجديدة 🔒
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                تأكيد كلمة المرور الجديدة 🔒
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                placeholder="أعد إدخال كلمة المرور الجديدة"
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
                    جاري تغيير كلمة المرور...
                  </div>
                ) : (
                  "تغيير كلمة المرور 🚀"
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
              تأكد من أن كلمة المرور الجديدة قوية ومختلفة عن كلمات المرور السابقة
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPasswordConfirmation;
