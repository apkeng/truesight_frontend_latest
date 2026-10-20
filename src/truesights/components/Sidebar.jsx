import React, { useState } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import UserAvatar from './UserAvatar';
import { pathFor, useTS } from '../session';

export default function Sidebar({
  isCollapsed,
  onToggle,
  activeNav = 'dashboard',
  onNavigate,
  onOpenNotifications,
  unreadNotificationsCount = 0
}) {
  const { profile, logout } = useTS();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const currentNav = activeNav;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects-hub', label: 'Project Roadmaps', icon: 'allProjects' },
    { id: 'rewards', label: 'Rewards', icon: 'rewards' },
    { id: 'results', label: 'Results', icon: 'results' },
    { id: 'challenges', label: 'Challenges', icon: 'challenges' },
    { id: 'ask-textbook', label: 'Ask a Textbook', icon: 'askTextbook' },
    { id: 'events', label: 'Events', icon: 'events' },
    { id: 'notifications', label: 'Updates', icon: 'notifications', isAction: true },
    { id: 'trash', label: 'Trash', icon: 'trash' }
  ];

  return (
    <aside
      aria-label="Main Navigation"
      style={{
        width: isCollapsed ? '51px' : '174px',
        height: isCollapsed ? '812px' : '829px',
        maxHeight: isCollapsed ? '812px' : '829px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 280ms cubic-bezier(.2, .8, .2, 1)',
        flexShrink: 0,
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Header & Navigation */}
      <div>
        {/* Brand Header */}
        <div
          style={{
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            marginBottom: '16px',
            padding: isCollapsed ? '0' : '0 4px',
            position: 'relative'
          }}
        >
          {isCollapsed ? (
            /* Collapsed State: Logo morphs to Expand Icon on hover */
            <button
              onClick={onToggle}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: isLogoHovered ? '1.5px solid #283D82' : '1px solid transparent',
                background: isLogoHovered ? '#EBF2FE' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                transition: 'all 200ms ease'
              }}
            >
              {/* Logo Mark (visible when NOT hovered) */}
              <img
                src="/assets/truesight-logo-colour-1024 2.png"
                alt="Truesight Logo"
                style={{
                  width: '26px',
                  height: '26px',
                  objectFit: 'contain',
                  opacity: isLogoHovered ? 0 : 1,
                  transform: isLogoHovered ? 'scale(0.8)' : 'scale(1)',
                  transition: 'opacity 180ms ease, transform 180ms ease',
                  position: 'absolute'
                }}
              />

              {/* Expand Chevron Icon (visible ON hover) */}
              <div
                style={{
                  opacity: isLogoHovered ? 1 : 0,
                  transform: isLogoHovered ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 180ms ease, transform 180ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#283D82'
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ) : (
            /* Expanded State: Logo + Wordmark + Collapse Button */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 2px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <img
                  src="/assets/truesight-logo-colour-1024 2.png"
                  alt="Truesight Logo"
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'contain',
                    flexShrink: 0
                  }}
                />
                <svg width="86" height="24" viewBox="47 15 82 20" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M51.1063 30.5V17.8215H47.2082V16.4023H56.4805V17.8215H52.6202V30.5H51.1063ZM56.4875 30.5V20.3572H57.9067V22.0225L57.7175 21.7765C57.9572 21.2971 58.3167 20.9186 58.7961 20.6411C59.2881 20.3635 59.881 20.2248 60.5749 20.2248H61.2182V21.644H60.3289C59.5972 21.644 59.0106 21.8711 58.569 22.3252C58.1275 22.7794 57.9067 23.4228 57.9067 24.2554V30.5H56.4875ZM65.9511 30.7271C65.2447 30.7271 64.6013 30.5631 64.021 30.2351C63.4407 29.8945 62.9802 29.4277 62.6396 28.8348C62.3116 28.2292 62.1476 27.5354 62.1476 26.7532V20.3572H63.5668V26.5829C63.5668 27.1254 63.6741 27.6048 63.8885 28.0211C64.1156 28.4248 64.4247 28.7402 64.8158 28.9672C65.2195 29.1943 65.6799 29.3078 66.1971 29.3078C66.7144 29.3078 67.1748 29.1943 67.5785 28.9672C67.9822 28.7275 68.2976 28.3932 68.5247 27.9643C68.7518 27.5228 68.8653 26.9992 68.8653 26.3937V20.3572H70.2845V30.5H68.8653V28.532L69.187 28.6077C68.9473 29.2637 68.5373 29.7809 67.957 30.1594C67.3767 30.5378 66.7081 30.7271 65.9511 30.7271ZM77.2949 30.7271C76.3487 30.7271 75.4909 30.5 74.7213 30.0458C73.9644 29.5791 73.3652 28.942 72.9236 28.1346C72.4821 27.3272 72.2613 26.4126 72.2613 25.3908C72.2613 24.3689 72.4758 23.4669 72.9047 22.6848C73.3336 21.89 73.9139 21.2655 74.6456 20.8114C75.3899 20.3572 76.2226 20.1302 77.1435 20.1302C77.8752 20.1302 78.5249 20.2689 79.0926 20.5465C79.6729 20.8114 80.1649 21.1772 80.5686 21.644C80.9722 22.0982 81.2813 22.6154 81.4958 23.1957C81.7102 23.7634 81.8175 24.35 81.8175 24.9555C81.8175 25.0817 81.8112 25.2268 81.7986 25.3908C81.7859 25.5422 81.767 25.6998 81.7418 25.8638H73.1696V24.5392H80.9281L80.2469 25.1069C80.3604 24.4131 80.2784 23.7949 80.0009 23.2525C79.7359 22.6974 79.3512 22.2622 78.8466 21.9468C78.3419 21.6188 77.7742 21.4548 77.1435 21.4548C76.5127 21.4548 75.9261 21.6188 75.3836 21.9468C74.8538 22.2748 74.4375 22.7352 74.1347 23.3282C73.8319 23.9085 73.7121 24.6023 73.7752 25.4097C73.7121 26.2171 73.8382 26.9235 74.1536 27.5291C74.4816 28.122 74.9232 28.5825 75.4782 28.9105C76.0459 29.2385 76.6515 29.4025 77.2949 29.4025C78.0392 29.4025 78.6636 29.2258 79.1682 28.8726C79.6729 28.5194 80.0829 28.0778 80.3982 27.548L81.6093 28.1914C81.4075 28.6455 81.0984 29.0682 80.6821 29.4592C80.2658 29.8377 79.7675 30.1468 79.1872 30.3865C78.6195 30.6135 77.9887 30.7271 77.2949 30.7271ZM87.3138 30.7271C86.3424 30.7271 85.4909 30.4811 84.7592 29.9891C84.0275 29.4971 83.4977 28.8285 83.1697 27.9832L84.3618 27.4155C84.652 28.0337 85.0557 28.5257 85.5729 28.8915C86.1027 29.2574 86.683 29.4403 87.3138 29.4403C87.9193 29.4403 88.4303 29.2952 88.8466 29.0051C89.2629 28.7023 89.471 28.3112 89.471 27.8318C89.471 27.4786 89.3701 27.2011 89.1683 26.9992C88.9664 26.7848 88.733 26.6208 88.4681 26.5072C88.2032 26.3937 87.9698 26.3117 87.768 26.2612L86.3109 25.8449C85.3773 25.58 84.7024 25.2078 84.2861 24.7285C83.8698 24.2491 83.6617 23.694 83.6617 23.0632C83.6617 22.4703 83.813 21.9531 84.1158 21.5115C84.4186 21.07 84.8286 20.7294 85.3458 20.4897C85.863 20.25 86.437 20.1302 87.0678 20.1302C87.9257 20.1302 88.7015 20.3572 89.3953 20.8114C90.1018 21.2529 90.6001 21.8711 90.8903 22.6658L89.6792 23.2335C89.4269 22.6658 89.061 22.2243 88.5817 21.9089C88.1149 21.5809 87.5913 21.4169 87.011 21.4169C86.4433 21.4169 85.9892 21.562 85.6486 21.8522C85.308 22.1423 85.1377 22.5082 85.1377 22.9497C85.1377 23.2903 85.226 23.5615 85.4026 23.7634C85.5792 23.9652 85.781 24.1166 86.0081 24.2175C86.2478 24.3185 86.456 24.3942 86.6326 24.4446L88.3167 24.9366C89.1367 25.1763 89.7738 25.5485 90.228 26.0531C90.6947 26.5577 90.9281 27.1506 90.9281 27.8318C90.9281 28.3869 90.7704 28.8852 90.455 29.3268C90.1523 29.7683 89.7297 30.1152 89.1872 30.3675C88.6447 30.6072 88.0203 30.7271 87.3138 30.7271ZM92.8963 30.5V20.3572H94.3156V30.5H92.8963ZM92.8963 18.4838V16.4023H94.3156V18.4838H92.8963ZM101.501 34.6631C100.808 34.6631 100.164 34.5558 99.5712 34.3414C98.9909 34.1269 98.4863 33.8305 98.0574 33.452C97.6411 33.0862 97.3194 32.6572 97.0923 32.1652L98.398 31.4651C98.5998 31.9445 98.9594 32.3608 99.4766 32.714C99.9938 33.0672 100.656 33.2438 101.464 33.2438C102.082 33.2438 102.649 33.124 103.167 32.8843C103.684 32.6446 104.1 32.2914 104.416 31.8246C104.731 31.3578 104.889 30.7838 104.889 30.1026V27.8508L105.116 28.0589C104.762 28.7906 104.239 29.3583 103.545 29.762C102.851 30.1531 102.094 30.3486 101.274 30.3486C100.328 30.3486 99.4766 30.1215 98.7197 29.6674C97.9628 29.2132 97.3635 28.6014 96.922 27.8318C96.4931 27.0497 96.2786 26.1855 96.2786 25.2394C96.2786 24.2806 96.4931 23.4165 96.922 22.6469C97.3635 21.8774 97.9564 21.2655 98.7008 20.8114C99.4577 20.3572 100.316 20.1302 101.274 20.1302C102.094 20.1302 102.839 20.3194 103.507 20.6978C104.188 21.0763 104.725 21.5872 105.116 22.2306L104.889 22.628V20.3572H106.308V30.1026C106.308 30.9731 106.1 31.7489 105.683 32.4302C105.28 33.124 104.712 33.6665 103.98 34.0575C103.261 34.4612 102.435 34.6631 101.501 34.6631ZM101.35 28.9294C102.006 28.9294 102.599 28.7654 103.129 28.4374C103.659 28.0968 104.081 27.6489 104.397 27.0938C104.725 26.5262 104.889 25.908 104.889 25.2394C104.889 24.5708 104.725 23.9589 104.397 23.4038C104.081 22.8362 103.659 22.3883 103.129 22.0603C102.599 21.7197 102.006 21.5494 101.35 21.5494C100.681 21.5494 100.076 21.7197 99.5334 22.0603C98.9909 22.3883 98.562 22.8298 98.2466 23.3849C97.9438 23.94 97.7924 24.5582 97.7924 25.2394C97.7924 25.908 97.9438 26.5262 98.2466 27.0938C98.562 27.6489 98.9846 28.0968 99.5144 28.4374C100.057 28.7654 100.669 28.9294 101.35 28.9294ZM108.698 30.5V16.1752H110.118V22.3252L109.796 22.2495C110.048 21.5935 110.458 21.0763 111.026 20.6978C111.606 20.3194 112.275 20.1302 113.032 20.1302C113.751 20.1302 114.394 20.2942 114.962 20.6222C115.542 20.9502 115.996 21.4043 116.324 21.9846C116.665 22.5523 116.835 23.1957 116.835 23.9148V30.5H115.416V24.4635C115.416 23.8454 115.303 23.3218 115.075 22.8929C114.848 22.464 114.533 22.136 114.129 21.9089C113.738 21.6692 113.29 21.5494 112.786 21.5494C112.281 21.5494 111.827 21.6692 111.423 21.9089C111.02 22.136 110.698 22.4703 110.458 22.9118C110.231 23.3408 110.118 23.858 110.118 24.4635V30.5H108.698ZM122.9 30.6135C121.991 30.6135 121.291 30.3486 120.799 29.8188C120.307 29.2889 120.061 28.532 120.061 27.548V21.7765H118.188V20.3572H118.661C119.09 20.3572 119.43 20.2185 119.683 19.9409C119.935 19.6508 120.061 19.2912 120.061 18.8623V18.0108H121.48V20.3572H123.713V21.7765H121.48V27.548C121.48 27.8886 121.531 28.1914 121.632 28.4563C121.733 28.7086 121.903 28.9105 122.143 29.0618C122.395 29.2132 122.729 29.2889 123.146 29.2889C123.246 29.2889 123.366 29.2826 123.505 29.27C123.644 29.2574 123.764 29.2448 123.865 29.2322V30.5C123.713 30.5378 123.543 30.5631 123.354 30.5757C123.164 30.6009 123.013 30.6135 122.9 30.6135Z"
                    fill="#283D82"
                  />
                </svg>
              </div>

              {/* Collapse Button */}
              <button
                onClick={onToggle}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  border: '1px solid #D6E1F9',
                  background: '#FFFFFF',
                  color: '#6B7790',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  transition: 'all 180ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#283D82';
                  e.currentTarget.style.color = '#283D82';
                  e.currentTarget.style.background = '#EBF2FE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#D6E1F9';
                  e.currentTarget.style.color = '#6B7790';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <Icon name="sidebarToggle" size={14} color="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          {navItems.map((item) => {
            const isActive = currentNav === item.id;

            return (
              <a
                key={item.id}
                href={item.isAction ? '#notifications' : pathFor(item.id === 'projects-hub' ? 'projects' : item.id)}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'notifications') {
                    if (onOpenNotifications) onOpenNotifications();
                    return;
                  }
                  onNavigate(item.id);
                }}
                title={isCollapsed ? item.label : undefined}
                style={{
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: isCollapsed ? '0' : '0 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'var(--primary-navy)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--secondary-text)',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '14px',
                  lineHeight: '18px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'background-color 180ms ease, color 180ms ease, padding 280ms cubic-bezier(.2, .8, .2, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(40, 61, 130, 0.22)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(40, 61, 130, 0.08)';
                    e.currentTarget.style.color = 'var(--primary-navy)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--secondary-text)';
                  }
                }}
              >
                {/* Fixed Icon Container */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    bold={isActive}
                    color={isActive ? '#FFFFFF' : 'currentColor'}
                  />

                  {/* Collapsed dot badge for notifications */}
                  {item.id === 'notifications' && unreadNotificationsCount > 0 && isCollapsed && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '1px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#FEE047',
                        border: '1.5px solid #FFFFFF'
                      }}
                    />
                  )}
                </div>

                {/* Animated Label */}
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: isCollapsed ? 0 : '10px',
                    maxWidth: isCollapsed ? 0 : '120px',
                    opacity: isCollapsed ? 0 : 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    pointerEvents: isCollapsed ? 'none' : 'auto',
                    transition: 'max-width 280ms cubic-bezier(.2, .8, .2, 1), opacity 200ms ease, margin-left 280ms cubic-bezier(.2, .8, .2, 1)'
                  }}
                >
                  {item.label}
                </span>

                {/* Expanded pill badge for notifications */}
                {item.id === 'notifications' && unreadNotificationsCount > 0 && !isCollapsed && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: '#FEE047',
                      color: '#1E2538',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      lineHeight: '14px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {unreadNotificationsCount}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Profile Area at Bottom */}
      <div
        style={{
          padding: isCollapsed ? '8px 0 2px 0' : '8px 2px 2px 2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'stretch',
          gap: '8px',
          borderTop: '1px solid #D6E1F9',
          paddingTop: '10px'
        }}
      >
        {/* User Info Row */}
        <div
          onClick={() => onNavigate('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? 0 : '12px',
            cursor: 'pointer',
            padding: isCollapsed ? '4px' : '4px 6px',
            borderRadius: '10px',
            backgroundColor: currentNav === 'profile' ? '#EFF6FF' : 'transparent',
            outline: currentNav === 'profile' ? '1.5px solid #BFDBFE' : 'none',
            transition: 'all 160ms ease'
          }}
          title="Click to view student profile & security"
        >
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={38} />

          <div
            style={{
              maxWidth: isCollapsed ? 0 : '110px',
              opacity: isCollapsed ? 0 : 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              pointerEvents: isCollapsed ? 'none' : 'auto',
              transition: 'max-width 280ms cubic-bezier(.2, .8, .2, 1), opacity 200ms ease'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontWeight: 600,
                fontSize: '15px',
                lineHeight: '20px',
                color: '#101828',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {profile?.name || 'Student'}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#8A97A6',
                marginTop: '1px'
              }}
            >
              Student
            </div>
          </div>
        </div>

        {/* Logout Button: Matches user images exactly in both expanded and collapsed states */}
        {isCollapsed ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Logout"
            title="logout"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: '1px solid #D6E1F9',
              background: 'transparent',
              color: '#283D82',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 150ms ease, border-color 150ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EBF2FE';
              e.currentTarget.style.borderColor = '#283D82';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#D6E1F9';
            }}
          >
            <Icon name="logout" size={20} color="#283D82" />
          </button>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Logout"
            title="logout"
            style={{
              width: '100%',
              height: '30px',
              borderRadius: '12px',
              border: '1px solid #D6E1F9',
              background: 'transparent',
              color: '#283D82',
              fontFamily: 'var(--font-primary)',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'background-color 150ms ease, border-color 150ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EBF2FE';
              e.currentTarget.style.borderColor = '#283D82';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#D6E1F9';
            }}
          >
            logout
          </button>
        )}
      </div>

      {/* Student Profile Modal */}
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <ModalPortal isOpen={true} onClose={() => setShowLogoutConfirm(false)}>
        <div
          style={{
            width: '340px',
            maxWidth: '92vw',
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            animation: 'modalContentPop 0.25s ease',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>Confirm Logout</h3>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginBottom: '20px' }}>
            Are you sure you want to log out of your TrueSights student session?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                background: '#F1F5F9',
                color: '#475569',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                logout();
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
        </ModalPortal>
      )}
    </aside>
  );
}
