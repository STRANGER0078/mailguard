const BASE_URL = "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("mg_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getLoginUrl() { return `${BASE_URL}/auth/login`; },
  async fetchUnread(maxResults = 5) {
    const res = await fetch(`${BASE_URL}/emails/unread?max_results=${maxResults}`, { headers: authHeaders() });
    return handleResponse(res);
  },
  async scanAll(count = 3) {
    const res = await fetch(`${BASE_URL}/emails/scan-all?max_results=${count}`, { method: "POST", headers: authHeaders() });
    return handleResponse(res);
  },
  async labelAsScam(emailId) {
    const res = await fetch(`${BASE_URL}/emails/label/${emailId}`, { method: "POST", headers: authHeaders() });
    return handleResponse(res);
  },
};
