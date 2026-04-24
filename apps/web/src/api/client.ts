const base = import.meta.env.VITE_API_BASE || '/api';

export function getToken() {
  return localStorage.getItem('rv_token');
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem('rv_token', t);
  else localStorage.removeItem('rv_token');
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const t = getToken();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.message || JSON.stringify(j);
    } catch {
      // ignore
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) return res.json();
  return res.text();
}
