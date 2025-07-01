import TunerNeedle from "./TunerNeedle";

import {
  freqToNoteNumber,
  getNoteName,
  getCentsOff,
  noteNumberToFreq
} from "../utils/pitchUtils";


import React, { useEffect, useRef, useState } from "react";

const MicInput = () => {
    const [pitch, setPitch] = useState(null);
    const [note, setNote] = useState(null);
    const [cents, setCents] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const rafIdRef = useRef(null);
    const lastPitches = useRef([]);
    const lastStablePitch = useRef(null);
    const lastLogTime = useRef(0);



  useEffect(() => {
    return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
    };
}, []);

  const startMic = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

      setIsListening(true);
      listen();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

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

        
        const now = Date.now();
        if (now - lastLogTime.current > 500) {
            console.log("RMS:", rms);
        }

        const detectedPitch = autoCorrelate(floatBuffer, audioContextRef.current.sampleRate);


        if (now - lastLogTime.current > 500) {
            console.log("Detected pitch:", detectedPitch);
            lastLogTime.current = now;
        }


        if (detectedPitch !== -1) {
        lastPitches.current.push(detectedPitch);
        if (lastPitches.current.length > 5) {
            lastPitches.current.shift();
        }

        const avgPitch =
            lastPitches.current.reduce((a, b) => a + b, 0) / lastPitches.current.length;

        const roundedPitch = avgPitch.toFixed(2);
        if (Math.abs(avgPitch - (lastStablePitch.current || 0)) > 1) {
            lastStablePitch.current = avgPitch;
            setPitch(roundedPitch);

            const noteNum = freqToNoteNumber(avgPitch);
            setNote(getNoteName(noteNum));
            setCents(getCentsOff(avgPitch, noteNum));
        }

        } else {
            lastPitches.current = [];
        }

        rafIdRef.current = requestAnimationFrame(update);
        };

    update();
    };

  return (
    <div>
        <button onClick={startMic} disabled={isListening}>
            {isListening ? "Mic Active" : "Start Microphone"}
        </button>
        <div style={{ height: "20px", background: "#eee", marginTop: "10px" }}>
            <div
            style={{
                width: `${Math.min(volume * 300, 300)}px`,
                height: "100%",
                background: "limegreen",
                transition: "width 0.1s",
            }}
            />
      </div>

        {pitch && (
            <div style={{ marginTop: "1rem" }}>
                <p>Detected pitch: <strong>{pitch} Hz</strong></p>
                <p>Note: <strong>{note}</strong></p>
                <TunerNeedle cents={cents} />
            </div>
            )}

    </div>
  );
};

function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;

  while (buf[r1] < 0.001 && r1 < SIZE / 2) r1++;
  while (buf[r2] < 0.001 && r2 > SIZE / 2) r2--;

  buf = buf.slice(r1, r2);
  const newSize = buf.length;

  const c = new Array(newSize).fill(0);

  for (let i = 0; i < newSize; i++) {
    for (let j = 0; j < newSize - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1, maxpos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];

  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;

  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}


export default MicInput;