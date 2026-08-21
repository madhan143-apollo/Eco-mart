import fs from 'node:fs/promises';

const ALLOWED_CATEGORIES = new Set(['Plastic', 'Paper', 'Cardboard', 'Metal', 'E-Waste', 'Glass', 'Textile', 'Rubber', 'Mixed Waste', 'Other']);
const localAiUrl = process.env.LOCAL_AI_URL || 'http://127.0.0.1:8001/scan';

const validateResult = (result) => {
  const weightValid = result.estimatedWeightKg === null || (Number.isFinite(result.estimatedWeightKg) && result.estimatedWeightKg > 0 && result.estimatedWeightKg <= 100000);
  const quantityValid = result.estimatedQuantity === null || (Number.isFinite(result.estimatedQuantity) && result.estimatedQuantity >= 0);
  if (!ALLOWED_CATEGORIES.has(result.category) || typeof result.material !== 'string' || !result.material.trim() || typeof result.description !== 'string' || !result.description.trim() || !weightValid || !quantityValid || !Number.isFinite(result.confidence) || result.confidence < 0 || result.confidence > 1) {
    throw Object.assign(new Error('Local AI returned an invalid waste analysis'), { code: 'AI_INVALID_RESPONSE' });
  }
  return {
    modelConfigured: Boolean(result.modelConfigured),
    modelNotConfigured: Boolean(result.modelNotConfigured),
    material: result.material.trim(), category: result.category, description: result.description.trim(),
    estimatedQuantity: result.estimatedQuantity === null ? null : Math.round(result.estimatedQuantity),
    estimatedWeightKg: result.estimatedWeightKg === null ? null : Math.round(result.estimatedWeightKg * 100) / 100,
    confidence: Math.round(result.confidence * 100) / 100
  };
};
export const analyzeWasteImage = async (filePath, mimeType = 'image/jpeg') => {
  const image = await fs.readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([image], { type: mimeType }), 'waste-image');
  let response;
  try {
    response = await fetch(localAiUrl, { method: 'POST', body: form });
  } catch {
    throw Object.assign(new Error('Local AI service is unavailable. Start ai-service on http://127.0.0.1:8001.'), { code: 'AI_UNAVAILABLE' });
  }
  if (!response.ok) throw Object.assign(new Error('Local AI service could not analyze this image'), { code: 'AI_UNAVAILABLE', status: response.status });
  try {
    return validateResult(await response.json());
  } catch (error) {
    if (error.code === 'AI_INVALID_RESPONSE') throw error;
    throw Object.assign(new Error('Local AI returned an invalid response'), { code: 'AI_INVALID_RESPONSE' });
  }
};
