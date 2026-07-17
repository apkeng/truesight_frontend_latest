import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo_blue.png";

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [actionCode, setActionCode] = useState("");

  const password = watch("password");

  useEffect(() => {
    // Extract action code from URL
    const code = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    if (!code || mode !== "resetPassword") {
      setError("Invalid or missing reset link. Please request a new password reset.");
      setVerifying(false);
      return;
    }

    setActionCode(code);
    verifyActionCode(code);
  }, [searchParams]);

  const verifyActionCode = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oobCode: code }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        let errorMessage = result.error || "Invalid or expired reset link. Please request a new password reset.";
        setError(errorMessage);
        setVerifying(false);
        return;
      }

      setEmail(result.email);
      setVerifying(false);
    } catch (error) {
      console.error("Error verifying reset code:", error);
      setError("Invalid or expired reset link. Please request a new password reset.");
      setVerifying(false);
    }
  };

  const handleResetPassword = async (data) => {
    if (!actionCode) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/confirm-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode: actionCode,
          newPassword: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to reset password. Please try again.");
        return;
      }

      setMessage("Password reset successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  if (verifying) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="w-8 h-8 text-blue-600 animate-spin mb-4"
          />
          <p className="text-gray-700">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
        <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
          <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
            <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
              <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600">
                Password Reset
              </span>
              <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
                <span>Reset</span>
                <span>Password</span>
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
            <div className="form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14 rounded-lg shadow">
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={() => navigate("/forgotpassword")}
                className="w-full py-3 bg-blue-500 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200"
              >
                Request New Reset Link
              </button>
              <p
                className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer text-center"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        {/* Left side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
            <div className="backdrop-blur-xl bg-white/30 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 p-6 md:p-10 lg:p-12 text-center w-full max-w-lg">
              <div className="mb-6 md:mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-50"></div>
                  <img
                    src={logo}
                    alt="Truesight University Logo"
                    className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full object-cover shadow-2xl border-4 border-white/50"
                  />
                </div>
              </div>
              <span className="inline-block py-2 px-4 md:px-6 rounded-full text-xs md:text-sm lg:text-base bg-white/40 backdrop-blur-sm border border-white/30 text-gray-700 font-medium mb-4 md:mb-6">
                Set a new password for your account
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Reset Password
              </h1>
              {email && (
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  Resetting password for: <span className="font-semibold">{email}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit(handleResetPassword)}
            className="form-container w-full md:w-[400px] flex flex-col gap-y-4 bg-white p-10 rounded-lg shadow"
          >
            <div>
              <p className="text-blue-600 text-3xl font-bold text-center mb-2">
                New Password
              </p>
              <p className="text-center text-base text-gray-700 mb-6">
                Please enter your new password below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("password", {
                    required: "Password is required!",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password!",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-blue-500 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-4 h-4 animate-spin"
                  />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="w-4 h-4"
                  />
                </>
              )}
            </button>

            <p
              className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer text-center"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

