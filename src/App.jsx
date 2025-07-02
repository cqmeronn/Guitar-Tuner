import React from "react";
import MicInput from "./components/MicInput";

function App() {
  return (
    <div className="app" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <h1>Guitar Tuner 🎸</h1>
      </div>

      <MicInput />
    </div>
  );
}

export default App;
