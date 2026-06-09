// src/components/DashboardPreview.jsx
const DashboardPreview = () => {
  return (
    <div className="mt-20 px-10 max-w-6xl mx-auto">
      <div className="relative rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-2 shadow-2xl transition-all duration-300">
        {/* Placeholder untuk GIF atau Gambar Dashboard */}
        <div className="aspect-video w-full rounded-xl bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden transition-colors duration-300">
          <div className="text-[var(--text-secondary)] flex flex-col items-center">
            <svg
              className="w-16 h-16 mb-4 opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-30">
              Editor Preview Placeholder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
