import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEnvelope,
  faPhone,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faUser,
  faBuilding,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";
// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export default function RequestDemoModal({ isOpen, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation - firstName and lastName are optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!phone || phone.trim() === "") {
      setError("Please enter a phone number.");
      setLoading(false);
      return;
    }

    // Basic phone validation (allows various formats)
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

      if (!role || role.trim() === "") {
        setError("Please select a role (Educator or Student).");
        setLoading(false);
        return;
      }

    if (!university || university.trim().length < 2) {
      setError("Please enter your University/College name.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        firstName: firstName.trim() || "",
        lastName: lastName.trim() || "",
        email: email.trim(),
        phone: phone.trim(),
        role: role.trim(),
        university: university.trim(),
        timestamp: new Date().toISOString(),
      };

      let googleSheetsSuccess = false;
      let firestoreSuccess = false;

      // Optimized for Google Apps Script to bypass CORS restrictions
      const GOOGLE_SHEETS_WEBHOOK_URL = process.env.REACT_APP_GOOGLE_SHEETS_WEBHOOK_URL;
      
      if (GOOGLE_SHEETS_WEBHOOK_URL) {
        try {
          // Using mode: 'no-cors' and text/plain to bypass OPTIONS preflight and CORS blocks
          await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { 
              "Content-Type": "text/plain",
            },
            body: JSON.stringify(payload),
          });

          // In "no-cors" mode, the response is opaque. 
          // If fetch doesn't throw, we assume success as Google Script redirects make typical parsing fail.
          googleSheetsSuccess = true;
        } catch (webhookError) {
          console.error("Error sending to Google Sheets:", webhookError);
        }
      }
     try{
         const demoRequestData = {
            ...payload,
            createdAt: new Date(),
            status: "pending",
            source: "web-form",
          };
          
          await addDoc(collection(db, "demoRequests"), demoRequestData);
          firestoreSuccess = true;
        } catch (firestoreError) {
          console.error("Error saving to Firestore:", firestoreError);
        }
         

      // Show success if either method succeeded
      if (!googleSheetsSuccess && !firestoreSuccess) {
        setError("Unable to submit your request. Please check your internet connection.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setRole("");
      setUniversity("");

      // Close modal immediately
      setSuccess(false);
      onClose();
    } catch (error) {
      console.error("Error submitting demo request:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        setError("Network error: Please check your internet connection and try again.");
      } else {
        setError(`Unable to submit your request: ${errorMessage}. Please try again or contact support.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
          <h2 className="text-2xl font-bold text-white">Request a Demo</h2>
          <p className="text-blue-100 text-sm mt-1">
            Fill out the form below and we'll get back to you soon!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex flex-col max-h-[calc(90vh-200px)]">
          <div className="overflow-y-auto flex-1 space-y-4 pr-2">
          {success ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-semibold">Request Submitted!</p>
                <p className="text-green-700 text-sm mt-1">
                  We've received your request and will contact you shortly.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* First Name Field - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John (optional)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Last Name Field - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe (optional)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role (Educator/Student) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Role</option>
                    <option value="Educator">Educator</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>

              {/* University/College Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University / College *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Your University or College Name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

            </>
          )}
          </div>
          
          {/* Submit Button - Always visible at bottom */}
          {!success && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

