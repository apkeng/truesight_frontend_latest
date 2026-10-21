import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import Cookies from "js-cookie";
import mark from "../assets/landing/truesight-mark.png";
import "./Landing/landing.css";

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

// The backend passes Firebase Auth error codes through as-is; show people a sentence.
const LOGIN_ERRORS = {
  INVALID_LOGIN_CREDENTIALS: "That email and password don't match. Check them and try again.",
  INVALID_PASSWORD: "That email and password don't match. Check them and try again.",
  EMAIL_NOT_FOUND: "That email and password don't match. Check them and try again.",
  USER_DISABLED: "This account has been disabled. Contact support for help.",
};
const loginErrorMessage = (code) => {
  if (!code) return "Failed to login with email and password.";
  const key = Object.keys(LOGIN_ERRORS).find((k) => String(code).includes(k));
  if (key) return LOGIN_ERRORS[key];
  if (String(code).includes("TOO_MANY_ATTEMPTS")) return "Too many attempts. Wait a few minutes, or reset your password.";
  return code;
};

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
        setError(loginErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      if (!result.success) {
        setError(loginErrorMessage(result.error));
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
    <div className="tsl login">
      <div className="tsl-nav-wrap" style={{ marginBottom: 0 }}>
        <header className="tsl-nav">
          <Link to="/" className="brand">
            <img src={mark} alt="" />
            <span>TrueSight</span>
          </Link>
          <div className="nav-actions">
            <span className="hide-sm" style={{ fontSize: 14, color: "var(--muted)" }}>
              New here?
            </span>
            <Link to="/?register=1" className="btn btn-y" style={{ padding: "11px 20px" }}>
              Register
            </Link>
          </div>
        </header>
      </div>

      <main className="login-main">
        <section className="login-panel grid-bg" aria-hidden="true">
          <div className="hero-line h" style={{ top: "34%" }} />
          <div className="hero-line v" style={{ left: "62%" }} />
          <div className="ring-deco" style={{ right: -110, bottom: -110, width: 340, height: 340 }} />
          <div className="ring-deco" style={{ right: -40, bottom: -40, width: 200, height: 200, borderColor: "rgba(246,210,60,.55)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 22 }}>
            <span className="hero-kicker">Students &amp; educators</span>
            <h1 className="login-title">
              Welcome back. Pick up <span className="y">where you left off.</span>
            </h1>
            <ul className="login-points">
              <li>Your roadmap, paced to the exam</li>
              <li>Answers cited from your own textbooks</li>
              <li>Quizzes, duels and points for real rewards</li>
            </ul>
          </div>
          <img src={mark} alt="" className="login-mark" />
        </section>

        <section className="login-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="mono y" style={{ fontSize: 12 }}>
              LOG IN
            </span>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.1 }}>Sign in to TrueSight</h2>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 15 }}>Use the email and password from your welcome email.</p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="you@college.edu"
                className={`input${errors.email ? " bad" : ""}`}
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email address.",
                  },
                })}
              />
              {errors.email && <span className="err">{errors.email.message}</span>}
            </div>

            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label htmlFor="login-password">Password</label>
                <button type="button" className="link-btn" onClick={() => navigate("/forgotpassword")}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={inputType}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={`input${errors.password ? " bad" : ""}`}
                  style={{ paddingRight: 64 }}
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long.",
                    },
                  })}
                />
                <button
                  type="button"
                  className="link-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={inputType === "password" ? "Show password" : "Hide password"}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--soft)" }}
                >
                  {inputType === "password" ? "Show" : "Hide"}
                </button>
              </div>
              {errors.password && <span className="err">{errors.password.message}</span>}
            </div>

            {error && (
              <div className="alert err" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-y btn-lg" disabled={isLoading} style={{ marginTop: 4 }}>
              {isLoading ? (
                <>
                  <span className="spinner" /> Signing in…
                </>
              ) : (
                <>Sign in →</>
              )}
            </button>

            {showForceLogin && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={isLoading}
                onClick={() => handleLogin({ ...loginData, force: true })}
                style={{ borderColor: "#FF8A8A", color: "#FFB4B4" }}
              >
                Log out other devices &amp; sign in
              </button>
            )}
          </form>

          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/?register=1" className="y" style={{ fontWeight: 700 }}>
              Register
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
