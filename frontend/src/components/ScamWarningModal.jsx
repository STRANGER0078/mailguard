export function ScamWarningModal({ email, onBlock, onIgnore }) {
  if (!email) return null;

  const signals = email.signals || [];
  const reasons = email.reasons || signals;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onIgnore}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 16,
          width: '100%', maxWidth: 420,
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Red header bar */}
        <div style={{ height: 4, background: '#EF4444' }} />

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L2 17h16L10 2z" stroke="#DC2626" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                <path d="M10 8v4M10 14.5v.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111', margin: '0 0 3px' }}>
                This email may be a scam
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                {email.subject || '(No subject)'}
              </p>
            </div>
          </div>

          {/* Score pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '4px 12px',
            marginBottom: '1rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#DC2626', fontFamily: "'DM Mono', monospace" }}>
              Risk score: {email.risk_score} / 100
            </span>
          </div>

          {/* Reasons */}
          {reasons.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>
                Why this is risky
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reasons.slice(0, 5).map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px',
                    background: '#FFF7F7',
                    border: '1px solid #FEE2E2',
                    borderRadius: 7,
                    fontSize: '0.82rem', color: '#7F1D1D',
                  }}>
                    <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.7rem' }}>!</span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation snippet */}
          {email.explanation && (
            <p style={{
              fontSize: '0.82rem', color: '#6B7280',
              lineHeight: 1.6, margin: '0 0 1.25rem',
              padding: '0.75rem', background: '#F9FAFB',
              borderRadius: 8, border: '1px solid #F3F4F6',
            }}>
              {email.explanation.slice(0, 200)}{email.explanation.length > 200 ? '…' : ''}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={onBlock}
              style={{
                flex: 1, padding: '0.65rem',
                background: '#DC2626', color: 'white',
                border: 'none', borderRadius: 9,
                fontWeight: 600, fontSize: '0.88rem',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'opacity 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Block email
            </button>
            <button
              onClick={onIgnore}
              style={{
                flex: 1, padding: '0.65rem',
                background: 'white', color: '#374151',
                border: '1px solid #E5E7EB', borderRadius: 9,
                fontWeight: 500, fontSize: '0.88rem',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}
            >
              Ignore
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
