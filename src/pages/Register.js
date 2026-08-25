import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo_blue.png";

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const password = watch("password");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleRegister = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          instituteName: data.instituteName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const serverMessage =
          result.error ||
          result.errors?.[0]?.msg ||
          "Registration failed. Please check the details and try again.";
        toast.error(serverMessage);
        setIsLoading(false);
        return;
      }

      // Store authentication token and user data
      Cookies.set("authToken", result.token, { expires: 1 / 12 }); // 2 hours expiration
      Cookies.set("uid", result.user.uid, { expires: 1 / 12 });
      
      login(); // Update login state to true
      
      toast.success("Registration successful! Redirecting...");
      
      // Navigate based on role (should be Institute Admin for new registrations)
      if (result.user.role) {
        navigate("/institutedashboard/institute-details");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${logo})`,
        backgroundColor: "rgba(243, 244, 246, 0.9)",
      }}
    >
      <ToastContainer />
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
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
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Truesight
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-3 md:mb-4">
                University
              </h2>
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
        </div>
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit(handleRegister)}
            className="form-container w-full md:w-[400px] flex flex-col gap-y-4 bg-white p-10 rounded-lg shadow"
          >
            <Textbox
              placeholder="Full Name"
              type="text"
              name="name"
              label="Name"
              className="w-full rounded-full"
              register={register("name", { required: "Name is required!" })}
              error={errors.name?.message}
            />
            <Textbox
              placeholder="Email Address"
              type="email"
              name="email"
              label="Email Address"
              className="w-full rounded-full"
              register={register("email", {
                required: "Email is required!",
                pattern: {
                  // Any TLD of two characters or more - the backend's isEmail()
                  // accepts .academy, .education and friends, so the form must too.
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
            />
            <Textbox
              placeholder="Phone Number"
              type="tel"
              name="phone"
              label="Phone Number"
              className="w-full rounded-full"
              register={register("phone", {
                required: "Phone number is required!",
                pattern: {
                  value: /^[\d\s\-+()]+$/,
                  message: "Invalid phone number",
                },
                validate: (value) =>
                  value.replace(/\D/g, "").length >= 10 ||
                  "Phone number must have at least 10 digits",
              })}
              error={errors.phone?.message}
            />
            <Textbox
              placeholder="Institute Name"
              type="text"
              name="instituteName"
              label="Institute Name"
              className="w-full rounded-full"
              register={register("instituteName", {
                required: "Institute name is required!",
              })}
              error={errors.instituteName?.message}
            />
            <Textbox
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              label="Password"
              className="w-full rounded-full"
              register={register("password", {
                required: "Password is required!",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              error={errors.password?.message}
              icon={showPassword ? "Show" : "Hide"}
              onIconClick={togglePasswordVisibility}
            />
            <Textbox
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              label="Confirm Password"
              className="w-full rounded-full"
              register={register("confirmPassword", {
                required: "Confirm Password is required!",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
              icon={showConfirmPassword ? "Show" : "Hide"}
              onIconClick={toggleConfirmPasswordVisibility}
            />
            <Button
              type="submit"
              label={isLoading ? "Registering..." : "Register"}
              disabled={isLoading}
              className={`w-full bg-blue-700 text-white rounded-full py-2 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-blue-800"
              }`}
            />
            <p className="text-center mt-4 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
