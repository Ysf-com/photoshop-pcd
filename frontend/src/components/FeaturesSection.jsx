// src/components/FeaturesSection.jsx
const features = [
  {
    title: "Enhancement",
    desc: "Brightness, Contrast, & Histogram Equalization untuk perbaikan kualitas citra.",
    icon: "✨",
  },
  {
    title: "Geometric",
    desc: "Rotate, Flip, Crop, & Resize gambar tanpa merusak pixel dengan interpolasi.",
    icon: "📐",
  },
  {
    title: "Edge Processing",
    desc: "Operator Canny, Sobel, Prewitt, Robert, Laplacian, dan LoG deteksi tepi.",
    icon: "🖼️",
  },
  {
    title: "ML Recognition",
    desc: "Pengenalan objek otomatis berbasis Machine Learning (arsitektur CNN).",
    icon: "🧠",
  },
];

const FeaturesSection = () => {
  return (
    <section id="learn" className="py-32 px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)]/50 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{f.title}</h3>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-normal">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
