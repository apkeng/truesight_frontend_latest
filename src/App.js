import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import StudentHome from "./pages/StudentHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import { useAuth } from "./contexts/AuthContext";
import Institute from "./pages/Institute/Institute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordWithOTP from "./pages/ResetPasswordWithOTP";
import Level1Dashboard from "./pages/Level-1/Level-1";
import Level2Dashboard from "./pages/Level-2/Level-2";
import Events from "./pages/Events";
import EventDetails from "./pages/Events/EventDetails";
import { setNavigateFunction } from "./utils/apiClient";

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
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StudentHome />} />
        <Route path="/student-home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
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
    </Router>
  );
}

export default App;
