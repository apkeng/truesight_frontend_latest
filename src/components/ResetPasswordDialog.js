import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faCopy, faRotate, faEye, faEyeSlash, faLink, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";
import Button from "./Button";
import { generatePasswordResetLink, resetUserPassword } from "../utils/apiServices";

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

/** A mailto: URL that opens the admin's email app with the link ready to send. */
const resetEmailHref = (user, link, minutes) => {
  const name = user?.name ? ` ${user.name}` : "";
  const subject = "Reset your Truesight password";
  const body =
    `Hi${name},\n\n` +
    `Use the link below to set a new password for your Truesight account (${user?.email}):\n\n` +
    `${link}\n\n` +
    `The link works once and expires in ${minutes} minutes. After you set your password you'll be taken to the login page.\n\n` +
    `If you didn't expect this email, you can ignore it.`;
  return `mailto:${encodeURIComponent(user?.email || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const tabClass = (active) =>
  `flex-1 py-2 text-sm font-semibold rounded ${active ? "bg-white text-ink shadow" : "text-gray-500 hover:text-ink"}`;

const ResetPasswordDialog = ({ open, setOpen, user }) => {
  const [mode, setMode] = useState("link"); // "link" | "password"
  const [password, setPassword] = useState(generatePassword());
  const [showPassword, setShowPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetLink, setResetLink] = useState(null); // { resetLink, email, expiresInMinutes }

  const handleRegenerate = () => setPassword(generatePassword());

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied to clipboard!`);
    } catch (error) {
      toast.error(`Failed to copy ${what.toLowerCase()}.`);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMode("link");
    setPassword(generatePassword());
    setShowPassword(true);
    setResetLink(null);
  };

  const handleGenerateLink = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const result = await generatePasswordResetLink(user._id);
      setResetLink(result);
      toast.success("Reset link ready - share it with the user.");
    } catch (error) {
      console.error("Error generating reset link:", error);
      toast.error(error.message || "Failed to generate a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "link") {
      handleGenerateLink();
      return;
    }
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

  const who = <span className="font-semibold">{user?.name || user?.email}</span>;
  const submitLabel =
    mode === "link"
      ? isSubmitting ? "Generating..." : resetLink ? "Generate New Link" : "Generate Link"
      : isSubmitting ? "Setting..." : "Set Password";

  return (
    <ModalWrapper open={open} setOpen={handleClose}>
      <form onSubmit={handleSubmit}>
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-ink mb-3">
          Reset Password
        </Dialog.Title>

        <div className="flex gap-1 p-1 mb-4 bg-gray-100 rounded">
          <button type="button" className={tabClass(mode === "link")} onClick={() => setMode("link")}>
            Send reset link
          </button>
          <button type="button" className={tabClass(mode === "password")} onClick={() => setMode("password")}>
            Set password
          </button>
        </div>

        {mode === "link" ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Generate a secure, one-time link for {who} to choose their own password. Share it with them by
              email; after they set a new password they're taken to the login page.
            </p>
            {resetLink && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reset link</label>
                <div className="relative flex items-center">
                  <FontAwesomeIcon icon={faLink} className="absolute left-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    readOnly
                    value={resetLink.resetLink}
                    onFocus={(e) => e.target.select()}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => copy(resetLink.resetLink, "Link")}
                    title="Copy link"
                    className="absolute right-3 text-gray-400 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Works once and expires in {resetLink.expiresInMinutes} minutes. Anyone with this link can set
                  the password, so send it only to {resetLink.email}.
                </p>
                <a
                  href={resetEmailHref(user, resetLink.resetLink, resetLink.expiresInMinutes)}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-semibold text-navy border border-navy rounded hover:bg-blue-50"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                  Email link to {resetLink.email}
                </a>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Set a new password for {who}. The new password takes effect immediately.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
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
                  onClick={() => copy(password, "Password")}
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
          </>
        )}

        <div className="py-3 mt-6 sm:flex sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-navy px-8 text-sm font-semibold text-white hover:bg-navy-dark sm:w-auto disabled:opacity-50"
            label={submitLabel}
          />
          <Button
            type="button"
            className="bg-white px-5 text-sm font-semibold text-ink sm:w-auto"
            onClick={handleClose}
            label={resetLink && mode === "link" ? "Done" : "Cancel"}
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ResetPasswordDialog;
