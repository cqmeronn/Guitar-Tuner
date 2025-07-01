import React from "react";

const TunerNeedle = ({ cents }) => {
  const isValid = typeof cents === "number" && !isNaN(cents);
  const clampedCents = isValid ? Math.max(-50, Math.min(50, cents)) : 0;

  let color = "red";
  if (isValid && Math.abs(cents) <= 15) color = "orange";
  if (isValid && Math.abs(cents) <= 5) color = "green";

  return (
    <div style={{ marginTop: "2rem", textAlign: "center" }}>
      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          border: "2px solid #ccc",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "2px",
            height: "60px",
            background: color,
            position: "absolute",
            bottom: "50%",
            left: "50%",
            transform: `translateX(-50%) rotate(${clampedCents}deg)`,
            transformOrigin: "bottom center",
            transition: "transform 0.1s ease-out",
          }}
        />
      </div>

      <div style={{ marginTop: "1rem", fontSize: "1.1rem", color }}>
        {isValid ? (
          Math.abs(cents) <= 5 ? (
            "In Tune"
          ) : cents > 0 ? (
            `${Math.abs(cents)}¢ Sharp`
          ) : (
            `${Math.abs(cents)}¢ Flat`
          )
        ) : (
          "No pitch detected"
        )}
      </div>
    </div>
  );
};

export default TunerNeedle;
