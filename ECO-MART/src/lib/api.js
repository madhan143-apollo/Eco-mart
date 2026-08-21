const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('ecoMartToken');
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `API request failed (${response.status})`);
  return body;
};
export const syncApi = (path, data) => apiRequest(path, { method: 'PUT', body: JSON.stringify({ data }) }).catch((error) => console.warn(`[Eco Mart API] ${error.message}`));
export const scanWasteImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return apiRequest('/ai/scan-waste', { method: 'POST', body: formData });
};
export const calculateWastePrice = (category, weightKg) => apiRequest('/ai/calculate-price', { method: 'POST', body: JSON.stringify({ category, weightKg }) });