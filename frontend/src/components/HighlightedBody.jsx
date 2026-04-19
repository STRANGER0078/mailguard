const RISKY_PHRASES = [
  'urgent', 'act now', 'immediately', 'verify now', 'verify your',
  'free money', 'free gift', 'you have been selected', 'congratulations',
  'click here', 'limited time', 'expires', 'suspend', 'suspended',
  'account will be', 'unusual activity', 'otp', 'password', 'pin',
  'bank account', 'credit card', 'wire transfer', 'prize', 'winner',
  'claim your', 'confirm your', 'update your', '100%', 'guaranteed',
  'risk free', 'no cost', 'earn money', 'make money', 'bitcoin',
  'inheritance', 'million dollars', 'thousand dollars', 'stipend',
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightedBody({ text }) {
  if (!text) return null;

  const pattern = new RegExp(
    `(${RISKY_PHRASES.map(escapeRegex).join('|')})`,
    'gi'
  );

  const parts = text.split(pattern);

  return (
    <div style={{
      fontSize: '0.82rem',
      color: '#374151',
      lineHeight: 1.7,
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {parts.map((part, i) => {
        const isRisky = pattern.test(part);
        pattern.lastIndex = 0;
        return isRisky ? (
          <mark key={i} title="Risky phrase detected" style={{
            background: '#FEF08A',
            color: '#713F12',
            borderRadius: 3,
            padding: '0 2px',
            fontWeight: 500,
            border: '1px solid #FDE047',
            cursor: 'default',
          }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </div>
  );
}
