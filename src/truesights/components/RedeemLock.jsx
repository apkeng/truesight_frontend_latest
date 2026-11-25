import React from 'react';
import { useTS } from '../session';

/**
 * Reward redemption unlocks 3 months after sign-up. The server decides
 * (profile.canRedeem from /api/v2/bootstrap) and also refuses the order
 * itself; this only greys the redeem buttons out and explains why.
 */
export const REDEEM_LOCKED_TIP = 'Redemption is possible only after 3 months of usage.';

export function useRedeemLock() {
  const { profile } = useTS();
  return { locked: profile?.canRedeem === false, unlocksAt: profile?.redeemUnlocksAt || null };
}

/** Wraps a disabled redeem button; shows the lock tooltip on hover, keyboard focus or tap. */
export function RedeemLockTip({ locked, unlocksAt, style, children }) {
  if (!locked) return children;
  const date = unlocksAt
    ? new Date(unlocksAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  return (
    <span className="ts-redeem-lock" tabIndex={0} aria-label={REDEEM_LOCKED_TIP} style={style}>
      {children}
      <span role="tooltip" className="ts-redeem-lock-tip">
        {REDEEM_LOCKED_TIP}
        {date && <span className="ts-redeem-lock-date">Unlocks on {date}</span>}
      </span>
    </span>
  );
}
