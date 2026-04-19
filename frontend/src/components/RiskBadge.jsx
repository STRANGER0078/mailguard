export function getRiskMeta(score) {
  if (score === undefined || score === null) {
    return { label: 'Scanning…', color: 'pending', level: 'pending', tag: '' };
  }
  if (score >= 70) return { label: `${score}`, color: 'high',   level: 'high',   tag: 'SCAM'       };
  if (score >= 40) return { label: `${score}`, color: 'medium', level: 'medium', tag: 'SUSPICIOUS'  };
  return             { label: `${score}`, color: 'low',    level: 'low',    tag: 'SAFE'       };
}

export function RiskBadge({ score, size = 'md' }) {
  const { label, color } = getRiskMeta(score);

  const colors = {
    high:    { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
    medium:  { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
    low:     { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    pending: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
  };

  const sz = size === 'lg'
    ? { fontSize: '13px', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }
    : { fontSize: '11px', padding: '2px 8px',  borderRadius: '6px', fontWeight: 600 };

  const c = colors[color];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      ...sz,
    }}>
      {color !== 'pending' && (
        <span style={{
          width: '5px', height: '5px',
          borderRadius: '50%',
          background: c.text,
          flexShrink: 0,
        }} />
      )}
      {color === 'pending' ? label : `${label} / 100`}
    </span>
  );
}

export function RiskScoreRing({ score }) {
  const { color, tag } = getRiskMeta(score);
  const colors = {
    high:    { stroke: '#EF4444', bg: '#FEF2F2', text: '#DC2626' },
    medium:  { stroke: '#F59E0B', bg: '#FFFBEB', text: '#D97706' },
    low:     { stroke: '#10B981', bg: '#ECFDF5', text: '#059669' },
    pending: { stroke: '#E5E7EB', bg: '#F9FAFB', text: '#9CA3AF' },
  };
  const c = colors[color];
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(score, 100) / 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke={c.stroke} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: c.text, lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{score}</span>
          <span style={{ fontSize: '0.55rem', color: '#9CA3AF', fontFamily: "'DM Mono', monospace" }}>/100</span>
        </div>
      </div>
      <div>
        <div style={{
          display: 'inline-block',
          padding: '3px 10px', borderRadius: 6,
          background: c.bg, color: c.text,
          fontSize: '0.7rem', fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}>{tag}</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
          {color === 'high' ? 'High risk — take action' :
           color === 'medium' ? 'Review before clicking' : 'Looks legitimate'}
        </div>
      </div>
    </div>
  );
}
