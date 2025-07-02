import React from "react";

const TunerNeedle = ({ cents }) => {
  const isValid = typeof cents === "number" && !isNaN(cents);
  const clampedCents = isValid ? Math.max(-50, Math.min(50, cents)) : 0;

  const displayCents =
    isValid && Math.abs(cents) > 100
      ? "Very"
      : `${Math.abs(cents)}¢`;

  let color = "red";
  if (isValid && Math.abs(cents) <= 15) color = "orange";
  if (isValid && Math.abs(cents) <= 5) color = "green";

  return (
    <div style={{ marginTop: "2rem", textAlign: "center" }}>
      <div style={{ maxWidth: "180px", width: "100%", margin: "0 auto" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: "50%",
            border: "2px solid #ccc",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "3px",
              height: "70%",
              background: color,
              position: "absolute",
              top: "25%",
              left: "50%",
              transform: `translateX(-50%) rotate(${clampedCents}deg)`,
              transformOrigin: "bottom center",
              transition: "transform 0.1s ease-out",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "1rem", fontSize: "1.1rem", color }}>
        {!isValid && "No pitch detected"}
        {isValid &&
          (Math.abs(cents) <= 5
            ? "In Tune"
            : cents > 0
            ? `${displayCents} Sharp`
            : `${displayCents} Flat`)}
      </div>
    </div>
  );
};

export default TunerNeedle;
