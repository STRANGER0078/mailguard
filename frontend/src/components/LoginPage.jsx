import { api } from '../api';

export function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAF9',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo mark */}
      <div style={{
        width: 56, height: 56,
        borderRadius: 16,
        background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="3" y="6" width="22" height="16" rx="3" stroke="white" strokeWidth="1.5"/>
          <path d="M3 10l11 7 11-7" stroke="white" strokeWidth="1.5"/>
          <circle cx="21" cy="20" r="4.5" fill="#111" stroke="#EF4444" strokeWidth="1.5"/>
          <path d="M19.5 20l1 1 2-2" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: '2rem',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: '#111',
        margin: '0 0 0.4rem',
      }}>
        MailGuard
      </h1>

      <p style={{
        color: '#6B7280',
        fontSize: '0.95rem',
        marginBottom: '2.5rem',
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 1.6,
      }}>
        AI-powered scam detection for your Gmail inbox. Connect your account to get started.
      </p>

      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: '1.75rem',
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <a
          href={api.getLoginUrl()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            background: '#111',
            color: 'white',
            borderRadius: 10,
            fontWeight: 500,
            fontSize: '0.9rem',
            textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <p style={{
          fontSize: '0.75rem',
          color: '#9CA3AF',
          textAlign: 'center',
          lineHeight: 1.5,
          margin: 0,
        }}>
          Requires Gmail read + modify access to scan and label emails. No data is stored.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.579c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.579 9 3.579z" fill="#EA4335"/>
    </svg>
  );
}
