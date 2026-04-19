import { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { EmailCard } from './EmailCard';
import { StatsBar } from './StatsBar';

const FILTERS = ['all', 'scam', 'suspicious', 'safe'];

export function Dashboard({ user, onLogout }) {
  const { emails, loading, scanning, error, fetchAndScan, markAsScam, markAsSafe, isLabeled, isSafe } = useEmails();
  const [filter, setFilter] = useState('all');
  const [hasScanned, setHasScanned] = useState(false);

  async function handleScan() {
    setHasScanned(true);
    await fetchAndScan();
  }

  const filtered = emails.filter(e => {
    if (filter === 'all') return true;
    const score = e.risk_score;
    if (filter === 'scam')       return score >= 70;
    if (filter === 'suspicious') return score >= 40 && score < 70;
    if (filter === 'safe')       return score !== undefined && score < 40;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.risk_score ?? -1) - (a.risk_score ?? -1));
  const scamCount = emails.filter(e => e.risk_score >= 70).length;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,249,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center',
        padding: '0.75rem 1.5rem', gap: '0.75rem',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: '#111',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="white" strokeWidth="1.2"/>
            <path d="M1.5 6l6.5 4 6.5-4" stroke="white" strokeWidth="1.2"/>
          </svg>
        </div>

        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.03em', color: '#111' }}>
          MailGuard
        </span>

        {scamCount > 0 && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            background: '#FEF2F2', color: '#DC2626',
            border: '1px solid #FECACA',
            padding: '2px 8px', borderRadius: 100,
          }}>
            {scamCount} scam{scamCount > 1 ? 's' : ''} detected
          </span>
        )}

        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#9CA3AF',
          background: '#F3F4F6', padding: '0.2rem 0.6rem', borderRadius: 100, border: '1px solid #E5E7EB',
        }}>
          {user?.email}
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleScan}
          disabled={loading || scanning}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: 8,
            background: (loading || scanning) ? '#F3F4F6' : '#111',
            color: (loading || scanning) ? '#9CA3AF' : 'white',
            border: 'none', fontSize: '0.82rem', fontWeight: 500,
            cursor: (loading || scanning) ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
          }}
        >
          {loading || scanning ? <InlineSpinner /> : <ScanIcon />}
          {loading ? 'Fetching…' : scanning ? 'Analyzing…' : 'Scan inbox'}
        </button>

        <button
          onClick={onLogout}
          style={{
            padding: '0.5rem 0.75rem', borderRadius: 8,
            border: '1px solid #E5E7EB', background: 'white',
            color: '#6B7280', fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Sign out
        </button>
      </nav>

      {emails.length > 0 && <StatsBar emails={emails} />}

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem' }}>

        {/* Filter tabs */}
        {emails.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.85rem', borderRadius: 8,
                  border: '1px solid', borderColor: filter === f ? '#111' : '#E5E7EB',
                  background: filter === f ? '#111' : 'white',
                  color: filter === f ? 'white' : '#6B7280',
                  fontSize: '0.8rem', fontWeight: filter === f ? 500 : 400,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  textTransform: 'capitalize', transition: 'all 0.15s',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.85rem 1rem', borderRadius: 10,
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#DC2626', fontSize: '0.875rem', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {!hasScanned && !loading && <EmptyState onScan={handleScan} />}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {scanning && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: 8,
                background: '#FFFBEB', border: '1px solid #FDE68A',
                fontSize: '0.8rem', color: '#92400E',
                fontFamily: "'DM Mono', monospace", marginBottom: '0.25rem',
              }}>
                <PulseDot />
                Running AI analysis…
              </div>
            )}
            {sorted.map(email => (
              <EmailCard
                key={email.id || email.email_id}
                email={email}
                onMarkAsScam={markAsScam}
                onMarkAsSafe={markAsSafe}
                isLabeled={isLabeled(email.id || email.email_id)}
                isSafe={isSafe(email.id || email.email_id)}
              />
            ))}
          </div>
        )}

        {!loading && hasScanned && sorted.length === 0 && emails.length > 0 && (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem', padding: '3rem' }}>
            No emails match this filter.
          </p>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onScan }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '5rem 2rem', gap: '1rem', textAlign: 'center',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="2" y="4" width="22" height="18" rx="3" stroke="#9CA3AF" strokeWidth="1.5"/>
          <path d="M2 9l11 7 11-7" stroke="#9CA3AF" strokeWidth="1.5"/>
        </svg>
      </div>
      <div>
        <p style={{ fontWeight: 500, color: '#111', margin: '0 0 0.3rem', fontSize: '0.95rem' }}>No emails scanned yet</p>
        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>Click "Scan inbox" to analyze your unread emails for scams.</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ height: 72, borderRadius: 12, overflow: 'hidden', background: 'white', border: '1px solid #E5E7EB' }}>
      <div style={{ height: 3, background: '#F3F4F6' }} />
      <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F3F4F6' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 10, width: '40%', background: '#F3F4F6', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 10, width: '65%', background: '#F3F4F6', borderRadius: 4 }} />
        </div>
        <div style={{ width: 64, height: 20, background: '#F3F4F6', borderRadius: 6 }} />
      </div>
    </div>
  );
}

function PulseDot() {
  return <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 1s ease-in-out infinite' }} />;
}

function ScanIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6.5 4v2.5l1.5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function InlineSpinner() {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
