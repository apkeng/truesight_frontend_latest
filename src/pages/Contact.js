import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faArrowLeft,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo_blue.png";

export default function Contact() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        {/* Back Button */}
        <button
          onClick={handleGoHome}
          className="mb-6 md:mb-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors backdrop-blur-sm bg-white/30 px-4 py-2 rounded-lg border border-white/30 hover:border-blue-400/50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-50"></div>
              <img
                src={logo}
                alt="Truesight University Logo"
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full object-cover shadow-2xl border-4 border-white/50"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch with us and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {/* Contact Cards */}
          <div className="backdrop-blur-xl bg-white/30 rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 text-center hover:bg-white/40 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/30">
              <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email</h3>
            <p className="text-sm text-gray-600 mb-3">Send us an email</p>
            <a
              href="mailto:truesight.support@apokryfon.com"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              truesight.support@apokryfon.com
            </a>
          </div>

          <div className="backdrop-blur-xl bg-white/30 rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 text-center hover:bg-white/40 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/30">
              <FontAwesomeIcon icon={faPhone} className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Phone</h3>
            <p className="text-sm text-gray-600 mb-3">Call us directly</p>
            <a
              href="tel:+919746398389"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              +91 97463 98389
            </a>
          </div>

          <div className="backdrop-blur-xl bg-white/30 rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 text-center hover:bg-white/40 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/30">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Address</h3>
            <p className="text-sm text-gray-600 mb-3">Visit our office</p>
            <div className="text-gray-700 text-sm space-y-1">
              <p className="font-semibold text-gray-800">APOKRYFON PRIVATE LIMITED</p>
              <p className="text-xs text-gray-500 font-mono">(CIN: U62099KA2026PTC216666)</p>
              <p className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-wider">Registered Office</p>
              <p className="text-gray-600 leading-relaxed">
                R519, Purva Park, Jeevanahalli Main Road,<br />
                Fraser Town, Karnataka, Bangalore,<br />
                Bangalore North, 560005
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="backdrop-blur-xl bg-white/30 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
              Send us a Message
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="group relative backdrop-blur-sm bg-blue-600/90 hover:bg-blue-700/90 text-white font-semibold py-3 md:py-4 px-8 md:px-12 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-white/20 flex items-center gap-2"
                >
                  <span>Send Message</span>
                  <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 md:mt-24">
          <div className="backdrop-blur-xl bg-white/30 rounded-2xl md:rounded-3xl shadow-xl border border-white/20 p-8 md:p-12">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Truesight University. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
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

