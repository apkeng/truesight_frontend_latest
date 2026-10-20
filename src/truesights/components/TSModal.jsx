import React from 'react';
import ModalPortal from './ModalPortal';
import { useIsMobile } from '../session';

/**
 * The design system's standard modal (DESIGN_SYSTEM.md section 7): fixed navy
 * header, scrollable body, fixed footer, rendered through ModalPortal.
 */
export default function TSModal({ eyebrow, title, onClose, footer, footerNote, maxWidth = 680, children }) {
  const isMobile = useIsMobile();
  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? '95%' : '100%',
          maxWidth: `${maxWidth}px`,
          maxHeight: isMobile ? '92vh' : '88vh',
          background: '#FFFFFF',
          borderRadius: isMobile ? '16px' : '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          style={{
            padding: isMobile ? '16px 18px' : '20px 28px',
            background: '#0B3A6F',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <div style={{ minWidth: 0 }}>
            {eyebrow && (
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255, 255, 255, 0.18)', padding: '2px 8px', borderRadius: '4px' }}>
                {eyebrow}
              </span>
            )}
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, margin: '4px 0 0 0' }}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#FFF', cursor: 'pointer', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: isMobile ? '16px 14px' : '22px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '14px' : '18px',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {children}
        </div>

        {(footer || footerNote) && (
          <div
            style={{
              padding: isMobile ? '12px 16px' : '14px 28px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{footerNote}</span>
            <div style={{ display: 'flex', gap: '8px' }}>{footer}</div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
}

const VARIANTS = {
  navy: { background: '#0B3A6F', hover: '#092C54', color: '#FFFFFF', border: 'none', shadow: '0 2px 6px rgba(11, 58, 111, 0.2)' },
  blue: { background: '#2563EB', hover: '#1D4ED8', color: '#FFFFFF', border: 'none', shadow: '0 2px 8px rgba(37, 99, 235, 0.25)' },
  amber: { background: '#FEE047', hover: '#FACC15', color: '#0B1A2B', border: 'none', shadow: '0 2px 6px rgba(254, 224, 71, 0.35)' },
  secondary: { background: '#FFFFFF', hover: '#F8FAFC', color: '#0B1A2B', border: '1px solid #E2E8F0', shadow: 'none' },
  danger: { background: '#DC2626', hover: '#B91C1C', color: '#FFFFFF', border: 'none', shadow: '0 2px 6px rgba(220, 38, 38, 0.2)' }
};

/** The design system's button variants (DESIGN_SYSTEM.md section 4). */
export function TSButton({ variant = 'navy', disabled, busy, children, style = {}, ...rest }) {
  const v = VARIANTS[variant];
  const off = disabled || busy;
  return (
    <button
      type="button"
      disabled={off}
      {...rest}
      style={{
        background: off ? '#E2E8F0' : v.background,
        color: off ? '#94A3B8' : v.color,
        border: v.border,
        borderRadius: '8px',
        padding: variant === 'secondary' ? '8px 16px' : '10px 20px',
        fontSize: variant === 'secondary' ? '12.5px' : '13px',
        fontWeight: variant === 'amber' ? 800 : 700,
        cursor: off ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: off ? 'none' : v.shadow,
        transition: 'all 0.15s ease',
        fontFamily: 'var(--font-primary)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (off) return;
        e.currentTarget.style.background = v.hover;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        if (off) return;
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.transform = 'none';
      }}
    >
      {busy ? 'Please wait…' : children}
    </button>
  );
}
