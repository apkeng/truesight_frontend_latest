import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import StudentHome from "./pages/StudentHome";
import Login from "./pages/Login";
import { useAuth } from "./contexts/AuthContext";
import Loading from "./components/Loading";
import { setNavigateFunction } from "./utils/apiClient";

// Route-level code splitting: each section loads on first navigation instead
// of shipping in the main bundle. StudentHome and Login stay eager since they
// are the entry pages.
const Register = lazy(() => import("./pages/Register"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Institute = lazy(() => import("./pages/Institute/Institute"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ResetPasswordWithOTP = lazy(() => import("./pages/ResetPasswordWithOTP"));
const Level1Dashboard = lazy(() => import("./pages/Level-1/Level-1"));
// Revamped student app (Figma "TrueSights" design system) - src/revamp.
const Level2Dashboard = lazy(() => import("./revamp/StudentApp"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/Events/EventDetails"));

const NavigationRegistrar = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);
  return null;
};

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <NavigationRegistrar />
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StudentHome />} />
          <Route path="/student-home" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/resetpassword-otp" element={<ResetPasswordWithOTP />} />

          {/* Protected Routes */}
          <Route
            path="/institutedashboard/*"
            element={
              <ProtectedRoute>
                <Institute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/l1dashboard/*"
            element={
              <ProtectedRoute>
                <Level1Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/l2dashboard/*"
            element={
              <ProtectedRoute>
                <Level2Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
