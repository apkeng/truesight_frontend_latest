import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import UserAvatar from './UserAvatar';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { fileToAvatarDataUrl, timeAgo } from '../../revamp/lib/format';

/** /api/v2/me in the shape the profile form edits. */
const toForm = (me) => ({
  fullName: me.name || '',
  email: me.email || '',
  phone: me.phone || '',
  academicLevel: me.educationLevel || '',
  institutionName: me.instituteName || '',
  organizationId: me.studentId || '',
  avatarUrl: me.photoURL || null,
  accountRole: me.verified ? (me.role === 'Level-1' ? 'Verified Educator' : 'Verified Student') : 'Student',
  securityStatus: me.passwordChangedAt ? `Password changed ${timeAgo(me.passwordChangedAt)}` : 'Password protected',
  privacyStatus: 'Privacy Secured',
  protocolIdentityUrl: me.uid,
  lastUpdated: me.createdAt ? `Member since ${new Date(me.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ''
});

export default function ProfilePage() {
  const { data: me, error, isLoading, refetch } = useQuery(keys.me(), api.me, { staleMs: 120_000 });
  // Profile State (the editable copy of /api/v2/me)
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (me) setProfile(toForm(me));
  }, [me]);

  // Updating Lifecycle State
  const [isUpdating, setIsUpdating] = useState(false);
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
  const showToast = (msg) => toast.success(msg);

  // Avatar Photo Upload Handler: resized client-side, stored as a small data URL
  const setPhoto = async (photo) => {
    try {
      await api.setPhoto(photo);
      setQueryData(keys.me(), (d) => d && { ...d, photoURL: photo });
      setQueryData(keys.bootstrap(), (d) => d && { ...d, profile: { ...d.profile, photoURL: photo } });
      showToast(photo ? 'Profile photo updated.' : 'Profile photo removed.');
    } catch (err) {
      toast.error(err.message);
    }
  };
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await setPhoto(await fileToAvatarDataUrl(file));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Copy Protocol Identity URL
  const handleCopyProtocolUrl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(profile.protocolIdentityUrl);
    }
    setCopiedUrl(true);
    showToast('TrueSights ID copied.');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Update Profile Form Submit
  const handleUpdateProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!profile.fullName.trim()) {
      showToast('Legal full name cannot be blank.');
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await api.updateMe({
        name: profile.fullName,
        phone: profile.phone,
        instituteName: profile.institutionName,
        educationLevel: profile.academicLevel,
        studentId: profile.organizationId
      });
      setQueryData(keys.me(), updated);
      setQueryData(keys.bootstrap(), (d) => d && { ...d, profile: { ...d.profile, name: updated.name, instituteName: updated.instituteName, educationLevel: updated.educationLevel } });
      invalidate(keys.dashboard());
      showToast('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
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
  const handlePasswordSubmit = async (e) => {
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
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setQueryData(keys.me(), (d) => d && { ...d, passwordChangedAt: new Date().toISOString() });
      showToast('Password changed successfully.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  if (error && !me) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Couldn't load your profile</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px' }}>{error.message}</p>
        <button type="button" onClick={() => refetch()} style={{ background: '#0B3A6F', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          Try again
        </button>
      </div>
    );
  }
  if (isLoading || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div className="skeleton-shimmer" style={{ height: '64px', borderRadius: '14px' }} />
        <div className="skeleton-shimmer" style={{ height: '150px', borderRadius: '14px' }} />
        <div className="skeleton-shimmer" style={{ height: '320px', borderRadius: '14px' }} />
      </div>
    );
  }

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
              <UserAvatar name={profile.fullName} photoURL={profile.avatarUrl} size={68} style={{ border: '2px solid #E2E8F0' }} />
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
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>TrueSights ID:</span>
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
                Electronic Email <span style={{ color: '#94A3B8', fontWeight: 500 }}>(sign-in email, can't be changed here)</span>
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                title="Your sign-in email - contact support to change it."
                style={{
                  background: '#F8FAFC',
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
