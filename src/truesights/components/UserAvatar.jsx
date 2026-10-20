import React, { useState } from 'react';
import { initials } from '../session';

/** The signed-in user's photo, or their initials on navy when there is none. */
export default function UserAvatar({ name, photoURL, size = 38, style = {} }) {
  const [broken, setBroken] = useState(false);
  const box = { width: `${size}px`, height: `${size}px`, borderRadius: '50%', flexShrink: 0, ...style };
  if (photoURL && !broken) {
    return <img src={photoURL} alt={name || 'Profile'} onError={() => setBroken(true)} style={{ ...box, objectFit: 'cover' }} />;
  }
  return (
    <div
      aria-label={name || 'Profile'}
      style={{
        ...box,
        backgroundColor: '#243367',
        color: '#FFFFFF',
        fontWeight: 800,
        fontSize: `${Math.round(size * 0.38)}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initials(name)}
    </div>
  );
}
