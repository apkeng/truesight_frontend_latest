import React, { useState } from 'react';
import Icon from '../design-system/icons';

export default function NoInternetScreen({ onRetry, onContinueOffline, onToggleSimulation, isSimulated = false }) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [latency, setLatency] = useState(null);

  // Live real-time connectivity probe
  const testConnection = async () => {
    setIsChecking(true);
    setCheckResult(null);
    const startTime = Date.now();

    try {
      // Fetch with cache-buster to verify actual end-to-end network reachability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`/assets/no-internet.png?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok && !isSimulated) {
        const roundTrip = Date.now() - startTime;
        setLatency(roundTrip);
        setCheckResult('online');
        setTimeout(() => {
          if (onRetry) onRetry();
        }, 600);
      } else {
        setCheckResult('offline');
      }
    } catch {
      setCheckResult('offline');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Real-time Status Badge in Top-Right */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#B91C1C'
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#EF4444',
            animation: 'pulse 1.5s infinite'
          }}
        />
        <span>{isSimulated ? 'Offline Mode (Simulated)' : 'Connection Disconnected'}</span>
      </div>

      {/* Main Illustration */}
      <div
        style={{
          width: '260px',
          height: '190px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <img
          src="/assets/no-internet.png"
          alt="No Internet Connection"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.08))'
          }}
        />
      </div>

      {/* Clear Hierarchy: Title & Subtitle */}
      <div style={{ maxWidth: '460px', marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0F172A',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em'
          }}
        >
          No Internet Connection
        </h1>
        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#64748B',
            margin: 0
          }}
        >
          Your computer appears to be offline. Please verify your Wi-Fi router, network cables, or cellular connection. TrueSights will automatically re-sync when connectivity returns.
        </p>
      </div>

      {/* Check Result Feedback (if retried) */}
      {checkResult === 'offline' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#FFF1F2',
            border: '1px solid #FECDD3',
            borderRadius: '10px',
            color: '#E11D48',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Still offline. Network endpoint did not respond.</span>
        </div>
      )}

      {checkResult === 'online' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '10px',
            color: '#047857',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>✓</span>
          <span>Connected! Latency: {latency}ms. Restoring workspace...</span>
        </div>
      )}

      {/* Primary & Secondary Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <button
          type="button"
          onClick={testConnection}
          disabled={isChecking}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0B3A6F',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 24px',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: isChecking ? 'wait' : 'pointer',
            boxShadow: '0 2px 8px rgba(11, 58, 111, 0.22)',
            transition: 'all 160ms ease'
          }}
          onMouseEnter={(e) => {
            if (!isChecking) e.currentTarget.style.backgroundColor = '#082B53';
          }}
          onMouseLeave={(e) => {
            if (!isChecking) e.currentTarget.style.backgroundColor = '#0B3A6F';
          }}
        >
          {isChecking ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite'
                }}
              />
              <span>Checking Network...</span>
            </>
          ) : (
            <>
              <Icon name="refresh" size={15} color="#FFFFFF" />
              <span>Try Again</span>
            </>
          )}
        </button>

        {onContinueOffline && (
          <button
            type="button"
            onClick={onContinueOffline}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '11px 20px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 160ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
          >
            Browse Offline Cache
          </button>
        )}

        {onToggleSimulation && (
          <button
            type="button"
            onClick={onToggleSimulation}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '11px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isSimulated ? 'Exit Offline Simulation' : 'Toggle Simulation'}
          </button>
        )}
      </div>

      {/* Troubleshooting Tips Footer */}
      <div
        style={{
          marginTop: '36px',
          paddingTop: '20px',
          borderTop: '1px solid #F1F5F9',
          maxWidth: '520px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '12px',
          color: '#64748B'
        }}
      >
        <span>• Check Wi-Fi settings</span>
        <span>• Disable VPN proxy</span>
        <span>• Contact network administrator</span>
      </div>
    </div>
  );
}
