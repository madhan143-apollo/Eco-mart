const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('ecoMartToken');
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `API request failed (${response.status})`);
  return body;
};
export const syncApi = (path, data) => apiRequest(path, { method: 'PUT', body: JSON.stringify({ data }) }).catch((error) => console.warn(`[Eco Mart API] ${error.message}`));