// src/pages/Editor.jsx
import * as api from '../api/imageApi';
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import HistogramChart from '../components/HistogramPanel';

function createHistogramEntry(overrides = {}) {
  return {
    image: null,
    rawFile: null,
    currentBlob: null,
    r: [],
    g: [],
    b: [],
    gray: [],
    ...overrides,
  };
}

const getNaturalDimensions = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve({ w: 800, h: 600 });
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth || 800, h: img.naturalHeight || 600 });
    };
    img.onerror = () => {
      resolve({ w: 800, h: 600 });
    };
    img.src = src;
  });
};

const Editor = () => {
  // --- STATE MANAGEMENT ---
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("color");
  const [rawFile, setRawFile] = useState(null);

  // State Loading untuk Mengaktifkan Spinner Overlay (Task #3)
  const [isLoading, setIsLoading] = useState(false);

  // Struktur Objek Riwayat Versi Baru untuk Sinkronisasi Histogram (Task #4)
  const [imageHistory, setImageHistory] = useState([createHistogramEntry()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const currentEntry = imageHistory[historyIndex];
  const currentImage = currentEntry?.image;

  // Reference to track imageHistory for unmount cleanup
  const historyRef = useRef(imageHistory);
  useEffect(() => {
    historyRef.current = imageHistory;
  }, [imageHistory]);

  useEffect(() => {
    return () => {
      // Revoke all remaining blob URLs to free memory
      if (historyRef.current) {
        historyRef.current.forEach(entry => {
          if (entry.image && entry.image.startsWith("blob:")) {
            URL.revokeObjectURL(entry.image);
          }
        });
      }
    };
  }, []);

  // --- STATE PARAMETER TOOLS PCD (Sesuai Spesifikasi Dokumen) ---
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [hueValue, setHueValue] = useState(100);
  const [satValue, setSatValue] = useState(100);
  const [rotateAngle, setRotateAngle] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [resizeScale, setResizeScale] = useState(100);
  const [thresholdValue, setThresholdValue] = useState(128);
  const [compressionQuality, setCompressionQuality] = useState(80);

  // State Output Teks Tambahan untuk Fitur CNN (Decision #4)
  const [cnnResultInfo, setCnnResultInfo] = useState("");

  // --- STATE KUSTOM UNTUK SAVE, CROP, INTERPOLASI & SIMULASI ---
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFilename, setSaveFilename] = useState("hasil-edit");
  const [saveFormat, setSaveFormat] = useState("png");

  const [isCropActive, setIsCropActive] = useState(false);
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);

  const [resizeInterpolation, setResizeInterpolation] = useState("bilinear");

  const [compressionData, setCompressionData] = useState(null);
  const [isSimulatingCompression, setIsSimulatingCompression] = useState(false);

  // PCD Checklist additional states
  const [gamma, setGamma] = useState(1.0);
  const [targetDist, setTargetDist] = useState("normal");
  const [meanKernelSize, setMeanKernelSize] = useState(5);
  const [morphologyOperation, setMorphologyOperation] = useState("erode");
  const [morphologyKernelSize, setMorphologyKernelSize] = useState(5);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [hoverPixel, setHoverPixel] = useState(null);
  const hoverCanvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ before: null, after: null });

  // Update dimensions when image changes
  useEffect(() => {
    const beforeImg = imageHistory[0]?.image;
    const afterImg = imageHistory[historyIndex]?.image;
    
    if (beforeImg) {
      getNaturalDimensions(beforeImg).then(dims => {
        setDimensions(prev => ({ ...prev, before: dims }));
      });
    } else {
      setDimensions(prev => ({ ...prev, before: null }));
    }
    
    if (afterImg) {
      getNaturalDimensions(afterImg).then(dims => {
        setDimensions(prev => ({ ...prev, after: dims }));
      });
    } else {
      setDimensions(prev => ({ ...prev, after: null }));
    }
  }, [imageHistory, historyIndex]);

  // Update hover canvas cache when after image changes
  useEffect(() => {
    if (!currentImage) {
      setHoverPixel(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = hoverCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
    };
    img.src = currentImage;
  }, [currentImage]);

  const handleMouseMove = (e) => {
    const imgEl = e.currentTarget.querySelector('img');
    if (!imgEl || !hoverCanvasRef.current) return;
    
    const rect = imgEl.getBoundingClientRect();
    
    // Mouse relative to image element bounds
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      setHoverPixel(null);
      return;
    }
    
    // Map to natural dimension scale
    const scaleX = hoverCanvasRef.current.width / rect.width;
    const scaleY = hoverCanvasRef.current.height / rect.height;
    
    const pixelX = Math.round(mouseX * scaleX);
    const pixelY = Math.round(mouseY * scaleY);
    
    const x = Math.min(Math.max(0, pixelX), hoverCanvasRef.current.width - 1);
    const y = Math.min(Math.max(0, pixelY), hoverCanvasRef.current.height - 1);
    
    try {
      const ctx = hoverCanvasRef.current.getContext('2d');
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      setHoverPixel({
        x,
        y,
        r: pixelData[0],
        g: pixelData[1],
        b: pixelData[2]
      });
    } catch (err) {
      console.error("Failed to read pixel hover color:", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") === "true") {
      fetch("/test_image.png")
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "test_image.png", { type: "image/png" });
          setRawFile(file);
          const imageUrl = URL.createObjectURL(file);
          api.getHistogram(file).then((histData) => {
            setImageHistory([
              createHistogramEntry({
                image: imageUrl,
                rawFile: file,
                currentBlob: null,
                r: histData?.r ?? [],
                g: histData?.g ?? [],
                b: histData?.b ?? [],
                gray: histData?.gray ?? [],
              }),
            ]);
          }).catch(() => {
            setImageHistory([
              createHistogramEntry({
                image: imageUrl,
                rawFile: file,
                currentBlob: null,
              }),
            ]);
          });
          setHistoryIndex(0);
          setCnnResultInfo("");
        });
    }
  }, []);

  // --- HANDLERS ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // FIX: tambahkan [0]
    if (file) {
      // Revoke all previous blob URLs to prevent memory leaks
      imageHistory.forEach(entry => {
        if (entry.image && entry.image.startsWith("blob:")) {
          URL.revokeObjectURL(entry.image);
        }
      });

      setRawFile(file);
      const imageUrl = URL.createObjectURL(file);

      // Ambil histogram asli dari backend
      api.getHistogram(file).then(histData => {
        setImageHistory([createHistogramEntry({
          image: imageUrl,
          rawFile: file,          // simpan file asli
          currentBlob: null,    // belum ada hasil proses
          r: histData?.r ?? [],
          g: histData?.g ?? [],
          b: histData?.b ?? [],
          gray: histData?.gray ?? [],
        })]);
      }).catch(() => {
        setImageHistory([createHistogramEntry({
          image: imageUrl,
          rawFile: file,
          currentBlob: null,
        })]);
      });

      setHistoryIndex(0);
      setCnnResultInfo("");
    }
  };

  const handleResetImage = () => {
    if (imageHistory[0]?.image) {
      // Revoke all versions from index 1 onwards to prevent memory leaks
      imageHistory.slice(1).forEach(entry => {
        if (entry.image && entry.image.startsWith("blob:")) {
          URL.revokeObjectURL(entry.image);
        }
      });

      setImageHistory([imageHistory[0]]);
      setHistoryIndex(0);
      setCnnResultInfo("");
      setBrightness(100);
      setContrast(100);
      setHueValue(100);
      setSatValue(100);
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
    const source = currentEntry.currentBlob 
      ? currentEntry.currentBlob  // blob hasil sebelumnya
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
      case "Invert Conversion":
        resultBase64 = await api.applyInvert(source);
        break;
      case "Sepia Conversion":
        resultBase64 = await api.applySepia(source);
        break;
      case "Gamma Correction":
        resultBase64 = await api.applyGamma(source, gamma);
        break;
      case "Histogram Stretching":
        resultBase64 = await api.applyHistogramStretch(source);
        break;
      case "Histogram Specification":
        resultBase64 = await api.applyHistogramSpecify(source, targetDist);
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
        resultBase64 = await api.applyHueSaturation(source, hueValue - 100, satValue - 100);
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
        const dimsForResize = await getNaturalDimensions(currentImage);
        resultBase64 = await api.applyResize(source,
          Math.round(dimsForResize.w * resizeScale / 100),
          Math.round(dimsForResize.h * resizeScale / 100),
          resizeInterpolation);
        break;
      case "Crop Drag Selection":
        const dimsForCrop = await getNaturalDimensions(currentImage);
        const actualX = Math.round((cropX / 100) * dimsForCrop.w);
        const actualY = Math.round((cropY / 100) * dimsForCrop.h);
        const actualW = Math.round((cropW / 100) * dimsForCrop.w);
        const actualH = Math.round((cropH / 100) * dimsForCrop.h);
        resultBase64 = await api.applyCrop(source, actualX, actualY, actualW, actualH);
        setIsCropActive(false);
        break;
      case "Affine Translation":
        resultBase64 = await api.applyTranslate(source, translateX, translateY);
        break;

      // Filter
      case "Gaussian Blur":
        resultBase64 = await api.applyGaussianBlur(source, 5);
        break;
      case "Mean Blur Filter":
        resultBase64 = await api.applyMeanBlur(source, meanKernelSize);
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
      case "Morphology Custom Operation":
        resultBase64 = await api.applyMorphology(source, morphologyOperation, morphologyKernelSize);
        break;
      case "Skeletonization Operation":
        resultBase64 = await api.applySkeleton(source);
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
        try {
          setIsSimulatingCompression(true);
          const simResult = await api.simulateCompression(source);
          setCompressionData(simResult);
        } catch (simErr) {
          console.error("Simulation error:", simErr);
        } finally {
          setIsSimulatingCompression(false);
        }
        break;

      // CNN
      case "CNN Object Recognition":
        const predictions = await api.runCNNRecognition(source);
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
      let nextHistogram = {};
      let blob = null;
      let imageUrl = null;

      if (resultBase64) {
        try {
          // Konversi base64 ke blob untuk getHistogram
          const byteCharacters = atob(resultBase64);
          const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: 'image/png' });
          imageUrl = URL.createObjectURL(blob);
          const histData = await api.getHistogram(blob);
          if (histData) {
            nextHistogram = {
              r: histData.r ?? [],
              g: histData.g ?? [],
              b: histData.b ?? [],
              gray: histData.gray ?? [],
            };
          }
        } catch (_) {}
      }

      const nextHistory = imageHistory.slice(0, historyIndex + 1);
      // Revoke any discarded future versions of history (due to new edit on top of undo)
      const discardedHistory = imageHistory.slice(historyIndex + 1);
      discardedHistory.forEach(entry => {
        if (entry.image && entry.image.startsWith("blob:")) {
          URL.revokeObjectURL(entry.image);
        }
      });

      setImageHistory([
        ...nextHistory,
        createHistogramEntry({
          image: imageUrl || currentEntry.image,
          rawFile: currentEntry.rawFile,
          currentBlob: blob || currentEntry.currentBlob,
          ...nextHistogram,
        })
      ]);
      setHistoryIndex(nextHistory.length);
      setCnnResultInfo(cnnResult);
      
      // Reset sliders to default to prevent compounding edits on subsequent applies
      setBrightness(100);
      setContrast(100);
      setHueValue(100);
      setSatValue(100);
      setRotateAngle(0);
      setTranslateX(0);
      setTranslateY(0);
      setResizeScale(100);
      setThresholdValue(128);
    }

  } catch (err) {
    alert(`Error: ${err.message}`);
  }

  setIsLoading(false);
};

  // Indeks objek versi yang sedang aktif saat ini digunakan di bawah ini

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col relative font-sans select-none transition-colors duration-300">
      {/* NAVBAR GLOBAL */}
      <Navbar />

      {/* BARIS KONTROL ATAS */}
      <div className="px-10 pt-4 pb-2 flex justify-between items-center relative z-20 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              isToolsOpen
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
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
          <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-1">
            <button
              onClick={() =>
                historyIndex > 0 && setHistoryIndex(historyIndex - 1)
              }
              disabled={historyIndex === 0 || isLoading}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${historyIndex === 0 ? "text-gray-700 cursor-not-allowed" : "text-[var(--accent)] hover:bg-[var(--text-primary)]/5"}`}
              title="Mundur Versi (Undo)"
            >
              ↩
            </button>
            <div className="w-px h-4 bg-[var(--border-primary)] mx-1" />
            <button
              onClick={() =>
                historyIndex < imageHistory.length - 1 &&
                setHistoryIndex(historyIndex + 1)
              }
              disabled={historyIndex === imageHistory.length - 1 || isLoading}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${historyIndex === imageHistory.length - 1 ? "text-gray-700 cursor-not-allowed" : "text-[var(--accent)] hover:bg-[var(--text-primary)]/5"}`}
              title="Maju Versi (Redo)"
            >
              ↪
            </button>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-primary)]">
            Versi Dokumen: v{historyIndex}
          </span>
        </div>
      </div>

      {/* CONTAINER WORKSPACE & LAYOUT HISTOGRAM */}
      <div className="flex-grow overflow-y-auto px-10 py-6 space-y-12">
        {/* LACI PANEL SELEKSI ALGORITMA PCD */}
        <aside
          className={`fixed left-10 top-36 bottom-10 w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 z-30 flex flex-col shadow-2xl transition-all duration-300 ${isToolsOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"}`}
        >
          {/* Menu Kategori Atas (Anti-potong) */}
          <div className="flex space-x-1 overflow-x-auto w-full max-w-full pb-4 border-b border-[var(--border-primary)] mb-4 whitespace-nowrap category-scrollbar">
            {["color", "geometry", "filters", "edge", "advanced"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition-colors shrink-0 ${
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ISI ISI SUB-MENU TOOLS PCD */}
          <div className="flex-grow overflow-y-auto pr-3 space-y-6 text-sm sidebar-scrollbar">
            {/* TAB 1: COLOR */}
            {activeCategory === "color" && (
              <div className="space-y-5">
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
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
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
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
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <button
                  onClick={() => applyEffect("Brightness & Contrast")}
                  disabled={isLoading || !imageHistory[0]?.image}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm mb-4"
                >
                  ✨ Apply Brightness & Contrast
                </button>
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
                    <span>Hue (Warna)</span>
                    <span>{hueValue}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={hueValue}
                    onChange={(e) => setHueValue(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
                    <span>Saturation (Kepekatan)</span>
                    <span>{satValue}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={satValue}
                    onChange={(e) => setSatValue(e.target.value)}
                    disabled={isLoading}
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <button
                  onClick={() => applyEffect("Hue & Saturation")}
                  disabled={isLoading || !imageHistory[0]?.image}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm mb-4"
                >
                  🎨 Apply Hue & Saturation
                </button>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <button
                  onClick={() => applyEffect("Grayscale Conversion")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block disabled:opacity-40 cursor-pointer transition-colors mb-2"
                >
                  ⚫ RGB → Grayscale
                </button>
                <button
                  onClick={() => applyEffect("Histogram Equalization")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block disabled:opacity-40 cursor-pointer transition-colors mb-4"
                >
                  📊 Histogram Equalization
                </button>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => applyEffect("Invert Conversion")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block disabled:opacity-40 cursor-pointer text-center transition-colors"
                  >
                    🌓 Invert (Negatif)
                  </button>
                  <button
                    onClick={() => applyEffect("Sepia Conversion")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block disabled:opacity-40 cursor-pointer text-center transition-colors"
                  >
                    🟤 Sepia Tone
                  </button>
                </div>
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
                    <span>Gamma Correction</span>
                    <span>{gamma}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={gamma}
                    onChange={(e) => setGamma(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full accent-[var(--accent)]"
                  />
                  <button
                    onClick={() => applyEffect("Gamma Correction")}
                    disabled={isLoading || !imageHistory[0]?.image}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    🔆 Apply Gamma Correction
                  </button>
                </div>
                <button
                  onClick={() => applyEffect("Histogram Stretching")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block disabled:opacity-40 cursor-pointer transition-colors mb-4"
                >
                  📈 Histogram Stretching (Contrast Stretch)
                </button>
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Histogram Specification (Matching)
                  </label>
                  <select
                    value={targetDist}
                    onChange={(e) => setTargetDist(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-lg p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] mb-2"
                  >
                    <option value="normal">Gaussian (Normal Curve)</option>
                    <option value="uniform">Uniform (Flat)</option>
                    <option value="dark">Dark-skewed (Low key)</option>
                    <option value="bright">Bright-skewed (High key)</option>
                  </select>
                  <button
                    onClick={() => applyEffect("Histogram Specification")}
                    disabled={isLoading || !imageHistory[0]?.image}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    📊 Apply Histogram Matching
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyEffect("Split Channel Red")}
                    disabled={isLoading}
                    className="py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-red-500/20 transition-colors"
                  >
                    Channel R
                  </button>
                  <button
                    onClick={() => applyEffect("Split Channel Green")}
                    disabled={isLoading}
                    className="py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-green-500/20 transition-colors"
                  >
                    Channel G
                  </button>
                  <button
                    onClick={() => applyEffect("Split Channel Blue")}
                    disabled={isLoading}
                    className="py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-blue-500/20 transition-colors"
                  >
                    Channel B
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: GEOMETRY */}
            {activeCategory === "geometry" && (
              <div className="space-y-5">
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
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
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <button
                  onClick={() => applyEffect("Rotate")}
                  disabled={isLoading || !imageHistory[0]?.image}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm mb-4"
                >
                  🔄 Apply Rotate
                </button>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
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
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Interpolation Method
                  </label>
                  <select
                    value={resizeInterpolation}
                    onChange={(e) => setResizeInterpolation(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-lg p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="bilinear">Bilinear (Smooth)</option>
                    <option value="nearest">Nearest Neighbor (Sharp)</option>
                  </select>
                </div>
                <button
                  onClick={() => applyEffect("Scaling (Resize)")}
                  disabled={isLoading || !imageHistory[0]?.image}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm mb-4"
                >
                  📐 Apply Resize
                </button>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => applyEffect("Flip Horizontal")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors text-center"
                  >
                    ↔️ Flip Horizontal
                  </button>
                  <button
                    onClick={() => applyEffect("Flip Vertical")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors text-center"
                  >
                    ↕️ Flip Vertical
                  </button>
                </div>
                <div className="space-y-4 p-4 bg-[var(--text-primary)]/3 border border-[var(--border-primary)] rounded-xl mb-4">
                  <span className="text-xs text-[var(--text-secondary)] font-bold block mb-1">
                    ➡️ Translation (Geser Gambar)
                  </span>
                  <div className="space-y-2 mb-3">
                    <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                      <span>Geser Horisontal (X)</span>
                      <span>{translateX} px</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={translateX}
                      onChange={(e) => setTranslateX(Number(e.target.value))}
                      disabled={isLoading}
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>
                  <div className="space-y-2 mb-4">
                    <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                      <span>Geser Vertikal (Y)</span>
                      <span>{translateY} px</span>
                    </label>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={translateY}
                      onChange={(e) => setTranslateY(Number(e.target.value))}
                      disabled={isLoading}
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>
                  <button
                    onClick={() => applyEffect("Affine Translation")}
                    disabled={isLoading || !imageHistory[0]?.image}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    Apply Translation
                  </button>
                </div>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                {!isCropActive ? (
                  <button
                    onClick={() => setIsCropActive(true)}
                    disabled={isLoading || !imageHistory[0]?.image}
                    className="w-full text-center p-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-bold text-xs block transition-all cursor-pointer shadow-sm"
                  >
                    ✂️ Crop Area Selection
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-inner mb-4">
                    <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider block mb-1">
                      Visual Crop Controls
                    </span>
                    <div className="space-y-2 mb-3">
                      <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                        <span>X Offset</span>
                        <span>{cropX}%</span>
                      </label>
                      <input
                        type="range" min="0" max="90" value={cropX}
                        onChange={(e) => setCropX(Number(e.target.value))}
                        className="w-full accent-[var(--accent)] py-1"
                      />
                    </div>
                    <div className="space-y-2 mb-3">
                      <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                        <span>Y Offset</span>
                        <span>{cropY}%</span>
                      </label>
                      <input
                        type="range" min="0" max="90" value={cropY}
                        onChange={(e) => setCropY(Number(e.target.value))}
                        className="w-full accent-[var(--accent)] py-1"
                      />
                    </div>
                    <div className="space-y-2 mb-3">
                      <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                        <span>Width</span>
                        <span>{cropW}%</span>
                      </label>
                      <input
                        type="range" min="10" max="100" value={cropW}
                        onChange={(e) => setCropW(Number(e.target.value))}
                        className="w-full accent-[var(--accent)] py-1"
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                        <span>Height</span>
                        <span>{cropH}%</span>
                      </label>
                      <input
                        type="range" min="10" max="100" value={cropH}
                        onChange={(e) => setCropH(Number(e.target.value))}
                        className="w-full accent-[var(--accent)] py-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => applyEffect("Crop Drag Selection")}
                        className="py-2 px-3 rounded-lg bg-[var(--accent)] text-white font-bold text-xs hover:bg-[var(--accent)]/95 transition-all cursor-pointer shadow-sm"
                      >
                        ✅ Crop
                      </button>
                      <button
                        onClick={() => setIsCropActive(false)}
                        className="py-2 px-3 rounded-lg bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] font-bold text-xs transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FILTERS */}
            {activeCategory === "filters" && (
              <div className="space-y-4">
                <button
                  onClick={() => applyEffect("Sharpening Filter")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors"
                >
                  🔺 Sharpening (Pertajam)
                </button>
                <button
                  onClick={() => applyEffect("Smoothing Blur")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors"
                >
                  💧 Smoothing (Blur)
                </button>
                <div className="space-y-2.5 p-3 rounded-xl bg-[var(--text-primary)]/3 border border-[var(--border-primary)]/40">
                  <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                    <span>Mean / Average Blur</span>
                    <span>Kernel: {meanKernelSize}x{meanKernelSize}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="2"
                    value={meanKernelSize}
                    onChange={(e) => setMeanKernelSize(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full accent-[var(--accent)]"
                  />
                  <button
                    onClick={() => applyEffect("Mean Blur Filter")}
                    disabled={isLoading || !imageHistory[0]?.image}
                    className="w-full py-2 px-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm mt-1"
                  >
                    Apply Mean Blur
                  </button>
                </div>
                <button
                  onClick={() => applyEffect("Gaussian Blur")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors"
                >
                  ☁️ Gaussian Blur Filter
                </button>
                <button
                  onClick={() => applyEffect("Median Filter")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors"
                >
                  🛡️ Median Filter (De-Noise)
                </button>
                <button
                  onClick={() => applyEffect("Salt & Pepper Noise Removal")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-xs font-semibold block cursor-pointer transition-colors"
                >
                  🧂 Noise Removal (Salt & Pepper)
                </button>
              </div>
            )}

            {/* TAB 4: EDGE */}
            {activeCategory === "edge" && (
              <div className="space-y-4">
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
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
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <button
                  onClick={() => applyEffect("Binary Thresholding")}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold block cursor-pointer transition-all shadow-sm mb-4"
                >
                  🏁 Thresholding (Citra Biner)
                </button>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold mb-1">
                  Edge Detection (Deteksi Tepi)
                </span>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => applyEffect("Canny Edge")}
                    disabled={isLoading}
                    className="p-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold col-span-2 cursor-pointer shadow-sm"
                  >
                    🧬 Canny Detector
                  </button>
                  <button
                    onClick={() => applyEffect("Sobel Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--border-primary)] text-xs hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors"
                  >
                    📐 Sobel
                  </button>
                  <button
                    onClick={() => applyEffect("Prewitt Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--border-primary)] text-xs hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors"
                  >
                    📊 Prewitt
                  </button>
                  <button
                    onClick={() => applyEffect("Robert Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--border-primary)] text-xs hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors"
                  >
                    📉 Robert
                  </button>
                  <button
                    onClick={() => applyEffect("Laplacian Edge")}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--border-primary)] text-xs hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors"
                  >
                    ⭕ Laplacian
                  </button>
                </div>
                <button
                  onClick={() => applyEffect("Laplacian of Gaussian (LoG)")}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 block text-xs cursor-pointer text-[var(--text-primary)] transition-colors mb-4"
                >
                  💿 Laplacian of Gaussian (LoG)
                </button>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold mb-1">
                  Morphology Operations
                </span>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => applyEffect("Erosion Operation")}
                    disabled={isLoading}
                    className="p-2.5 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--border-primary)] text-xs hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors"
                  >
                    🕳️ Erosion (Erosi)
                  </button>
                  <button
                    onClick={() => applyEffect("Dilation Operation")}
                    disabled={isLoading}
                    className="p-2.5 rounded-lg bg-[var(--text-primary)]/5 border border-[var(--border-primary)] text-xs hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors"
                  >
                    🪵 Dilation (Dilatasi)
                  </button>
                </div>
                
                <div className="space-y-3 p-3.5 rounded-xl bg-[var(--text-primary)]/3 border border-[var(--border-primary)]/40 mt-2 mb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-[var(--text-secondary)] block">
                      Custom Morphology
                    </label>
                    <select
                      value={morphologyOperation}
                      onChange={(e) => setMorphologyOperation(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-lg p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="erode">Erosion (Erosi)</option>
                      <option value="dilate">Dilation (Dilatasi)</option>
                      <option value="open">Opening (Erosi ➔ Dilasi)</option>
                      <option value="close">Closing (Dilasi ➔ Erosi)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-[var(--text-secondary)] flex justify-between">
                      <span>Kernel Size</span>
                      <span>{morphologyKernelSize}x{morphologyKernelSize}</span>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="2"
                      value={morphologyKernelSize}
                      onChange={(e) => setMorphologyKernelSize(Number(e.target.value))}
                      disabled={isLoading}
                      className="w-full accent-[var(--accent)]"
                    />
                  </div>
                  <button
                    onClick={() => applyEffect("Morphology Custom Operation")}
                    disabled={isLoading || !imageHistory[0]?.image}
                    className="w-full py-2 px-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    Apply Morphology
                  </button>
                </div>

                <button
                  onClick={() => applyEffect("Skeletonization Operation")}
                  disabled={isLoading || !imageHistory[0]?.image}
                  className="w-full text-center py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs block transition-all shadow-sm"
                >
                  💀 Apply Skeletonization (Thinning)
                </button>
              </div>
            )}

            {/* TAB 5: ADVANCED */}
            {activeCategory === "advanced" && (
              <div className="space-y-4">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold mb-1">
                  Image Segmentation
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold mb-4">
                  <button
                    onClick={() => applyEffect("Threshold-based Segmentation")}
                    disabled={isLoading}
                    className="p-2.5 rounded bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors text-center"
                  >
                    Threshold
                  </button>
                  <button
                    onClick={() => applyEffect("Edge-based Segmentation")}
                    disabled={isLoading}
                    className="p-2.5 rounded bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors text-center"
                  >
                    Edge-based
                  </button>
                  <button
                    onClick={() => applyEffect("Region-based Segmentation")}
                    disabled={isLoading}
                    className="p-2.5 rounded bg-[var(--text-primary)]/5 border border-[var(--border-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer text-[var(--text-primary)] transition-colors text-center"
                  >
                    Region
                  </button>
                </div>
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <div className="space-y-2.5 mb-4">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex justify-between">
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
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <button
                  onClick={() => applyEffect("JPEG Simulation Compression")}
                  disabled={isLoading}
                  className="w-full text-center p-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm mb-4"
                >
                  💾 Run Compression Simulation
                </button>

                {isSimulatingCompression && (
                  <div className="text-[10px] text-[var(--accent)] animate-pulse text-center py-2 font-semibold">
                    Running multi-algorithm simulation...
                  </div>
                )}

                {compressionData && !isSimulatingCompression && (
                  <div className="bg-[var(--text-primary)]/3 border border-[var(--border-primary)] rounded-xl p-3.5 space-y-2 select-text mb-4">
                    <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block mb-1">
                      Simulation Results
                    </span>
                    <table className="w-full text-[10px] text-left text-[var(--text-primary)] font-mono">
                      <thead>
                        <tr className="border-b border-[var(--border-primary)] text-[var(--text-secondary)]">
                          <th className="py-1 font-bold">Method</th>
                          <th className="py-1 text-right font-bold">Size</th>
                          <th className="py-1 text-right font-bold">Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[var(--border-primary)]/40">
                          <td className="py-1 text-[var(--text-secondary)]">Original</td>
                          <td className="py-1 text-right">{compressionData.original_size_kb} KB</td>
                          <td className="py-1 text-right">0%</td>
                        </tr>
                        <tr className="border-b border-[var(--border-primary)]/40">
                          <td className="py-1 text-emerald-500 font-bold">Huffman</td>
                          <td className="py-1 text-right">{compressionData.huffman_size_kb} KB</td>
                          <td className="py-1 text-right text-emerald-500 font-bold">{compressionData.huffman_savings_pct}%</td>
                        </tr>
                        <tr className="border-b border-[var(--border-primary)]/40">
                          <td className="py-1 text-blue-500 font-bold">RLE</td>
                          <td className="py-1 text-right">{compressionData.rle_size_kb} KB</td>
                          <td className="py-1 text-right text-blue-500 font-bold">{compressionData.rle_savings_pct}%</td>
                        </tr>
                        <tr className="border-b border-[var(--border-primary)]/40">
                          <td className="py-1 text-purple-500 font-bold">LZW</td>
                          <td className="py-1 text-right">{compressionData.lzw_size_kb} KB</td>
                          <td className="py-1 text-right text-purple-500 font-bold">{compressionData.lzw_savings_pct}%</td>
                        </tr>
                        <tr className="border-b border-[var(--border-primary)]/40">
                          <td className="py-1 text-pink-500 font-bold">Arithmetic</td>
                          <td className="py-1 text-right">{compressionData.arithmetic_size_kb} KB</td>
                          <td className="py-1 text-right text-pink-500 font-bold">{compressionData.arithmetic_savings_pct}%</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-orange-500 font-bold">Quantization</td>
                          <td className="py-1 text-right">{compressionData.quantization_size_kb} KB</td>
                          <td className="py-1 text-right text-orange-500 font-bold">{compressionData.quantization_savings_pct}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="h-px bg-[var(--border-primary)] my-3" />
                <button
                  onClick={() => applyEffect("CNN Object Recognition")}
                  disabled={isLoading}
                  className="w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/85 text-white text-xs font-extrabold block shadow-md hover:from-[var(--accent)]/95 hover:to-[var(--accent)]/80 hover:opacity-95 transition-all tracking-wider uppercase cursor-pointer"
                >
                  🧠 Run CNN Object Recognition
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* hidden canvas for pixel color hover analysis */}
        <canvas ref={hoverCanvasRef} className="hidden" />

        {/* Zoom Controls Row */}
        <div className="flex justify-end items-center space-x-3 mb-4 z-10 relative">
          <span className="text-[11px] text-[var(--text-secondary)] font-semibold">Canvas Zoom:</span>
          <button
            onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.1))}
            className="p-1.5 px-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)]/5 text-[10px] text-[var(--text-primary)] font-bold cursor-pointer transition-colors"
          >
            ➖
          </button>
          <span className="text-[11px] text-[var(--text-primary)] font-mono font-bold w-12 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale(prev => Math.min(3.0, prev + 0.1))}
            className="p-1.5 px-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)]/5 text-[10px] text-[var(--text-primary)] font-bold cursor-pointer transition-colors"
          >
            ➕
          </button>
          <button
            onClick={() => setZoomScale(1.0)}
            className="p-1.5 px-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)]/5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer transition-colors"
          >
            Reset Zoom
          </button>
        </div>

        {/* BLOCK 1: WORKSPACE GRID GAMBAR (50-50 SEJAJAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 relative">
          {/* PANEL KIRI: GAMBAR ORIGINAL */}
          <div className="flex flex-col items-center space-y-3 w-full">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              GAMBAR ORI (BEFORE)
            </span>
            <div className="w-full aspect-video rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center overflow-hidden relative group">
              {imageHistory[0]?.image ? (
                <>
                  <img
                    src={imageHistory[0].image}
                    alt="Original"
                    className="w-full h-full object-contain transition-transform duration-150"
                    style={{ transform: `scale(${zoomScale})` }}
                  />
                  <button
                    onClick={() => setZoomedImage(imageHistory[0].image)}
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    🔍 Perbesar
                  </button>
                </>
              ) : (
                <span className="text-sm text-[var(--text-secondary)] font-medium">
                  Belum ada file gambar
                </span>
              )}
            </div>
            
            {/* Display Before Dimension */}
            <div className="min-h-[16px]">
              {dimensions.before && (
                <span className="text-[10px] text-[var(--text-secondary)] font-mono tracking-wider">
                  Dimensions: {dimensions.before.w} × {dimensions.before.h} px
                </span>
              )}
            </div>

            <label className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors block">
              + Upload{" "}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {rawFile && (
                <span className="text-xs text-[var(--text-secondary)] font-mono tracking-wide animate-fade-in block text-center mt-1">
                  📄 {rawFile.name}
                </span>
              )}
            </label>
          </div>

          {/* PANEL KANAN: GAMBAR HASIL RUN FITUR */}
          <div className="flex flex-col items-center space-y-3 w-full relative">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              GAMBAR HASIL RUN FITUR (AFTER)
            </span>
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverPixel(null)}
              className="w-full aspect-video rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center overflow-hidden relative group"
            >
              {/* Overlay Tirai Loading Spinner saat FastAPI Sedang Aktif */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-[var(--accent)] font-medium tracking-wider animate-pulse">
                    Memproses via OpenCV...
                  </span>
                </div>
              )}

              {/* Box Overlay Crop Visual */}
              {isCropActive && currentImage && (
                <div
                  className="absolute border-2 border-dashed border-[var(--accent)] bg-[var(--accent)]/20 z-10 pointer-events-none transition-all duration-100 animate-pulse"
                  style={{
                    left: `${cropX}%`,
                    top: `${cropY}%`,
                    width: `${cropW}%`,
                    height: `${cropH}%`,
                  }}
                >
                  <div className="absolute top-1 left-2 bg-[var(--accent)] text-white text-[9px] font-bold px-1 py-0.5 rounded shadow">
                    Crop Area Selection ({cropW}% x {cropH}%)
                  </div>
                </div>
              )}

              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt="Hasil Fitur"
                    className="w-full h-full object-contain transition-transform duration-150"
                    style={{ transform: `scale(${zoomScale})` }}
                  />
                  <button
                    onClick={() => setZoomedImage(currentImage)}
                    disabled={isLoading}
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden cursor-pointer text-white"
                  >
                    🔍 Perbesar
                  </button>
                </>
              ) : (
                <span className="text-sm text-[var(--text-secondary)] font-medium">
                  Menunggu eksekusi aksi fitur...
                </span>
              )}
            </div>

            {/* Display After Dimension and Pixel Hover Info */}
            <div className="flex flex-col items-center space-y-0.5 min-h-[32px] text-center">
              {dimensions.after && (
                <span className="text-[10px] text-[var(--text-secondary)] font-mono tracking-wider">
                  Dimensions: {dimensions.after.w} × {dimensions.after.h} px
                </span>
              )}
              {hoverPixel && (
                <span className="text-[10px] text-[var(--accent)] font-mono font-bold">
                  Cursor: X: {hoverPixel.x}, Y: {hoverPixel.y} | RGB: ({hoverPixel.r}, {hoverPixel.g}, {hoverPixel.b})
                </span>
              )}
            </div>

            {/* Tampilan Teks Hasil Deteksi CNN */}
            <div className="min-h-[36px] flex items-center justify-center">
              {cnnResultInfo && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full animate-pulse">
                  {cnnResultInfo}
                </span>
              )}
            </div>

            <button
              disabled={!currentImage || isLoading}
              onClick={() => setShowSaveModal(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all bg-[var(--accent)] border-[var(--accent)] text-white hover:opacity-90 disabled:bg-[var(--border-primary)] disabled:border-[var(--border-primary)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed cursor-pointer"
            >
              📥 Save Image
            </button>
          </div>
        </div>

        {/* BLOCK 2: SECTION 4 HISTOGRAM SIMETRIS (LEGA 2X LIPAT) */}
        <div className="border-t border-[var(--border-primary)] pt-8 z-10 relative">
          <div className="text-center mb-8">
            <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              📊 Analisis Distribusi Intensitas Piksel (Histogram)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Perbandingan persebaran nilai matriks warna Before vs After secara
              real-time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KOLOM KIRI: HISTOGRAM ORIGINAL (BEFORE) */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block text-center">
                Data Analisis Gambar Ori
              </span>

              <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-[var(--text-secondary)] font-semibold">
                  Original RGB Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-[var(--border-primary)]/40 my-2">
                  <HistogramChart data={imageHistory[0]} type="rgb" />
                </div>
                <div className="text-[9px] text-[var(--text-secondary)]/75 font-mono flex justify-between">
                  <span>v0 - Source Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-[var(--text-secondary)] font-semibold">
                  Original Grayscale Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-[var(--border-primary)]/40 my-2">
                    <HistogramChart data={imageHistory[0]} type="gray" />
                </div>
                <div className="text-[9px] text-[var(--text-secondary)]/75 font-mono flex justify-between">
                  <span>v0 - Grayscale Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: HISTOGRAM PROCESSED (AFTER) */}
            <div className="space-y-4 relative">
              {/* Blur Pelindung Latar Belakang Histogram saat Loading */}
              {isLoading && (
                <div className="absolute inset-x-0 top-6 bottom-0 bg-[var(--bg-primary)]/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center rounded-2xl border border-[var(--accent)]/10">
                  <span className="text-xs text-[var(--accent)] font-medium animate-pulse">
                    Menghitung ulang sebaran piksel...
                  </span>
                </div>
              )}

              <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest block text-center">
                Data Analisis Hasil Fitur
              </span>

              <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-[var(--accent)] font-semibold">
                  Processed RGB Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-[var(--border-primary)]/40 my-2">
                    <HistogramChart data={currentEntry} type="rgb" />
                </div>
                <div className="text-[9px] text-[var(--accent)] font-mono flex justify-between">
                  <span>v{historyIndex} - Output Channel</span>
                  <span>Skala: 0 - 255</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] h-48 flex flex-col justify-between relative">
                <span className="text-xs text-[var(--accent)] font-semibold">
                  Processed Grayscale Histogram
                </span>
                <div className="flex-grow flex items-center justify-center border-b border-dashed border-[var(--border-primary)]/40 my-2">
                  <HistogramChart data={currentEntry} type="gray" />
                </div>
                <div className="text-[9px] text-[var(--accent)] font-mono flex justify-between">
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
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm cursor-pointer"
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

      {/* CUSTOME MODAL UNTUK SAVE IMAGE */}
      {showSaveModal && currentEntry?.image && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative select-text">
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              📥 Simpan Gambar Kustom
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)] block font-semibold">
                  Nama File
                </label>
                <input
                  type="text"
                  value={saveFilename}
                  onChange={(e) => setSaveFilename(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Masukkan nama file..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)] block font-semibold">
                  Format Penyimpanan
                </label>
                <select
                  value={saveFormat}
                  onChange={(e) => setSaveFormat(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="png" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">PNG (Lossless, High Quality)</option>
                  <option value="jpg" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">JPEG (Compressed, Standard)</option>
                  <option value="bmp" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">BMP (Uncompressed, Bitmap)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    const img = new Image();
                    img.src = currentEntry.image;
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      canvas.width = img.width;
                      canvas.height = img.height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0);
                      
                      let mimeType = 'image/png';
                      if (saveFormat === 'jpg') {
                        mimeType = 'image/jpeg';
                      } else if (saveFormat === 'bmp') {
                        mimeType = 'image/bmp';
                      }
                      
                      const dataUrl = canvas.toDataURL(mimeType);
                      const a = document.createElement('a');
                      a.href = dataUrl;
                      a.download = `${saveFilename || 'hasil-edit'}.${saveFormat}`;
                      a.click();
                      setShowSaveModal(false);
                    };
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs transition-opacity cursor-pointer"
                >
                  Unduh Gambar
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)] font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
