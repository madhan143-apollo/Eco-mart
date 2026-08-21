export const PRICING_BY_CATEGORY = Object.freeze({
  Plastic: 35,
  Paper: 18,
  Cardboard: 15,
  Metal: 55,
  'E-Waste': 80,
  Glass: 12,
  Textile: 20,
  Rubber: 25,
  'Mixed Waste': 10,
  Other: 8
});

export const normalizeCategory = (category) => {
  const value = String(category || '').trim().toLowerCase().replace(/[^a-z]/g, '');
  const match = Object.keys(PRICING_BY_CATEGORY).find((item) => item.toLowerCase().replace(/[^a-z]/g, '') === value)
    || (value === 'ewaste' ? 'E-Waste' : null)
    || (value === 'otherrecyclable' ? 'Other' : null);
  return match || null;
};

export const calculateWastePrice = (category, weightKg) => {
  const normalizedCategory = normalizeCategory(category);
  const numericWeight = Number(weightKg);
  if (!normalizedCategory || !Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > 100000) {
    throw new Error('Invalid waste category or weight');
  }
  const pricePerKg = PRICING_BY_CATEGORY[normalizedCategory];
  return {
    category: normalizedCategory,
    pricePerKg,
    estimatedPrice: Math.round(numericWeight * pricePerKg * 100) / 100
  };
};
