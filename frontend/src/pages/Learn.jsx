// src/pages/Learn.jsx
import Navbar from "../components/Navbar";

const Learn = () => {
  const modules = [
    {
      no: "01",
      title: "Image Management",
      details:
        "Load image (JPG, PNG, BMP), Save image dengan kustom format, dan fungsi Reset ke gambar awal.",
    },
    {
      no: "02",
      title: "Image Enhancement",
      details:
        "Brightness & Contrast Adjustment via slider, Histogram Equalization, Sharpening, dan Smoothing (blur).",
    },
    {
      no: "03",
      title: "Geometric Transformation",
      details:
        "Rotasi (0°–360°), Flip (horizontal/vertical), Crop area, Resize (scaling), dan Translasi posisi menggunakan matriks affine.",
    },
    {
      no: "04",
      title: "Image Restoration",
      details:
        "Noise reduction (spatial filtering & kernel convolution) menggunakan Gaussian Blur, Median Filter, dan Salt & Pepper removal.",
    },
    {
      no: "05",
      title: "Binary & Edge Processing",
      details:
        "Thresholding piksel biner, Deteksi Tepi (Canny, Sobel, Prewitt, Robert, Laplacian, LoG), serta Morfologi (Erosi & Dilatasi).",
    },
    {
      no: "06",
      title: "Color Processing",
      details:
        "Transformasi ruang warna dari RGB ke Grayscale, Channel Splitting (R, G, B), dan kontrol saturasi warna sederhana.",
    },
    {
      no: "07",
      title: "Image Segmentation",
      details:
        "Segmentasi berbasis Thresholding, Edge-based, dan Region-based extraction menggunakan metode clustering/masking sederhana.",
    },
    {
      no: "08",
      title: "Image Compression",
      details:
        "Simulasi kompresi gambar JPEG dengan opsi tingkat kualitas (low-high) menggunakan metode LZW, Huffman, RLE, atau Kuantisasi.",
    },
    {
      no: "09",
      title: "Histogram Analysis",
      details:
        "Visualisasi distribusi intensitas piksel untuk grayscale dan RGB, serta komparasi panel histogram before vs after.",
    },
    {
      no: "10",
      title: "CNN Object Recognition",
      details:
        "Nilai tambah sistem berupa deteksi rekognisi objek secara otomatis memanfaatkan arsitektur Machine Learning CNN (PyTorch).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08060d] text-white">
      {/* Navbar tetap tampil di bagian atas */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-10 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Documentation & Features
          </h1>
          <p className="text-gray-400 text-lg">
            Pelajari seluruh kapabilitas algoritma pengolahan citra digital yang
            tersedia di Editify.
          </p>
        </div>

        {/* Grid Modul Fitur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-[#101116] border border-gray-800 hover:border-purple-500/30 transition-all"
            >
              <div className="text-xs font-bold text-purple-500 tracking-wider mb-2">
                MODULE {mod.no}
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-200">
                {mod.title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {mod.details}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Learn;
