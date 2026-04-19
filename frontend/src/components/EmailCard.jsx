import { useState } from 'react';
import { RiskBadge, RiskScoreRing, getRiskMeta } from './RiskBadge';
import { HighlightedBody } from './HighlightedBody';
import { ScamWarningModal } from './ScamWarningModal';

const RISKY_LABELS = {
  'domain spoofing':        'Unknown sender domain',
  'urgency language':       'Creates urgency',
  'urgency manipulation':   'Creates urgency',
  'credential request':     'Requests sensitive info',
  'suspicious link':        'Suspicious link detected',
  'unverified link':        'Unverified link',
  'generic greeting':       'Impersonal / generic greeting',
  'reward bait':            'Uses reward bait',
  'prize claim':            'Fake prize / reward claim',
  'impersonation':          'Impersonates known brand',
  'grammar errors':         'Poor grammar / spelling',
  'analysis_failed':        'Could not analyze',
};

function humanizeSignal(signal) {
  const lower = signal.toLowerCase();
  for (const [key, label] of Object.entries(RISKY_LABELS)) {
    if (lower.includes(key)) return label;
  }
  return signal.charAt(0).toUpperCase() + signal.slice(1);
}

export function EmailCard({ email, onMarkAsScam, onMarkAsSafe, isLabeled, isSafe }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [labeling, setLabeling] = useState(false);
  const [safing, setSafing] = useState(false);
  const { level } = getRiskMeta(email.risk_score);

  const leftBarColor = {
    high:    '#EF4444',
    medium:  '#F59E0B',
    low:     '#10B981',
    pending: '#E5E7EB',
  }[level];

  const sender = email.sender || email.from || 'Unknown sender';
  const senderName = sender.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim() || sender.split('@')[0];
  const senderEmail = sender.match(/<(.+)>/)?.[1] || sender;
  const signals = email.signals || [];
  const bodyText = email.body_preview || email.snippet || '';

  function handleCardClick() {
    setExpanded(v => !v);
    if (!expanded && email.risk_score >= 70) {
      setShowModal(true);
    }
  }

  async function handleMarkScam(e) {
    e?.stopPropagation();
    setLabeling(true);
    try { await onMarkAsScam(email.id || email.email_id); }
    finally { setLabeling(false); }
  }

  async function handleMarkSafe(e) {
    e?.stopPropagation();
    setSafing(true);
    try { await onMarkAsSafe(email.id || email.email_id); }
    finally { setSafing(false); }
  }

  async function handleBlock() {
    setShowModal(false);
    await handleMarkScam();
  }

  return (
    <>
      {showModal && (
        <ScamWarningModal
          email={email}
          onBlock={handleBlock}
          onIgnore={() => setShowModal(false)}
        />
      )}

      <div
        onClick={handleCardClick}
        style={{
          background: isSafe ? '#F0FDF4' : 'white',
          border: `1px solid ${isSafe ? '#BBF7D0' : '#E5E7EB'}`,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
          fontFamily: "'DM Sans', sans-serif",
          opacity: isSafe ? 0.75 : 1,
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Color accent bar */}
        <div style={{ height: 3, background: leftBarColor, transition: 'background 0.3s' }} />

        {/* Main row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <SenderAvatar name={senderName} level={level} />
              <span style={{ fontWeight: 500, fontSize: '0.88rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {senderName}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Mono', monospace" }}>
                {senderEmail}
              </span>
              {isSafe && (
                <span style={{ fontSize: '0.7rem', color: '#059669', background: '#DCFCE7', padding: '1px 6px', borderRadius: 4, border: '1px solid #BBF7D0', flexShrink: 0 }}>
                  marked safe
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email.subject || '(No subject)'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <RiskBadge score={email.risk_score} />
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#9CA3AF' }}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div
            style={{ borderTop: '1px solid #F3F4F6', padding: '1.25rem' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Score ring + level */}
            {email.risk_score !== undefined && email.risk_score !== null && (
              <div style={{ marginBottom: '1.25rem' }}>
                <RiskScoreRing score={email.risk_score} />
              </div>
            )}

            {/* Reasons / signals */}
            {signals.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>
                  Why it's risky
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {signals.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 10px',
                      borderRadius: 7,
                      background: level === 'high' ? '#FFF7F7' : level === 'medium' ? '#FFFBEB' : '#F0FDF4',
                      border: `1px solid ${level === 'high' ? '#FEE2E2' : level === 'medium' ? '#FDE68A' : '#BBF7D0'}`,
                      fontSize: '0.82rem',
                      color: level === 'high' ? '#991B1B' : level === 'medium' ? '#92400E' : '#065F46',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.65rem' }}>
                        {level === 'high' ? '!' : level === 'medium' ? '?' : '✓'}
                      </span>
                      {humanizeSignal(s)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI explanation */}
            {email.explanation && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>
                  AI analysis
                </p>
                <p style={{
                  fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.65, margin: 0,
                  padding: '0.75rem', background: '#F9FAFB',
                  borderRadius: 8, border: '1px solid #F3F4F6',
                }}>
                  {email.explanation}
                </p>
              </div>
            )}

            {/* Highlighted body preview */}
            {bodyText && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>
                  Email preview
                  <span style={{ marginLeft: 6, fontSize: '0.65rem', color: '#D97706', background: '#FFFBEB', padding: '1px 6px', borderRadius: 4, border: '1px solid #FDE68A', fontWeight: 400 }}>
                    risky phrases highlighted
                  </span>
                </p>
                <div style={{ padding: '0.75rem', background: '#FAFAFA', borderRadius: 8, border: '1px solid #F3F4F6', maxHeight: 140, overflowY: 'auto' }}>
                  <HighlightedBody text={bodyText.slice(0, 500)} />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {/* Mark safe */}
              {!isSafe && (
                <button
                  onClick={handleMarkSafe}
                  disabled={safing || isLabeled}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 8, border: '1px solid #BBF7D0',
                    background: safing ? '#F0FDF4' : 'white',
                    color: '#059669', fontSize: '0.82rem', fontWeight: 500,
                    cursor: safing ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { if (!safing) e.currentTarget.style.background = '#F0FDF4'; }}
                  onMouseOut={e => { if (!safing) e.currentTarget.style.background = 'white'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {safing ? 'Marking…' : 'Mark as safe'}
                </button>
              )}

              {/* Mark as scam */}
              {isLabeled ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.82rem', color: '#10B981', fontWeight: 500, padding: '0.45rem 0',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Labeled in Gmail
                </span>
              ) : (
                <button
                  onClick={handleMarkScam}
                  disabled={labeling || isSafe}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 8, border: '1px solid #FECACA',
                    background: labeling ? '#FEF2F2' : 'white',
                    color: '#DC2626', fontSize: '0.82rem', fontWeight: 500,
                    cursor: (labeling || isSafe) ? 'not-allowed' : 'pointer',
                    opacity: isSafe ? 0.4 : 1,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { if (!labeling && !isSafe) e.currentTarget.style.background = '#FEF2F2'; }}
                  onMouseOut={e => { if (!labeling && !isSafe) e.currentTarget.style.background = 'white'; }}
                >
                  {labeling ? <Spinner /> : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1l1.2 3.3H11L8.2 6.5l1 3L6 7.8 2.8 9.5l1-3L1 4.3h3.8z" stroke="currentColor" strokeWidth="1.1" fill="none"/>
                    </svg>
                  )}
                  {labeling ? 'Marking…' : 'Mark as scam'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SenderAvatar({ name, level }) {
  const bgColors   = { high: '#FEE2E2', medium: '#FFFBEB', low: '#ECFDF5', pending: '#F3F4F6' };
  const textColors = { high: '#DC2626', medium: '#D97706', low: '#059669', pending: '#9CA3AF' };
  const initials = name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
  return (
    <div style={{
      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
      background: bgColors[level], color: textColors[level],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.65rem', fontWeight: 700, fontFamily: "'DM Mono', monospace",
    }}>
      {initials}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      border: '1.5px solid #FECACA', borderTopColor: '#DC2626',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
