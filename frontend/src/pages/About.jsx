// src/pages/About.jsx
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-[#08060d] text-white">
      {/* Navbar tetap tampil di bagian atas */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-10 py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mb-8">
          <span className="text-3xl">🖼️</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-6">
          Tentang Editify
        </h1>

        <div className="space-y-6 text-gray-400 text-lg leading-relaxed max-w-2xl">
          <p>
            <strong className="text-white">Editify</strong> (Mini Photoshop)
            merupakan aplikasi pengolahan citra digital berbasis web yang
            dirancang khusus untuk mengimplementasikan konsep-konsep utama dalam
            manipulasi piksel secara interaktif dan modern.
          </p>
          <p>
            Proyek ini dikembangkan sebagai pemenuhan Tugas Akhir untuk mata
            kuliah{" "}
            <span className="text-gray-200 font-medium">
              Pengolahan Citra Digital
            </span>{" "}
            dengan tujuan menyajikan antarmuka (*user interface*) yang simpel
            namun memiliki mesin pemrosesan (*processing engine*) OpenCV dan
            Machine Learning yang bertenaga di sisi backend.
          </p>
        </div>

        {/* Atribusi Mata Kuliah */}
        <div className="mt-16 p-6 rounded-2xl bg-[#101116] border border-gray-800 w-full max-w-md">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest block mb-3">
            Academic Context
          </span>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300 font-medium">
              Proyek Akhir Pengolahan Citra Digital
            </p>
            <p className="text-gray-500">Dosen Pengampu:</p>
            <p className="text-purple-400 font-semibold text-base pt-1">
              Rizki Elisa Nalawati, S.T., M.T.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
