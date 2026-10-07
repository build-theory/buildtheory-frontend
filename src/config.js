export const config = {
  brandName: 'BuildTheory', domain: 'https://buildtheory.dev',
  tagline: 'Agentic AI for insurance operations.',
  description: 'AI checks before claim submission, discrepancy investigation for insurers, and document chat with page-linked evidence.',
  companyStatus: 'In development · Preparing for private beta',
  contactEmail: process.env.REACT_APP_CONTACT_EMAIL || 'kush@buildtheory.dev',
  founder: { name: process.env.REACT_APP_FOUNDER_NAME || '', bio: process.env.REACT_APP_FOUNDER_BIO || '', linkedin: process.env.REACT_APP_FOUNDER_LINKEDIN || '', github: process.env.REACT_APP_FOUNDER_GITHUB || '' },
  analyticsEnabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  apiUrl: (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
};
export function track(event) {
  // Host may register a privacy-conscious listener. Never include document or personal data.
  if (config.analyticsEnabled) window.dispatchEvent(new CustomEvent('buildtheory:analytics', { detail: { event } }));
}
export const sourceUrl = (id, kind) => `${config.apiUrl}/api/cases/${id}/sources/${kind}`;
let csrf = '';
export async function api(path, options = {}) {
  const response = await fetch(`${config.apiUrl}/api${path}`, { credentials: 'include', ...options,
    headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.method && options.method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({ error: 'The API returned an unreadable response.' }));
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
  if (data.csrf) csrf = data.csrf;
  return data;
}
