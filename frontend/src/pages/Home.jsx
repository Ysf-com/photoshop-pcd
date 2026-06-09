// src/pages/Home.jsx
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import DashboardPreview from "../components/DashboardPreview";
import FeaturesSection from "../components/FeaturesSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeaturesSection />

      {/* Footer Sederhana */}
      <footer className="py-20 text-center text-[var(--text-secondary)] text-xs border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/30">
        &copy; 2026 Editify. Built for Digital Image Processing Project.
      </footer>
    </div>
  );
};

export default Home;
