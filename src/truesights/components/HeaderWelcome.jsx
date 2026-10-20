import React from 'react';
import Icon from '../design-system/icons';
import { firstName, useTS } from '../session';

export default function HeaderWelcome({ onOpenNotifications, unreadCount = 0 }) {
  const { profile } = useTS();
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '4px',
          minWidth: 0
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(24px, 5.5vw, 42px)',
            lineHeight: '1.2',
            fontWeight: 600,
            color: 'var(--heading-text)',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          Welcome in, {firstName(profile?.name)}!
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '13.5px',
            lineHeight: '18px',
            fontWeight: 400,
            color: 'var(--secondary-text)',
            margin: 0
          }}
        >
          See how you're doing and track your work in one place.
        </p>
      </div>

      {onOpenNotifications && (
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`Notifications (${unreadCount} unread)`}
          title="Notifications & Updates (Events, Challenges, Projects)"
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            color: '#243367',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(36, 51, 103, 0.06)',
            transition: 'all 160ms cubic-bezier(.2, .8, .2, 1)',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EFF6FF';
            e.currentTarget.style.borderColor = '#BFDBFE';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(36, 51, 103, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(36, 51, 103, 0.06)';
          }}
        >
          <Icon name="notifications" size={20} color="#243367" />

          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                borderRadius: '999px',
                backgroundColor: '#FEE047',
                color: '#1E2538',
                fontSize: '10.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                border: '2px solid #FFFFFF'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
