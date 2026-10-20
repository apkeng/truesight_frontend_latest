import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Modal Portal
 * Mounts modals directly to document.body, ensuring the overlay backdrop
 * seamlessly covers the ENTIRE viewport window (including sidebars, headers, and outer page margins).
 */
export default function ModalPortal({
  isOpen = true,
  onClose,
  children,
  zIndex = 999999,
  style = {},
  className = ''
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`modal-overlay-backdrop ${className}`.trim()}
      style={{ zIndex, ...style }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {children}
    </div>,
    document.body
  );
}
