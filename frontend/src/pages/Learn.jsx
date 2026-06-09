// src/pages/Learn.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";

const Learn = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const modules = [
    {
      no: "01",
      title: "Image Management",
      tags: ["Dasar", "File IO", "Reset"],
      details:
        "Melakukan pemuatan berkas citra (JPG, PNG, BMP) dari penyimpanan lokal, melakukan ekspor penyimpanan gambar terproses dengan input nama serta dropdown format kustom secara instan, serta pemulihan memori cache bitmap saat fungsi Reset dijalankan.",
    },
    {
      no: "02",
      title: "Image Enhancement",
      tags: ["Piksel", "Histogram", "Kontras"],
      details:
        "Manipulasi kontras dan kecerahan piksel citra secara linear menggunakan pembatasan nilai numpy (clipping), penyeimbangan kontras global adaptif melalui Histogram Equalization, penajaman tepi kernel, serta penghalusan (blurring) spasial.",
    },
    {
      no: "03",
      title: "Geometric Transformation",
      tags: ["Spasial", "Matriks", "Affine"],
      details:
        "Proses rotasi bebas (0°-360°) dengan penyesuaian otomatis dimensi canvas (bounding box) agar piksel tidak terpotong, pencerminan citra (Flip), pemotongan area (Crop) berbasis koordinat bidang, resize resolusi, serta translasi spasial arah horizontal/vertikal.",
    },
    {
      no: "04",
      title: "Image Restoration (De-Noise)",
      tags: ["Restorasi", "Konvolusi", "Filter"],
      details:
        "Merestorasi kualitas citra dari derau (noise) spasial. Menyediakan filter Gaussian untuk meredam noise sebaran normal, median filter $5x5$ untuk mengeliminasi gangguan bercak bintik hitam-putih (Salt & Pepper), serta restorasi derau otomatis.",
    },
    {
      no: "05",
      title: "Binary & Edge Processing",
      tags: ["Biner", "Tepi", "Morfologi"],
      details:
        "Konversi citra grayscale menjadi biner menggunakan nilai threshold dinamis. Deteksi tepi citra dengan operator turunan pertama (Sobel, Prewitt, Robert), turunan kedua (Laplacian), filter anti-noise (LoG, Canny), serta operasi morfologi (Erosi & Dilatasi).",
    },
    {
      no: "06",
      title: "Color Processing",
      tags: ["Ruang Warna", "Manipulasi", "Saturasi"],
      details:
        "Transformasi ruang warna citra dari RGB ke Grayscale, pemisahan channel warna penyusun (merah, hijau, biru), serta penyesuaian rona warna (Hue) berbasis rotasi derajat modulo 180 dan tingkat kepekatan warna (Saturation) dalam ruang HSV.",
    },
    {
      no: "07",
      title: "Image Segmentation",
      tags: ["Segmentasi", "Masking", "Clustering"],
      details:
        "Memisahkan objek utama dari latar belakang citra menggunakan metode segmentasi berbasis ambang batas (Threshold-based), segmentasi berbasis tepi (Edge-based), dan pemisahan area regional sederhana (Region-based) menggunakan masking piksel.",
    },
    {
      no: "08",
      title: "Image Compression",
      tags: ["Kompresi", "Simulasi", "Kuantisasi"],
      details:
        "Simulasi kompresi data citra. Menganalisis perbandingan ukuran file secara teoritis antara citra asli dengan metode kompresi legendaris seperti Huffman, Run-Length Encoding (RLE), LZW, Arithmetic Coding, serta Metode Kuantisasi DCT JPEG.",
    },
    {
      no: "09",
      title: "Histogram Analysis",
      tags: ["Statistik", "Visualisasi", "RGB/Gray"],
      details:
        "Menganalisis persebaran intensitas piksel citra secara real-time. Menghitung dan merender grafik perbandingan histogram grayscale dan kanal warna RGB individual (Before vs After) berdampingan untuk validasi efek.",
    },
    {
      no: "10",
      title: "CNN Object Recognition",
      tags: ["Machine Learning", "AI", "Klasifikasi"],
      details:
        "Fitur nilai tambah (extra points) berbasis kecerdasan buatan memanfaatkan Convolutional Neural Network (CNN) untuk mendeteksi, mengklasifikasi, dan mengenali jenis objek yang sedang aktif di panel editor secara otomatis.",
    },
  ];

  const filteredModules = modules.filter(
    (mod) =>
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-10 py-16">
        {/* HEADER & SEARCH BAR */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Learning Center
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Dokumentasi & Fitur
            </h1>
            <p className="text-[var(--text-secondary)] text-sm max-w-xl">
              Pelajari landasan materi akademis dan penerapan 10 modul utama Pengolahan Citra Digital (PCD) yang diimplementasikan di Editify.
            </p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari algoritma atau tag (Canny, LZW)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-[var(--accent)] transition-all select-text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModules.map((mod, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/2 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-extrabold text-[var(--accent)] tracking-widest uppercase">
                      MODULE {mod.no}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {mod.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] text-[9px] font-bold tracking-wide uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                    {mod.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-[var(--border-primary)] rounded-2xl bg-[var(--bg-secondary)]">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Tidak ada modul yang cocok dengan "{searchQuery}"
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Coba cari kata kunci lain seperti "morfologi", "rotasi", atau "compress".
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Learn;
