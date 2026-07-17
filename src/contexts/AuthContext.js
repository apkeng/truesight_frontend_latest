import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { auth } from "../firebase/firebase-config";

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const AuthContext = createContext({ isAuthenticated: false });

// Inactivity timeout: 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize state from cookies to keep user logged in
    return Cookies.get("isAuthenticated") === "true";
  });

  const lastActivityRef = useRef(Date.now());
  const inactivityCheckRef = useRef(null);
  const logoutRef = useRef(null);
  const sessionUpdateRef = useRef(null);
  const lastSessionUpdateRef = useRef(0);

  // Update last activity timestamp (throttled to avoid excessive Firestore writes)
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Update session timestamp (called separately, throttled)
  const updateSessionTimestamp = useCallback(async () => {
    const uid = Cookies.get("uid");
    const token = Cookies.get("authToken");
    const now = Date.now();
    const SESSION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    // Throttle: only update if last update was more than 5 minutes ago
    if (now - lastSessionUpdateRef.current < SESSION_UPDATE_INTERVAL) {
      return;
    }

    if (uid && token) {
      try {
        // Update session via backend API
        await fetch(`${API_BASE_URL}/api/auth/session/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        lastSessionUpdateRef.current = now;
      } catch (error) {
        console.error("Error updating session timestamp:", error);
      }
    }
  }, []);

  const logout = async () => {
    try {
      // Clear inactivity check
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current);
        inactivityCheckRef.current = null;
      }
      
      // Clear session update interval
      if (sessionUpdateRef.current) {
        clearInterval(sessionUpdateRef.current);
        sessionUpdateRef.current = null;
      }

      const token = Cookies.get("authToken");
      
      // Delete session from backend
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
      
      // Clear Firebase Auth state
      try {
        await auth.signOut();
      } catch (error) {
        console.error("Error signing out from Firebase:", error);
      }
      
      // Clear cookies
      Cookies.remove("isAuthenticated");
      Cookies.remove("uid");
      Cookies.remove("sessionId");
      Cookies.remove("authToken");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
      // Still clear local state even if backend delete fails
      Cookies.remove("isAuthenticated");
      Cookies.remove("uid");
      Cookies.remove("sessionId");
      Cookies.remove("authToken");
      setIsAuthenticated(false);
    }
  };

  // Store logout in ref so it can be accessed in checkInactivity
  logoutRef.current = logout;

  // Check for inactivity and logout if needed
  const checkInactivity = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      if (logoutRef.current) {
        await logoutRef.current();
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only set up inactivity tracking if user is authenticated and has a valid session
    const uid = Cookies.get("uid");
    const token = Cookies.get("authToken");
    if (!uid || !token || !isAuthenticated) {
      // Clean up if user is not authenticated
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current);
        inactivityCheckRef.current = null;
      }
      if (sessionUpdateRef.current) {
        clearInterval(sessionUpdateRef.current);
        sessionUpdateRef.current = null;
      }
      return;
    }

    // Set up activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, true);
    });

    // Initialize last activity time to current time when setting up
    lastActivityRef.current = Date.now();

    // Set up interval to check inactivity
    inactivityCheckRef.current = setInterval(checkInactivity, CHECK_INTERVAL);

    // Set up interval to update session timestamp (every 5 minutes)
    sessionUpdateRef.current = setInterval(() => {
      updateSessionTimestamp();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Also update session timestamp on initial setup
    updateSessionTimestamp();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity, true);
      });
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current);
        inactivityCheckRef.current = null;
      }
      if (sessionUpdateRef.current) {
        clearInterval(sessionUpdateRef.current);
        sessionUpdateRef.current = null;
      }
    };
  }, [isAuthenticated, checkInactivity, updateActivity, updateSessionTimestamp]);

  const login = () => {
    Cookies.set("isAuthenticated", "true", { expires: 1 / 12 }); // Set cookie to expire in 2 hours
    setIsAuthenticated(true);
    // Reset activity timer on login - this ensures user starts fresh
    lastActivityRef.current = Date.now();
  };

  // Check authentication status on mount
  useEffect(() => {
    const token = Cookies.get("authToken");
    const uid = Cookies.get("uid");
    
    if (token && uid) {
      // Verify token with backend
      fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            Cookies.set("isAuthenticated", "true", { expires: 1 / 12 });
            setIsAuthenticated(true);
            lastActivityRef.current = Date.now();
          } else {
            // Token invalid, clear auth
            Cookies.remove("isAuthenticated");
            Cookies.remove("authToken");
            Cookies.remove("uid");
            Cookies.remove("sessionId");
            setIsAuthenticated(false);
          }
        })
        .catch(error => {
          console.error("Error verifying token:", error);
          Cookies.remove("isAuthenticated");
          Cookies.remove("authToken");
          Cookies.remove("uid");
          Cookies.remove("sessionId");
          setIsAuthenticated(false);
        });
    } else {
      Cookies.remove("isAuthenticated");
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
