export function StatsBar({ emails }) {
  const counts = emails.reduce(
    (acc, e) => {
      if (e.risk_score >= 70) acc.high++;
      else if (e.risk_score >= 40) acc.medium++;
      else if (e.risk_score !== undefined && e.risk_score !== null) acc.low++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      padding: '0.75rem 1.5rem',
      background: 'white',
      borderBottom: '1px solid #F3F4F6',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <Stat count={counts.high}   label="scam"       dot="#EF4444" />
      <Stat count={counts.medium} label="suspicious"  dot="#F59E0B" />
      <Stat count={counts.low}    label="safe"        dot="#10B981" />
    </div>
  );
}

function Stat({ count, label, dot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
      <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
        <span style={{ fontWeight: 600, color: '#111', fontFamily: "'DM Mono', monospace" }}>
          {count}
        </span>
        {' '}{label}
      </span>
    </div>
  );
}
