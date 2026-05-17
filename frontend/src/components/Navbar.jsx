// src/components/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  // State untuk mengontrol buka/tutup sidebar settings
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="flex justify-between items-center py-6 px-10 bg-transparent relative z-40">
        {/* BAGIAN 1: Logo (Sekarang Berfungsi Sebagai Link ke Home) */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tighter text-white select-none hover:opacity-80 transition-opacity"
        >
          Editify<span className="text-purple-500">.</span>
        </Link>

        {/* BAGIAN 2: Menu Navigasi (Ukuran diperbesar ke text-xl & menggunakan Link Mandiri) */}
        <div className="hidden md:flex space-x-10 items-center">
          <Link
            to="/editor"
            className="text-xl font-medium text-gray-400 hover:text-white transition-colors"
          >
            Start
          </Link>
          <Link
            to="/learn"
            className="text-xl font-medium text-gray-400 hover:text-white transition-colors"
          >
            Learn
          </Link>
          <Link
            to="/about"
            className="text-xl font-medium text-gray-400 hover:text-white transition-colors"
          >
            About
          </Link>
        </div>

        {/* BAGIAN 3: Ikon Settings (Membuka Sidebar Theme saat diklik) */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Settings"
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all duration-300"
          >
            <svg
              className="w-6 h-6 transition-transform duration-500 hover:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Latar Belakang Blur (Backdrop) saat Sidebar Aktif */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR SETTINGS PANEL (Slide-out dari sisi kanan) */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#101116] border-l border-gray-800 p-6 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Settings
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Close ✕
          </button>
        </div>

        {/* Menu Pilihan Tema */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Preferences
          </h3>
          <div className="p-4 rounded-xl bg-[#08060d] border border-gray-800 space-y-3">
            <span className="text-sm font-medium text-gray-300 block">
              Interface Theme
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-gray-800 bg-[#101116] hover:border-gray-700 text-xs font-medium text-gray-400 transition-colors">
                <span>☀️</span> <span>Light</span>
              </button>
              <button className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-purple-500 bg-purple-500/10 text-xs font-medium text-white transition-colors">
                <span>🌙</span> <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
