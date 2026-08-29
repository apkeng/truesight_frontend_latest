import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faUser,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthContext";
import Cookies from "js-cookie";
import logo from "../assets/logo_colour.png";

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [inputType, setInputType] = useState("password");
  const [error, setError] = useState("");
  const [showForceLogin, setShowForceLogin] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  const handleLogin = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      // Authenticate with backend API
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          force: data.force || false,
        }),
      });

      const result = await response.json();

      if (response.status === 403 && result.code === 'SESSION_ALREADY_ACTIVE') {
        setShowForceLogin(true);
        setLoginData(data); // Store credentials to allow retrying with force=true
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(result.error || "Failed to login with email and password.");
        setIsLoading(false);
        return;
      }

      if (!result.success) {
        setError(result.error || "Failed to login with email and password.");
        setIsLoading(false);
        return;
      }

      // Reset states on success
      setShowForceLogin(false);
      setLoginData(null);

      // Store authentication token and user data
      Cookies.set("authToken", result.token, { expires: 1 / 12 }); // 2 hours expiration
      Cookies.set("uid", result.user.uid, { expires: 1 / 12 });
      Cookies.set("sessionId", result.sessionId, { expires: 1 / 12 });
      
      login(); // Update login state to true
      
      // Navigate based on user role
      if (result.user.role) {
        navigateBasedOnRole(result.user.role);
      } else {
        setError("No user role found.");
        setIsLoading(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setError("Failed to login. Please check your connection and try again.");
      setIsLoading(false);
    }
  };


  const navigateBasedOnRole = (role) => {
    switch (role) {
      case "Institute Admin":
        navigate("/institutedashboard/institute-details");
        break;
      case "Level-1":
        navigate("/l1dashboard/dashboard");
        break;
      case "Level-2":
        navigate("/l2dashboard/dashboard");
        break;
      case "Admin":
        navigate("/admindashboard/dashboard");
        break;
      default:
        navigate("/dashboard"); // default dashboard if role not specified
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${logo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="flex flex-col items-center justify-center order-2 lg:order-1">
            <div className="backdrop-blur-xl bg-white/30 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 p-6 md:p-10 lg:p-12 text-center w-full max-w-lg">
              <div className="mb-6 md:mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-50"></div>
                  <img
                    src={logo}
                    alt="Truesight Logo"
                    className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full object-cover shadow-2xl border-4 border-white/50"
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Truesight
              </h1>
              <div className="mt-6 md:mt-8 flex items-center justify-center gap-3 md:gap-4 text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">Educators</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-md">
              <div className="backdrop-blur-xl bg-white/30 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 lg:p-10">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Sign in to your account to continue
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(handleLogin)}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="w-5 h-5 text-gray-400"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                          required: "Email is required!",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="w-5 h-5 text-gray-400"
                        />
                      </div>
                      <input
                        type={inputType}
                        placeholder="Enter your password"
                        {...register("password", {
                          required: "Password is required!",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters long",
                          },
                        })}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        <FontAwesomeIcon
                          icon={inputType === "password" ? faEye : faEyeSlash}
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

                  {error && (
                    <div className="bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-xl p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate("/forgotpassword")}
                      className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group w-full bg-blue-600/90 hover:bg-blue-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-white/20 flex items-center justify-center gap-2 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                    {!isLoading && (
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      />
                    )}
                  </button>

                  {showForceLogin && (
                    <button
                      type="button"
                      onClick={() => handleLogin({ ...loginData, force: true })}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold py-3 px-6 rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Logout from other devices & Login</span>
                    </button>
                  )}

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
