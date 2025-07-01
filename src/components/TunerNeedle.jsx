import React from "react";

const TunerNeedle = ({ cents }) => {
  const rotation = Math.max(-50, Math.min(50, cents));

  return (
    <div style={{ marginTop: "2rem", textAlign: "center" }}>
      <div
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          border: "2px solid #ccc",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "2px",
            height: "50px",
            background: "red",
            position: "absolute",
            bottom: "50%",
            left: "50%",
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: "bottom center",
            transition: "transform 0.1s ease-out",
          }}
        />
      </div>
      <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
        {cents === 0
          ? "In Tune"
          : cents > 0
          ? `${Math.abs(cents)}¢ Sharp`
          : `${Math.abs(cents)}¢ Flat`}
      </div>
    </div>
  );
};

export default TunerNeedle;
