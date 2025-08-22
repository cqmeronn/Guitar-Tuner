import React from "react";
import MicInput from "./components/MicInput";
import bgImage from "./assets/background.jpg";

function App() {
  return (
    <div
      className="app"
      style={{
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "sans-serif",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <h1 style={{ color: "#fff", textShadow: "1px 1px 4px #000" }}>
          Guitar Tuner 🎸
        </h1>
      </div>

      <MicInput />
    </div>
  );
}

export default App;
