// src/components/Hero.jsx
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center text-center mt-20 px-4">
      <h1 className="text-6xl md:text-8xl font-black tracking-tight text-[var(--text-primary)] mb-6">
        Editify
      </h1>
      <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed font-medium">
        Simple UI, Powerful Processing. <br />
        Kekuatan Pengolahan Citra Digital Langsung di Browser Anda.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/editor")}
          className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-lg hover:shadow-[var(--accent)]/10"
        >
          Start Editor
        </button>
        <button 
          onClick={() => navigate("/learn")}
          className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] px-8 py-4 rounded-full text-lg font-bold hover:bg-[var(--text-primary)]/5 hover:border-[var(--text-primary)]/30 transition-all"
        >
          Learn more
        </button>
      </div>
    </section>
  );
};

export default Hero;
