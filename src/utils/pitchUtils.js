const noteStrings = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

export function freqToNoteNumber(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

export function getNoteName(noteNumber) {
  const rounded = Math.round(noteNumber);
  const note = noteStrings[rounded % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${note}${octave}`;
}

export function getCentsOff(freq, targetFreq) {
  if (!freq || !targetFreq || freq <= 0 || targetFreq <= 0) return 0;
  const ratio = freq / targetFreq;
  const cents = 1200 * Math.log2(ratio);
  return Math.round(cents);
}

export function noteNumberToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}
