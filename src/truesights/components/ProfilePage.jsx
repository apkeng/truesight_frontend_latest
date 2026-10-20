import React, { useState, useRef } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

export default function ProfilePage({ onBackToDashboard }) {
  // Profile State
  const [profile, setProfile] = useState({
    fullName: 'Yadu Krishna Pullagura',
    email: 'yadu.krishna@truesights.edu',
    phone: '+91 98765 43210',
    academicLevel: 'Postgraduate (M.Tech Autonomous Systems)',
    institutionName: 'Indian Institute of Technology, Madras (IIT-M)',
    organizationId: 'TS-2026-IITM-8942',
    avatarUrl: '/assets/user-profile.jpg',
    accountRole: 'Verified Student',
    securityStatus: 'Hardware Token 2FA Active',
    privacyStatus: 'Privacy Secured',
    protocolIdentityUrl: 'https://truesights.id/student/yadu.krishna',
    lastUpdated: 'Today at 02:45 PM'
  });

  // Updating Lifecycle State
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // File Input Ref for Photo Upload
  const fileInputRef = useRef(null);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Avatar Photo Upload Handler
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({
          ...prev,
          avatarUrl: event.target.result
        }));
        showToast('Profile photo updated.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy Protocol Identity URL
  const handleCopyProtocolUrl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(profile.protocolIdentityUrl);
    }
    setCopiedUrl(true);
    showToast('Protocol URL copied.');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Update Profile Form Submit
  const handleUpdateProfile = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!profile.fullName.trim()) {
      showToast('Legal full name cannot be blank.');
      return;
    }
    if (!profile.email.trim() || !profile.email.includes('@')) {
      showToast('Please enter a valid electronic email.');
      return;
    }
    if (!profile.institutionName.trim()) {
      showToast('Institution name is required.');
      return;
    }

    setIsUpdating(true);

    setTimeout(() => {
      setIsUpdating(false);
      setProfile((prev) => ({
        ...prev,
        lastUpdated: 'Just now',
        protocolIdentityUrl: `https://truesights.id/student/${prev.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}`
      }));
      showToast('Profile updated successfully.');
    }, 500);
  };

  // Password Strength Calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: '#94A3B8' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: '#EF4444' };
    if (score === 2) return { score: 50, text: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score: 75, text: 'Good', color: '#3B82F6' };
    return { score: 100, text: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  // Handle Password Change Submit
  const handlePasswordSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully.');
    }, 600);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        paddingRight: '6px',
        gap: '16px',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: '#0B3A6F',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(11, 58, 111, 0.25)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================================
          1. HEADER BAR: Clear Hierarchy (Title + Action)
          ====================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              User Profile
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>
              Manage your identity, academic affiliation, and security credentials.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isUpdating ? '#475569' : '#0B3A6F',
            border: 'none',
            borderRadius: '9px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#FFFFFF',
            cursor: isUpdating ? 'wait' : 'pointer',
            boxShadow: '0 2px 6px rgba(11, 58, 111, 0.2)',
            transition: 'background-color 150ms ease'
          }}
        >
          {isUpdating ? (
            <span>Updating...</span>
          ) : (
            <>
              <Icon name="check" size={14} color="#FFFFFF" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </div>

      {/* ======================================================================
          2. IDENTITY HERO CARD: Direct & Focused
          ====================================================================== */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {/* User Bio + Photo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #E2E8F0'
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#0B3A6F',
                  border: '2px solid #FFFFFF',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Icon name="camera" size={11} color="#FFFFFF" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  {profile.fullName}
                </span>
                <span
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px'
                  }}
                >
                  {profile.accountRole}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                {profile.email} · {profile.institutionName}
              </div>
            </div>
          </div>

          {/* Photo Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#334155',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Upload Photo
            </button>
            <button
              type="button"
              onClick={() => {
                setProfile((prev) => ({ ...prev, avatarUrl: '/assets/user-profile.jpg' }));
                showToast('Reset avatar to default.');
              }}
              style={{
                background: 'transparent',
                border: '1px solid transparent',
                color: '#94A3B8',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Security Badges & Protocol URL Row */}
        <div
          style={{
            borderTop: '1px solid #F1F5F9',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          {/* Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '999px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {profile.privacyStatus}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '999px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {profile.securityStatus}
            </span>
          </div>

          {/* Protocol Identity URL Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '3px 8px'
            }}
          >
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Protocol ID:</span>
            <code style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
              {profile.protocolIdentityUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyProtocolUrl}
              style={{
                background: copiedUrl ? '#ECFDF5' : '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: copiedUrl ? '#059669' : '#334155',
                cursor: 'pointer'
              }}
            >
              {copiedUrl ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================
          3. INFORMATION SECTIONS: Clean 2-Card Layout
          ====================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card A: Identity & Contact */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Identity & Contact Information
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
              Your personal credentials for official records and certificates.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Legal Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Legal Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Electronic Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Electronic Email <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Contact Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Contact Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card B: Academic Affiliation */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Academic Affiliation
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
              Institutional standing and campus laboratory identifier.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Educational Institute */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Educational Institute Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={profile.institutionName}
                onChange={(e) => setProfile({ ...profile, institutionName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Academic Level */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Academic Level <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={profile.academicLevel}
                onChange={(e) => setProfile({ ...profile, academicLevel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Undergraduate (B.Tech / B.S. Engineering)">Undergraduate (B.Tech / B.S. Engineering)</option>
                <option value="Postgraduate (M.Tech Autonomous Systems)">Postgraduate (M.Tech Autonomous Systems)</option>
                <option value="Doctoral Scholar / PhD Candidate">Doctoral Scholar / PhD Candidate</option>
                <option value="Faculty Researcher / Educator">Faculty Researcher / Educator</option>
              </select>
            </div>

            {/* Organization / Student ID */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Organization / Student ID <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={profile.organizationId}
                onChange={(e) => setProfile({ ...profile, organizationId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          4. SECURITY & PASSWORD: Clean, Single-Row Card
          ====================================================================== */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1D4ED8'
            }}
          >
            <Icon name="lock" size={16} color="#1D4ED8" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Account Password
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              •••••••••••• · Last changed 42 days ago
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#1E293B',
            cursor: 'pointer'
          }}
        >
          Change Password
        </button>
      </div>

      {/* ======================================================================
          5. CHANGE PASSWORD MODAL: Clean & Direct Full-Viewport Overlay
          ====================================================================== */}
      {showPasswordModal && (
        <ModalPortal isOpen={true} onClose={() => setShowPasswordModal(false)}>
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            margin: '20px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              Change Password
            </h3>
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ✕
            </button>
          </div>

          {/* Error Banner */}
          {passwordError && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {passwordError}
            </div>
          )}

          {/* Modal Form */}
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Current Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#64748B'
                  }}
                >
                  {showCurrentPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#64748B'
                  }}
                >
                  {showNewPass ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Strength Meter */}
              {passwordForm.newPassword && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${strength.score}%`,
                        backgroundColor: strength.color,
                        transition: 'all 200ms ease'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: strength.color, marginTop: '2px', fontWeight: 600 }}>
                    Strength: {strength.text}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#64748B'
                  }}
                >
                  {showConfirmPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#64748B',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPass}
                style={{
                  background: '#0B3A6F',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: isChangingPass ? 'wait' : 'pointer'
                }}
              >
                {isChangingPass ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
