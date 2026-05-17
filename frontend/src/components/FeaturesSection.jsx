// src/components/FeaturesSection.jsx
const features = [
  {
    title: "Enhancement",
    desc: "Brightness, Contrast, & Histogram Equalization.",
    icon: "✨",
  },
  {
    title: "Geometric",
    desc: "Rotate, Flip, Crop, & Resize images easily.",
    icon: "📐",
  },
  {
    title: "Edge Processing",
    desc: "Canny, Sobel, & Prewitt edge detection.",
    icon: "🖼️",
  },
  {
    title: "ML Recognition",
    desc: "CNN-powered object recognition with PyTorch.",
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
            className="p-8 rounded-2xl bg-[#0f1014] border border-gray-800 hover:border-purple-500/50 transition-colors group"
          >
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
