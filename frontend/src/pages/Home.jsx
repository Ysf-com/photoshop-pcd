// src/pages/Home.jsx
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import DashboardPreview from "../components/DashboardPreview";
import FeaturesSection from "../components/FeaturesSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#08060d]">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeaturesSection />

      {/* Footer Sederhana */}
      <footer className="py-20 text-center text-gray-600 text-sm border-top border-gray-900">
        &copy; 2026 Editify. Built for Digital Image Processing Project.
      </footer>
    </div>
  );
};

export default Home;
