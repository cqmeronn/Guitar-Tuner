import React from "react";
import MicInput from "./components/MicInput";

function App() {
  return (
    <div className="app" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Guitar Tuner 🎸</h1>
      <MicInput />
    </div>
  );
}

export default App;