import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const sampleRate = 22050;
const outputDirectory = fileURLToPath(new URL("../public/audio/", import.meta.url));
mkdirSync(outputDirectory, { recursive: true });

function createTrack(seconds) {
  return new Float32Array(Math.ceil(sampleRate * seconds));
}

function envelope(time, duration, attack, release) {
  const attackLevel = attack > 0 ? Math.min(1, time / attack) : 1;
  const releaseLevel = release > 0 ? Math.min(1, (duration - time) / release) : 1;
  return Math.max(0, Math.min(attackLevel, releaseLevel));
}

function addTone(track, start, duration, frequency, volume, shape = "sine", attack = 0.01, release = 0.08) {
  const first = Math.max(0, Math.floor(start * sampleRate));
  const last = Math.min(track.length, Math.ceil((start + duration) * sampleRate));
  let phase = 0;
  for (let index = first; index < last; index += 1) {
    const time = index / sampleRate - start;
    const hz = typeof frequency === "function" ? frequency(time) : frequency;
    phase += (Math.PI * 2 * hz) / sampleRate;
    const sine = Math.sin(phase);
    const sample = shape === "triangle"
      ? (2 / Math.PI) * Math.asin(sine)
      : shape === "square" ? Math.sign(sine) : sine;
    track[index] += sample * volume * envelope(time, duration, attack, release);
  }
}

function addNoise(track, start, duration, volume, release = 0.1, seed = 41) {
  const first = Math.max(0, Math.floor(start * sampleRate));
  const last = Math.min(track.length, Math.ceil((start + duration) * sampleRate));
  let state = seed >>> 0;
  for (let index = first; index < last; index += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const time = index / sampleRate - start;
    track[index] += (((state / 0xffffffff) * 2) - 1)
      * volume * envelope(time, duration, 0.002, release);
  }
}

function writeWave(name, track, fade = 0) {
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + track.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(track.length * 2, 40);
  const fadeFrames = Math.floor(fade * sampleRate);
  for (let index = 0; index < track.length; index += 1) {
    const edge = Math.min(1, (index + 1) / fadeFrames || 1, (track.length - index) / fadeFrames || 1);
    const limited = Math.tanh(track[index] * edge) * 0.92;
    buffer.writeInt16LE(Math.round(limited * 32767), headerSize + index * 2);
  }
  writeFileSync(join(outputDirectory, name), buffer);
}

function makeBackground() {
  const bpm = 100;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const track = createTrack(bar * 8);
  const chords = [
    ["D3", "F3", "A3"],
    ["Bb2", "D3", "F3"],
    ["F3", "A3", "C4"],
    ["C3", "E3", "G3"],
  ];
  const notes = { D2: 73.42, Bb1: 58.27, F2: 87.31, C2: 65.41, D3: 146.83, F3: 174.61, A3: 220, Bb2: 116.54, C4: 261.63, E3: 164.81, G3: 196, A4: 440, C5: 523.25, D5: 587.33, F5: 698.46, G4: 392 };
  const bass = ["D2", "Bb1", "F2", "C2"];
  const melody = ["A4", "D5", "F5", "D5", "C5", "A4", "G4", "A4"];

  for (let section = 0; section < 4; section += 1) {
    const start = section * bar * 2;
    const chord = chords[section];
    chord.forEach((note, voice) => {
      addTone(track, start, bar * 2, notes[note], 0.065, voice === 1 ? "triangle" : "sine", 0.45, 0.5);
      addTone(track, start, bar * 2, notes[note] * 2.003, 0.012, "sine", 0.5, 0.55);
    });
    for (let index = 0; index < 8; index += 1) {
      const time = start + index * beat;
      addTone(track, time, beat * 0.78, notes[bass[section]], 0.13, "triangle", 0.008, beat * 0.42);
      if (section !== 1 || index % 2 === 0) {
        const note = melody[(index + section * 2) % melody.length];
        addTone(track, time + beat * 0.5, beat * 0.32, notes[note], 0.065, "triangle", 0.006, 0.12);
      }
    }
  }

  for (let index = 0; index < 32; index += 1) {
    const time = index * beat;
    const beatInBar = index % 4;
    addTone(track, time, 0.2, (t) => 115 - 65 * (t / 0.2), beatInBar === 0 ? 0.26 : 0.18, "sine", 0.002, 0.18);
    if (beatInBar === 1 || beatInBar === 3) {
      addNoise(track, time, 0.16, 0.075, 0.13, 71 + index);
      addTone(track, time, 0.12, 185, 0.08, "triangle", 0.002, 0.1);
    }
  }
  for (let index = 0; index < 64; index += 1) {
    addNoise(track, index * beat / 2, 0.035, index % 4 === 2 ? 0.045 : 0.026, 0.03, 900 + index);
  }
  return track;
}

const background = makeBackground();
writeWave("background.wav", background, 0.035);

const block = createTrack(0.34);
addTone(block, 0, 0.3, (t) => 900 - 180 * t, 0.24, "sine", 0.002, 0.28);
addTone(block, 0, 0.28, (t) => 1370 - 260 * t, 0.16, "sine", 0.002, 0.26);
addTone(block, 0, 0.24, (t) => 1910 - 340 * t, 0.1, "sine", 0.002, 0.22);
addNoise(block, 0, 0.045, 0.11, 0.04, 1201);
writeWave("shield-block.wav", block, 0.002);

const hit = createTrack(0.32);
addTone(hit, 0, 0.28, (t) => 520 * Math.exp(-t * 5) + 95, 0.32, "sine", 0.002, 0.26);
addTone(hit, 0.008, 0.19, (t) => 760 * Math.exp(-t * 9) + 180, 0.14, "triangle", 0.002, 0.18);
addNoise(hit, 0, 0.055, 0.12, 0.05, 2027);
writeWave("balloon-hit.wav", hit, 0.002);

const gameOver = createTrack(1.75);
addNoise(gameOver, 0, 1.5, 0.055, 1.45, 9881);
addTone(gameOver, 0.08, 1.42, (t) => 190 - 85 * t, 0.19, "sine", 0.04, 0.6);
[[0.12, 392], [0.48, 349.23], [0.84, 293.66], [1.2, 220]].forEach(([time, frequency]) => {
  addTone(gameOver, time, 0.38, frequency, 0.16, "triangle", 0.012, 0.32);
  addTone(gameOver, time, 0.34, frequency / 2, 0.08, "sine", 0.012, 0.3);
});
writeWave("game-over.wav", gameOver, 0.01);

const click = createTrack(0.11);
addTone(click, 0, 0.085, (t) => 760 - 270 * t, 0.16, "triangle", 0.002, 0.075);
addTone(click, 0.004, 0.06, 1140, 0.06, "sine", 0.002, 0.055);
writeWave("ui-click.wav", click, 0.002);

console.log("Generated five original Keep It Together game audio files.");
