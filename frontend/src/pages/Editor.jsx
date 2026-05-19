// src/pages/Editor.jsx
import * as api from '../api/imageApi';
import { useState } from "react";
import Navbar from "../components/Navbar";
import HistogramChart from '../components/HistogramPanel';

const Editor = () => {
  // --- STATE MANAGEMENT ---
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("color");
  const [rawFile, setRawFile] = useState(null);

  // State Loading untuk Mengaktifkan Spinner Overlay (Task #3)
  const [isLoading, setIsLoading] = useState(false);

  // Struktur Objek Riwayat Versi Baru untuk Sinkronisasi Histogram (Task #4)
  const [imageHistory, setImageHistory] = useState([
    { image: null, rgbData: null, grayscaleData: null },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);

  // --- STATE PARAMETER TOOLS PCD (Sesuai Spesifikasi Dokumen) ---
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [hueSaturation, setHueSaturation] = useState(100);
  const [rotateAngle, setRotateAngle] = useState(0);
  const [resizeScale, setResizeScale] = useState(100);
  const [thresholdValue, setThresholdValue] = useState(128);
  const [compressionQuality, setCompressionQuality] = useState(80);

  // State Output Teks Tambahan untuk Fitur CNN (Decision #4)
  const [cnnResultInfo, setCnnResultInfo] = useState("");

  // --- HANDLERS ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // FIX: tambahkan [0]
    if (file) {
      setRawFile(file);
      const imageUrl = URL.createObjectURL(file);

      // Ambil histogram asli dari backend
      api.getHistogram(file).then(histData => {
        setImageHistory([{
          image: imageUrl,
          rawFile: file,          // simpan file asli
          currentBase64: null,    // belum ada hasil proses
          rgbData: histData ? [...histData.r] : [],
          grayscaleData: histData ? [...histData.gray] : [],
        }]);
      }).catch(() => {
        setImageHistory([{
          image: imageUrl,
          rawFile: file,
          currentBase64: null,
          rgbData: [],
          grayscaleData: [],
        }]);
      });

      setHistoryIndex(0);
      setCnnResultInfo("");
    }
  };

  const handleResetImage = () => {
    if (imageHistory[0]?.image) {
      setImageHistory([imageHistory[0]]);
      setHistoryIndex(0);
      setCnnResultInfo("");
      setBrightness(100);
      setContrast(100);
      setHueSaturation(100);
      setRotateAngle(0);
      setResizeScale(100);
      setThresholdValue(128);
      setCompressionQuality(80);
      alert("Gambar dikembalikan ke versi awal (Reset).");
    }
  };

  const applyEffect = async (effectName) => {
  const currentEntry = imageHistory[historyIndex];
  if (!currentEntry?.rawFile) return;

  setIsLoading(true);

  try {
    // Opsi B: kirim base64 kalau sudah ada hasil sebelumnya, 
    // kalau belum kirim file asli
    const source = currentEntry.currentBase64 
      ? currentEntry.currentBase64  // base64 hasil sebelumnya
      : currentEntry.rawFile;       // file asli pertama kali

    let resultBase64 = null;
    let cnnResult = "";

    // Mapping effectName ke fungsi API
    switch (effectName) {
      // Enhancement
      case "Brightness & Contrast":
        resultBase64 = await api.applyBrightnessContrast(source, brightness - 100, contrast / 100);
        break;
      case "Histogram Equalization":
        resultBase64 = await api.applyHistogramEqualization(source);
        break;
      case "Sharpening Filter":
        resultBase64 = await api.applySharpen(source);
        break;
      case "Smoothing Blur":
        resultBase64 = await api.applySmooth(source, 5);
        break;

      // Color
      case "Grayscale Conversion":
        resultBase64 = await api.applyGrayscale(source);
        break;
      case "Split Channel Red":
        resultBase64 = await api.applyChannelSplit(source, "R");
        break;
      case "Split Channel Green":
        resultBase64 = await api.applyChannelSplit(source, "G");
        break;
      case "Split Channel Blue":
        resultBase64 = await api.applyChannelSplit(source, "B");
        break;
      case "Hue & Saturation":
        resultBase64 = await api.applyHueSaturation(source, hueSaturation - 100, hueSaturation - 100);
        break;

      // Transform
      case "Rotate":
        resultBase64 = await api.applyRotate(source, rotateAngle);
        break;
      case "Flip Horizontal":
        resultBase64 = await api.applyFlip(source, 1);
        break;
      case "Flip Vertical":
        resultBase64 = await api.applyFlip(source, 0);
        break;
      case "Scaling (Resize)":
        const origW = 800, origH = 600; // default fallback
        resultBase64 = await api.applyResize(source,
          Math.round(origW * resizeScale / 100),
          Math.round(origH * resizeScale / 100));
        break;
      case "Affine Translation":
        resultBase64 = await api.applyTranslate(source, 50, 50);
        break;

      // Filter
      case "Gaussian Blur":
        resultBase64 = await api.applyGaussianBlur(source, 5);
        break;
      case "Median Filter":
        resultBase64 = await api.applyMedianFilter(source, 5);
        break;
      case "Salt & Pepper Noise Removal":
        resultBase64 = await api.applyNoiseRemoval(source);
        break;

      // Edge Detection
      case "Canny Edge":
        resultBase64 = await api.applyEdgeCanny(source, 100, 200);
        break;
      case "Sobel Edge":
        resultBase64 = await api.applyEdgeSobel(source);
        break;
      case "Prewitt Edge":
        resultBase64 = await api.applyEdgePrewitt(source);
        break;
      case "Robert Edge":
        resultBase64 = await api.applyEdgeRobert(source);
        break;
      case "Laplacian Edge":
        resultBase64 = await api.applyEdgeLaplacian(source);
        break;
      case "Laplacian of Gaussian (LoG)":
        resultBase64 = await api.applyEdgeLoG(source);
        break;

      // Binary & Morphology
      case "Binary Thresholding":
        resultBase64 = await api.applyThreshold(source, thresholdValue);
        break;
      case "Erosion Operation":
        resultBase64 = await api.applyMorphology(source, "erode", 5);
        break;
      case "Dilation Operation":
        resultBase64 = await api.applyMorphology(source, "dilate", 5);
        break;

      // Segmentation
      case "Threshold-based Segmentation":
        resultBase64 = await api.applyThreshold(source, thresholdValue);
        break;
      case "Edge-based Segmentation":
        resultBase64 = await api.applySegmentEdge(source);
        break;
      case "Region-based Segmentation":
        resultBase64 = await api.applySegmentRegion(source);
        break;

      // Compression
      case "JPEG Simulation Compression":
        const compResult = await api.applyJpegQuality(source, compressionQuality);
        resultBase64 = compResult.image;
        break;

      // CNN
      case "CNN Object Recognition":
        const predictions = await api.runCNNRecognition(currentEntry.rawFile);
        if (predictions && predictions.length > 0) {
          cnnResult = `Detected: ${predictions[0].label} (${predictions[0].confidence}%)`;
        }
        break;

      default:
        break;
    }

    // Update history dengan hasil baru
    if (resultBase64 || cnnResult) {
      // Ambil histogram dari hasil gambar baru
      let newRgbData = [];
      let newGrayData = [];

      if (resultBase64) {
        try {
          // Konversi base64 ke blob untuk getHistogram
          const byteCharacters = atob(resultBase64);
          const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          const histFile = new File([blob], 'result.png', { type: 'image/png' });
          const histData = await api.getHistogram(histFile);
          if (histData) {
            newRgbData = [...(histData.r || [])];
            newGrayData = [...(histData.gray || [])];
          }
        } catch (_) {}
      }

      const nextHistory = imageHistory.slice(0, historyIndex + 1);
      setImageHistory([
        ...nextHistory,
        {
          image: resultBase64
            ? `data:image/png;base64,${resultBase64}`
            : currentEntry.image,
          rawFile: currentEntry.rawFile,
          currentBase64: resultBase64 || currentEntry.currentBase64,
          rgbData: newRgbData,
          grayscaleData: newGrayData,
        }
      ]);
      setHistoryIndex(nextHistory.length);
      setCnnResultInfo(cnnResult);
    }

  } catch (err) {
    alert(`Error: ${err.message}`);
  }

  setIsLoading(false);
};

  // Helper pembaca indeks objek versi yang sedang aktif saat ini
  const currentEntry = imageHistory[historyIndex];
  const currentImage = currentEntry?.image;

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col relative font-sans select-none">
      {/* NAVBAR GLOBAL */}
      <Navbar />

      {/* BARIS KONTROL ATAS */}
      <div className="px-10 pt-4 pb-2 flex justify-between items-center z-20 border-b border-gray-950">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              isToolsOpen
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-[#101116] border-gray-800 text-gray-300 hover:border-gray-700"
            }`}
          >
            {isToolsOpen ? "✕ Tutup Fitur" : "☰ Fitur Alat"}
          </button>

          <button
            onClick={handleResetImage}
            disabled={!imageHistory[0]?.image || isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🔄 Reset Gambar
          </button>
        </div>

        {/* Maju-Mundur Versi */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#101116] border border-gray-800 rounded-xl p-1">
            <button
              onClick={() =>
                historyIndex > 0 && setHistoryIndex(historyIndex - 1)
              }
              disabled={historyIndex === 0 || isLoading}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${historyIndex === 0 ? "text-gray-700 cursor-not-allowed" : "text-purple-400 hover:bg-white/5"}`}
              title="Mundur Versi (Undo)"
            >
              ↩
            </button>
            <div className="w-px h-4 bg-gray-800 mx-1" />
            <button
              onClick={() =>
                historyIndex < imageHistory.length - 1 &&
                setHistoryIndex(historyIndex + 1)
              }
              disabled={historyIndex === imageHistory.length - 1 || isLoading}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${historyIndex === imageHistory.length - 1 ? "text-gray-700 cursor-not-allowed" : "text-purple-400 hover:bg-white/5"}`}
              title="Maju Versi (Redo)"
            >
              ↪
            </button>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-[#101116] px-4 py-2 rounded-xl border border-gray-800">
            Versi Dokumen: v{historyIndex}
          </span>
        </div>
      </div>

      {/* CONTAINER WORKSPACE & LAYOUT HISTOGRAM */}
      <div className="flex-grow overflow-y-auto px-10 py-6 space-y-12">
        {/* LACI PANEL SELEKSI ALGORITMA PCD */}
        <aside
          className={`fixed left-10 top-36 bottom-10 w-80 bg-[#101116] border border-gray-800 rounded-2xl p-5 z-30 flex flex-col shadow-2xl transition-all duration-300 ${isToolsOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"}`}
        >
          {/* Menu Kategori Atas (Anti-potong) */}
          <div className="flex space-x-1 overflow-x-auto w-full max-w-full pb-2 border-b border-gray-800 mb-4 whitespace-nowrap scrollbar-thin">
            {["color", "geometry", "filters", "edge", "advanced"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition-colors shrink-0 ${
                  activeCategory === cat
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ISI ISI SUB-MENU TOOLS PCD */}
          <div className="flex-grow overflow-y-auto space-y-3 text-sm scrollbar-thin">
            {/* TAB 1: COLOR */}
            {activeCategory === "color" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>Hue / Saturation</span>
                    <span>{hueSaturation}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={hueSaturation}
                    onChange={(e) => setHueSaturation(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="h-px bg-gray-800 my-2" />
                <button
                  onClick={() => applyEffect("Grayscale Conversion")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block disabled:opacity-40"
                >
                  ⚫ RGB → Grayscale
                </button>
                <button
                  onClick={() => applyEffect("Histogram Equalization")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block disabled:opacity-40"
                >
                  📊 Histogram Equalization
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyEffect("Split Channel Red")}
                    disabled={isLoading}
                    className="py-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-bold disabled:opacity-40"
                  >
                    Channel R
                  </button>
                  <button
                    onClick={() => applyEffect("Split Channel Green")}
                    disabled={isLoading}
                    className="py-2 rounded-lg bg-green-950/30 border border-green-900/40 text-green-400 text-xs font-bold disabled:opacity-40"
                  >
                    Channel G
                  </button>
                  <button
                    onClick={() => applyEffect("Split Channel Blue")}
                    disabled={isLoading}
                    className="py-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-blue-400 text-xs font-bold disabled:opacity-40"
                  >
                    Channel B
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: GEOMETRY */}
            {activeCategory === "geometry" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>Rotate Angle</span>
                    <span>{rotateAngle}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotateAngle}
                    onChange={(e) => setRotateAngle(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>Scaling (Resize)</span>
                    <span>{resizeScale}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={resizeScale}
                    onChange={(e) => setResizeScale(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="h-px bg-gray-800 my-2" />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyEffect("Flip Horizontal")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 text-xs font-medium block"
                  >
                    ↔️ Flip Horizontal
                  </button>
                  <button
                    onClick={() => applyEffect("Flip Vertical")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 text-xs font-medium block"
                  >
                    ↕️ Flip Vertical
                  </button>
                </div>
                <button
                  onClick={() => applyEffect("Affine Translation")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  ➡️ Translation (Geser Matriks)
                </button>
                <button
                  onClick={() => applyEffect("Crop Drag Selection")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-purple-900/50 text-purple-400 font-semibold block"
                >
                  ✂️ Crop Area Selection
                </button>
              </div>
            )}

            {/* TAB 3: FILTERS */}
            {activeCategory === "filters" && (
              <div className="space-y-2">
                <button
                  onClick={() => applyEffect("Sharpening Filter")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  🔺 Sharpening (Pertajam)
                </button>
                <button
                  onClick={() => applyEffect("Smoothing Blur")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  💧 Smoothing (Blur)
                </button>
                <button
                  onClick={() => applyEffect("Gaussian Blur")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  ☁️ Gaussian Blur Filter
                </button>
                <button
                  onClick={() => applyEffect("Median Filter")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  🛡️ Median Filter (De-Noise)
                </button>
                <button
                  onClick={() => applyEffect("Salt & Pepper Noise Removal")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  🧂 Noise Removal (Salt & Pepper)
                </button>
              </div>
            )}

            {/* TAB 4: EDGE */}
            {activeCategory === "edge" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>Binary Threshold</span>
                    <span>{thresholdValue}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <button
                  onClick={() => applyEffect("Binary Thresholding")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block"
                >
                  🏁 Thresholding (Citra Biner)
                </button>
                <div className="h-px bg-gray-800 my-1" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                  Edge Detection (Deteksi Tepi)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyEffect("Canny Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-purple-950/30 border border-purple-800 text-purple-400 text-xs font-bold col-span-2"
                  >
                    🧬 Canny Detector
                  </button>
                  <button
                    onClick={() => applyEffect("Sobel Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-black/40 border border-gray-800 text-xs"
                  >
                    📐 Sobel
                  </button>
                  <button
                    onClick={() => applyEffect("Prewitt Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-black/40 border border-gray-800 text-xs"
                  >
                    📊 Prewitt
                  </button>
                  <button
                    onClick={() => applyEffect("Robert Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-black/40 border border-gray-800 text-xs"
                  >
                    📉 Robert
                  </button>
                  <button
                    onClick={() => applyEffect("Laplacian Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-black/40 border border-gray-800 text-xs"
                  >
                    ⭕ Laplacian
                  </button>
                </div>
                <button
                  onClick={() => applyEffect("Laplacian of Gaussian (LoG)")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block text-xs"
                >
                  💿 Laplacian of Gaussian (LoG)
                </button>
                <div className="h-px bg-gray-800 my-1" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                  Morphology Operations
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyEffect("Erosion Operation")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-black/40 border border-gray-800 text-xs"
                  >
                    🕳️ Erosion (Erosi)
                  </button>
                  <button
                    onClick={() => applyEffect("Dilation Operation")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-black/40 border border-gray-800 text-xs"
                  >
                    🪵 Dilation (Dilatasi)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: ADVANCED */}
            {activeCategory === "advanced" && (
              <div className="space-y-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                  Image Segmentation
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold">
                  <button
                    onClick={() => applyEffect("Threshold-based Segmentation")}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-black/40 border border-gray-800"
                  >
                    Threshold
                  </button>
                  <button
                    onClick={() => applyEffect("Edge-based Segmentation")}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-black/40 border border-gray-800"
                  >
                    Edge-based
                  </button>
                  <button
                    onClick={() => applyEffect("Region-based Segmentation")}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-black/40 border border-gray-800"
                  >
                    Region
                  </button>
                </div>
                <div className="h-px bg-gray-800 my-1" />
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 flex justify-between">
                    <span>JPEG Quality Compression</span>
                    <span>{compressionQuality}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={compressionQuality}
                    onChange={(e) => setCompressionQuality(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-purple-500"
                  />
                </div>
                <button
                  onClick={() => applyEffect("JPEG Simulation Compression")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-black/30 border border-gray-800 hover:border-gray-700 block text-xs"
                >
                  💾 Simulation Compression (Huffman/LZW)
                </button>
                <div className="h-px bg-gray-800 my-1" />
                <button
                  onClick={() => applyEffect("CNN Object Recognition")}
                  disabled={isLoading}
                  className="w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/50 text-purple-300 text-xs font-extrabold block shadow-md shadow-purple-500/5 tracking-wider uppercase"
                >
                  🧠 Run CNN Object Recognition
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* BLOCK 1: WORKSPACE GRID GAMBAR (50-50 SEJAJAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 relative">
          {/* PANEL KIRI: GAMBAR ORIGINAL */}
          <div className="flex flex-col items-center space-y-4 w-full">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              GAMBAR ORI (BEFORE)
            </span>
            <div className="w-full aspect-video rounded-2xl border border-gray-800 bg-[#101116] flex flex-col items-center justify-center overflow-hidden relative group">
              {imageHistory[0]?.image ? (
                <>
                  <img
                    src={imageHistory[0].image}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setZoomedImage(imageHistory[0].image)}
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🔍 Perbesar
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-600">
                  Belum ada file gambar
                </span>
              )}
            </div>
            <label className="bg-[#16171d] border border-gray-800 hover:border-gray-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors block">
              + Upload{" "}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {/* COPAS POTONGAN KODE BARU INI TEPAT DI BAWAH LABEL UPLOAD */}
              {rawFile && (
                <span className="text-xs text-gray-500 font-mono tracking-wide animate-fade-in">
                  📄 {rawFile.name}
                </span>
              )}
            </label>
          </div>

          {/* PANEL KANAN: GAMBAR HASIL RUN FITUR */}
          <div className="flex flex-col items-center space-y-4 w-full relative">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              GAMBAR HASIL RUN FITUR (AFTER)
            </span>
            <div className="w-full aspect-video rounded-2xl border border-gray-800 bg-[#101116] flex flex-col items-center justify-center overflow-hidden relative group">
              {/* Overlay Tirai Loading Spinner saat FastAPI Sedang Aktif */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-purple-400 font-medium tracking-wider animate-pulse">
                    Memproses via OpenCV...
                  </span>
                </div>
              )}

              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt="Hasil Fitur"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setZoomedImage(currentImage)}
                    disabled={isLoading}
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
                  >
                    🔍 Perbesar
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-600">
                  Menunggu eksekusi aksi fitur...
                </span>
              )}
            </div>

            {/* Tampilan Teks Hasil Deteksi CNN */}
            <div className="min-h-[36px] flex items-center justify-center">
              {cnnResultInfo && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full animate-pulse">
                  {cnnResultInfo}
                </span>
              )}
            </div>

            <button
              disabled={!currentImage || isLoading}
              onClick={() => {
                if (!currentEntry?.currentBase64) return;
                const a = document.createElement('a');
                a.href = `data:image/png;base64,${currentEntry.currentBase64}`;
                a.download = 'hasil-edit.png';
                a.click();
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all bg-purple-600 border-purple-500 text-white hover:bg-purple-500 disabled:bg-gray-900 disabled:border-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed"
            >
              📥 Save Image
            </button>
          </div>
        </div>

        {/* BLOCK 2: SECTION 4 HISTOGRAM SIMETRIS (LEGA 2X LIPAT) */}
        <div className="border-t border-gray-950 pt-8 z-10 relative">
          <div className="text-center mb-8">
            <h2 className="text-base font-bold tracking-tight text-white">
              📊 Analisis Distribusi Intensitas Piksel (Histogram)
            </h2>
            <p className="text-xs text-gray-500">
              Perbandingan persebaran nilai matriks warna Before vs After secara
              real-time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KOLOM KIRI: HISTOGRAM ORIGINAL (BEFORE) */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block text-center">
                Data Analisis Gambar Ori
              </span>

              <div className="p-5 rounded-2xl border border-gray-900 bg-[#101116] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-gray-400 font-semibold">
                  Original RGB Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-gray-900 my-2">
                  <HistogramChart data={imageHistory[0]} type="rgb" />
                </div>
                <div className="text-[9px] text-gray-600 font-mono flex justify-between">
                  <span>v0 - Source Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-gray-900 bg-[#101116] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-gray-400 font-semibold">
                  Original Grayscale Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-gray-900 my-2">
                    <HistogramChart data={imageHistory[0]} type="gray" />
                </div>
                <div className="text-[9px] text-gray-600 font-mono flex justify-between">
                  <span>v0 - Grayscale Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: HISTOGRAM PROCESSED (AFTER) */}
            <div className="space-y-4 relative">
              {/* Blur Pelindung Latar Belakang Histogram saat Loading */}
              {isLoading && (
                <div className="absolute inset-x-0 top-6 bottom-0 bg-[#08060d]/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center rounded-2xl border border-purple-500/10">
                  <span className="text-xs text-purple-400/80 font-medium animate-pulse">
                    Menghitung ulang sebaran piksel...
                  </span>
                </div>
              )}

              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block text-center">
                Data Analisis Hasil Fitur
              </span>

              <div className="p-5 rounded-2xl border border-gray-900 bg-[#101116] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-purple-400 font-semibold">
                  Processed RGB Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-gray-900 my-2">
                    <HistogramChart data={currentEntry} type="rgb" />
                </div>
                <div className="text-[9px] text-purple-600 font-mono flex justify-between">
                  <span>v{historyIndex} - Output Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-gray-900 bg-[#101116] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-purple-400 font-semibold">
                  Processed Grayscale Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-gray-900 my-2">
                  <HistogramChart data={currentEntry} type="gray" />
                </div>
                <div className="text-[9px] text-purple-600 font-mono flex justify-between">
                  <span>v{historyIndex} - Grayscale Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX ZOOM MODAL */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm"
          >
            Close ✕
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed View"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
