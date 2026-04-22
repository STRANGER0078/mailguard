import { useState, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function authHeaders() {
  const token = localStorage.getItem('mg_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [labeled, setLabeled] = useState(new Set());
  const [markedSafe, setMarkedSafe] = useState(new Set());

  const fetchAndScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res1 = await fetch(`${BASE_URL}/emails/unread?max_results=5`, { headers: authHeaders() });
      const unread = await handleResponse(res1);
      setEmails(unread.map(e => ({ ...e, status: 'pending' })));
      setLoading(false);

      if (!unread.length) return;

      setScanning(true);
      const res2 = await fetch(`${BASE_URL}/emails/scan-all?max_results=3`, {
        method: 'POST', headers: authHeaders(),
      });
      const scanned = await handleResponse(res2);
      const scannedMap = Object.fromEntries(scanned.map(s => [s.email_id, s]));
      setEmails(prev =>
        prev.map(e => ({
          ...e,
          ...(scannedMap[e.id] || {}),
          status: scannedMap[e.id] ? 'done' : 'pending',
        }))
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      setScanning(false);
    }
  }, []);

  const markAsScam = useCallback(async (emailId) => {
    const res = await fetch(`${BASE_URL}/emails/label/${emailId}`, {
      method: 'POST', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Label failed');
    setLabeled(prev => new Set([...prev, emailId]));
    // Optimistic UI: update risk level to scam if not already
    setEmails(prev => prev.map(e =>
      (e.id === emailId || e.email_id === emailId)
        ? { ...e, risk_level: 'scam', is_scam: true }
        : e
    ));
  }, []);

  const markAsSafe = useCallback(async (emailId) => {
    // Local-only action — just update UI state
    setMarkedSafe(prev => new Set([...prev, emailId]));
    setEmails(prev => prev.map(e =>
      (e.id === emailId || e.email_id === emailId)
        ? { ...e, _markedSafe: true }
        : e
    ));
  }, []);

  const isLabeled  = useCallback(id => labeled.has(id), [labeled]);
  const isSafe     = useCallback(id => markedSafe.has(id), [markedSafe]);

  return { emails, loading, scanning, error, fetchAndScan, markAsScam, markAsSafe, isLabeled, isSafe };
}
