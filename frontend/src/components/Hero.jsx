// src/components/Hero.jsx
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center text-center mt-20 px-4">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6">
        Editify
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
        Simple UI, Powerful Processing. <br />
        The Power of Digital Image Processing in Your Browser.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/editor")}
          className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-white/10"
        >
          Start for free
        </button>
        <button className="bg-[#16171d] border border-gray-800 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-all">
          Learn more
        </button>
      </div>
    </section>
  );
};

export default Hero;
