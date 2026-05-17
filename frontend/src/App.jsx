// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Learn from "./pages/Learn";
import About from "./pages/About";

function App() {
  return (
    // Memastikan tema gelap Editify membungkus seluruh halaman aplikasi
    <div className="bg-[#08060d] min-h-screen text-white font-sans selection:bg-purple-500/30">
      <Routes>
        {/* Jalur untuk Halaman Utama/Home */}
        <Route path="/" element={<Home />} />

        {/* Jalur untuk Halaman Editor tempat ngedit foto */}
        <Route path="/editor" element={<Editor />} />

        {/* Jalur untuk Halaman Editor belajar */}
        <Route path="/learn" element={<Learn />} />

        {/* Jalur untuk Halaman Editor tempat baca about */}
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
