// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Helper to check active nav link
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--navbar-bg)] backdrop-blur-md border-b border-[var(--border-primary)] transition-all">
        <nav className="flex justify-between items-center py-4 px-10 max-w-7xl mx-auto">
          {/* BAGIAN 1: Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter text-[var(--text-primary)] select-none hover:opacity-80 transition-opacity"
          >
            Editify<span className="text-[var(--accent)]">.</span>
          </Link>

          {/* BAGIAN 2: Menu Navigasi */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/editor"
              className={`text-sm font-semibold transition-colors ${
                isActive("/editor")
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Start Editor
            </Link>
            <Link
              to="/learn"
              className={`text-sm font-semibold transition-colors ${
                isActive("/learn")
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Documentation
            </Link>
            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors ${
                isActive("/about")
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              About Project
            </Link>
          </div>

          {/* BAGIAN 3: Ikon Settings */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Settings"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-full hover:bg-[var(--text-primary)]/5 transition-all duration-300"
            >
              <svg
                className="w-5 h-5 transition-transform duration-500 hover:rotate-45"
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
      </header>

      {/* Latar Belakang Blur (Backdrop) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR SETTINGS PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] p-6 z-50 transform transition-transform duration-300 ease-in-out select-text ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
            Preferences
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Close ✕
          </button>
        </div>

        {/* Menu Pilihan Tema */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Interface Theme
          </h3>
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] space-y-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] block">
              Choose Interface Style
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                  theme === "light"
                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] shadow-sm"
                    : "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                }`}
              >
                <span>☀️</span> <span>Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                  theme === "dark"
                    ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] shadow-sm"
                    : "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                }`}
              >
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
