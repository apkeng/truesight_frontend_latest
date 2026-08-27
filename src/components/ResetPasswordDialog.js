import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faCopy, faRotate, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";
import Button from "./Button";
import { resetUserPassword } from "../utils/apiServices";

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

const ResetPasswordDialog = ({ open, setOpen, user }) => {
  const [password, setPassword] = useState(generatePassword());
  const [showPassword, setShowPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegenerate = () => setPassword(generatePassword());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy password.");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPassword(generatePassword());
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetUserPassword(user._id, password);
      toast.success(`Password reset for ${user.name || user.email}.`);
      handleClose();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper open={open} setOpen={handleClose}>
      <form onSubmit={handleSubmit}>
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-ink mb-2">
          Reset Password
        </Dialog.Title>
        <p className="text-sm text-gray-600 mb-4">
          Set a new password for <span className="font-semibold">{user?.name || user?.email}</span>.
          The new password takes effect immediately.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative flex items-center">
          <FontAwesomeIcon icon={faKey} className="absolute left-3 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? "Hide password" : "Show password"}
              className="text-gray-400 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy password"
              className="text-gray-400 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              title="Generate new password"
              className="text-gray-400 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">At least 6 characters. Share this with the user securely.</p>

        <div className="py-3 mt-6 sm:flex sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-navy px-8 text-sm font-semibold text-white hover:bg-navy-dark sm:w-auto disabled:opacity-50"
            label={isSubmitting ? "Setting..." : "Set Password"}
          />
          <Button
            type="button"
            className="bg-white px-5 text-sm font-semibold text-ink sm:w-auto"
            onClick={handleClose}
            label="Cancel"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ResetPasswordDialog;
