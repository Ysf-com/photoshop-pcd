// src/pages/About.jsx
import Navbar from "../components/Navbar";

const About = () => {
  const techStack = [
    {
      name: "React 19 & Vite",
      type: "Frontend Framework",
      desc: "Membangun antarmuka pengguna SPA (Single Page Application) yang sangat responsif dengan HMR (Hot Module Replacement) super cepat.",
      icon: "⚡",
    },
    {
      name: "FastAPI",
      type: "Backend API Engine",
      desc: "Framework Python modern berkinerja tinggi untuk mengalirkan data gambar (Multipart/FormData) ke OpenCV secara asynchronous.",
      icon: "🚀",
    },
    {
      name: "OpenCV (Python)",
      type: "Computer Vision Engine",
      desc: "Menangani pemrosesan citra digital tingkat lanjut seperti penapisan spasial, transformasi affine, segmentasi piksel, dan operasi morfologi.",
      icon: "👁️",
    },
    {
      name: "TensorFlow",
      type: "Machine Learning Engine",
      desc: "Memuat arsitektur Convolutional Neural Network (CNN) terlatih di backend untuk pengenalan objek secara real-time pada citra.",
      icon: "🧠",
    },
    {
      name: "Recharts",
      type: "Data Visualization",
      desc: "Merender grafik distribusi frekuensi intensitas warna piksel (RGB dan Grayscale) di frontend secara presisi dan interaktif.",
      icon: "📊",
    },
    {
      name: "Vanilla CSS & Tailwind",
      type: "Styling & System Design",
      desc: "Menghasilkan UI Glassmorphism modern dengan transisi tema gelap/terang (Dark & Light Mode) yang sangat halus dan responsif.",
      icon: "🎨",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-10 py-16 flex-grow space-y-16">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--accent-light)] border border-[var(--accent)]/30 rounded-full flex items-center justify-center mb-2 shadow-md shadow-[var(--accent)]/5">
            <span className="text-2xl">🖼️</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Tentang Editify
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl leading-relaxed">
            <strong className="text-[var(--text-primary)] font-bold">Editify</strong> (Mini Photoshop) adalah aplikasi berbasis web terintegrasi yang dirancang untuk mendemonstrasikan teori dan konsep dasar kuliah <strong className="text-[var(--text-primary)] font-bold">Pengolahan Citra Digital (PCD)</strong> secara interaktif, visual, dan modern.
          </p>
        </section>

        {/* ACADEMIC CARD */}
        <section className="flex justify-center">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm relative overflow-hidden select-text">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
            <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase tracking-widest block mb-4 text-center">
              Konteks Akademik
            </span>
            <div className="space-y-4 text-center">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Tugas Akhir Mata Kuliah Pengolahan Citra Digital
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Program Studi Teknik Informatika / Ilmu Komputer
                </p>
              </div>
              <div className="py-3 border-t border-b border-[var(--border-primary)]/50">
                <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                  Dosen Pengampu
                </p>
                <p className="text-lg font-black text-[var(--accent)] pt-1">
                  Rizki Elisa Nalawati, S.T., M.T.
                </p>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Aplikasi ini mendukung analisis citra komparatif secara instan dengan rendering grafik histogram, transformasi geometris spasial yang akurat, pengenalan objek cerdas, dan simulasi kompresi multi-metode.
              </p>
            </div>
          </div>
        </section>

        {/* TECH STACK SECTION */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Arsitektur & Teknologi Sistem
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Daftar teknologi dan library yang digunakan untuk menyusun aplikasi Editify
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)]/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-sm">
                      {tech.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                        {tech.name}
                      </h4>
                      <span className="text-[9px] text-[var(--accent)] font-bold tracking-wide uppercase block">
                        {tech.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-primary)]/50 bg-[var(--bg-secondary)]/30">
        &copy; 2026 Editify. Built for Digital Image Processing Academic Project.
      </footer>
    </div>
  );
};

export default About;
