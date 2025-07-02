import React, { useEffect, useRef, useState } from "react";
import TunerNeedle from "./TunerNeedle";
import {
  freqToNoteNumber,
  getNoteName,
  getCentsOff,
} from "../utils/pitchUtils";

const standardTuning = {
  E2: 82.41,
  A2: 110.0,
  D3: 146.83,
  G3: 196.0,
  B3: 246.94,
  E4: 329.63,
};

const MicInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const [pitch, setPitch] = useState(null);
    const [note, setNote] = useState(null);
    const [cents, setCents] = useState(null);
    const [targetNote, setTargetNote] = useState("E2");
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const rafIdRef = useRef(null);
    const lastStablePitch = useRef(0);
    const lastLogTime = useRef(0);
    const lastPitches = useRef([]);
    const targetNoteRef = useRef(targetNote);

    useEffect(() => {
    targetNoteRef.current = targetNote;
    }, [targetNote]);



  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const autoCorrelate = (buffer, sampleRate) => {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }

    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1;
    while (buffer[r1] < 0.001 && r1 < SIZE / 2) r1++;
    while (buffer[r2] < 0.001 && r2 > SIZE / 2) r2--;

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    const c = new Array(SIZE).fill(0);

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;

    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

    const stringSuffix = (i) => {
    const s = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
    return s[i - 1] || `${i}th`;
    };


  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const floatBuffer = new Float32Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    source.connect(analyser);
    setIsListening(true);

    const listen = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      const update = () => {
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }

        const rms = Math.sqrt(sum / dataArray.length);
        setVolume(rms);

        if (rms < 0.02) {
          rafIdRef.current = requestAnimationFrame(update);
          return;
        }

        const floatBuffer = new Float32Array(dataArray.length);
        for (let i = 0; i < dataArray.length; i++) {
          floatBuffer[i] = (dataArray[i] - 128) / 128;
        }

        const detectedPitch = autoCorrelate(floatBuffer, audioContextRef.current.sampleRate);
        if (detectedPitch !== -1) {
          lastPitches.current.push(detectedPitch);
          if (lastPitches.current.length > 5)
            lastPitches.current.shift();

          const avgPitch =
            lastPitches.current.reduce((a, b) => a + b, 0) /
            lastPitches.current.length;

          const roundedPitch = Number(avgPitch.toFixed(2));
          if (
            Math.abs(avgPitch - (lastStablePitch.current || 0)) > 1
          ) {
            lastStablePitch.current = avgPitch;
            setPitch(roundedPitch);

            const targetFreq = standardTuning[targetNoteRef.current];
            const detectedNoteNum = freqToNoteNumber(avgPitch);
            setNote(getNoteName(detectedNoteNum));

            const centsOff = getCentsOff(avgPitch, targetFreq);
            console.log("Incoming cents to needle:", centsOff);
            setCents(centsOff);
          }
        }

        rafIdRef.current = requestAnimationFrame(update);
      };

      update();
    };

    listen();
  };

  return (
    <div
      className="tuner-container"
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <button onClick={startMic} disabled={isListening}>
        {isListening ? "Mic Active" : "Start Microphone"}
      </button>

      <div
        style={{ height: "20px", background: "#eee", marginTop: "10px" }}
      >
        <div
          style={{
            width: `${Math.min(volume * 300, 300)}px`,
            height: "100%",
            background: "limegreen",
            transition: "width 0.1s",
          }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="string-select">Tuning String: </label>
        <select
          id="string-select"
          value={targetNote}
          onChange={(e) => setTargetNote(e.target.value)}
        >
        {Object.keys(standardTuning)
        .map((noteKey, index) => (
            <option key={noteKey} value={noteKey}>
            {noteKey} ({stringSuffix(6 - index)} string)
            </option>
        ))}


        </select>
      </div>

        {targetNote && (
    <p style={{ margin: "1rem 0", fontSize: "1rem" }}>
        Expected pitch: <strong>{Math.round(standardTuning[targetNote])} Hz</strong>
    </p>
    )}


      {pitch && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "1.25rem", margin: "1rem 0" }}>
            Detected pitch: <strong>{pitch} Hz</strong>
          </p>
          <p style={{ fontSize: "1.25rem", margin: "1rem 0" }}>
            Note: <strong>{note}</strong>
          </p>
          <TunerNeedle cents={cents} />
        </div>
      )}
    </div>
  );
};

export default MicInput;