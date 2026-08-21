import React, { useState } from 'react';
import { Cpu, Upload, Sparkles, CheckCircle2, RefreshCw, AlertCircle, Eye } from 'lucide-react';

const SAMPLE_AI_PRESETS = [
  {
    name: "PET Plastic Bottles Batch",
    category: "plastic",
    categoryLabel: "Plastic",
    weight: 250,
    confidence: 96,
    condition: "Cleaned & Compressed",
    suggestedPriceMin: 5500,
    suggestedPriceMax: 6800,
    recommendedPrice: 6200,
    img: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Corrugated Cardboard Boxes",
    category: "paper",
    categoryLabel: "Paper",
    weight: 400,
    confidence: 94,
    condition: "Dry & Compressed Bales",
    suggestedPriceMin: 2800,
    suggestedPriceMax: 3500,
    recommendedPrice: 3100,
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "E-Waste Motherboards & Circuit Boards",
    category: "ewaste",
    categoryLabel: "E-Waste",
    weight: 85,
    confidence: 98,
    condition: "Industrial Telecom Scrap",
    suggestedPriceMin: 22000,
    suggestedPriceMax: 26500,
    recommendedPrice: 24500,
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Crushed Aluminum Cans",
    category: "metal",
    categoryLabel: "Metal",
    weight: 180,
    confidence: 92,
    condition: "Sorted UBC Scrap",
    suggestedPriceMin: 16000,
    suggestedPriceMax: 19500,
    recommendedPrice: 17800,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80"
  }
];

export const AIWasteScanner = ({ onApplyAiResult }) => {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_AI_PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [customImage, setCustomImage] = useState(null);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const result = {
        ...selectedPreset,
        image: customImage || selectedPreset.img,
        timestamp: new Date().toLocaleTimeString()
      };
      setScanResult(result);
    }, 1800);
  };

  const handleApplyToForm = () => {
    if (scanResult && onApplyAiResult) {
      onApplyAiResult(scanResult);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">AI Vision Waste Classifier</h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 rounded-full uppercase">
                v2.4 Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">Upload or select sample image to auto-detect category, weight & market price</p>
          </div>
        </div>
      </div>

      {/* Preset selector / Image Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Select Sample Waste Image</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SAMPLE_AI_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setScanResult(null);
                }}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedPreset.name === preset.name
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <img src={preset.img} alt={preset.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{preset.categoryLabel}</p>
                  <p className="text-[10px] text-slate-400 truncate">{preset.name}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStartScan}
            disabled={isScanning}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running AI Deep Vision Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Run AI Waste Scanner</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Results View */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-between relative min-h-[220px]">
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-xs font-bold text-emerald-400 tracking-wider animate-pulse">ANALYZING SPECIMEN DENSITY & GRADE</p>
            </div>
          )}

          {scanResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Classification Complete</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{scanResult.confidence}% Confidence</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Detected Category</p>
                  <p className="font-extrabold text-emerald-400 text-sm capitalize">{scanResult.categoryLabel}</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated Quantity</p>
                  <p className="font-extrabold text-white text-sm">{scanResult.weight} kg</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Condition Grade</p>
                  <p className="font-bold text-slate-200">{scanResult.condition}</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Recommended Price</p>
                  <p className="font-extrabold text-lime-400 text-sm">₹{scanResult.recommendedPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>You can manually edit details anytime</span>
                </p>
                <button
                  type="button"
                  onClick={handleApplyToForm}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Auto-Fill Form
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Eye className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No Scan Active</p>
              <p className="text-[11px] text-slate-600 mt-1">Click "Run AI Waste Scanner" to analyze specimen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIWasteScanner;
