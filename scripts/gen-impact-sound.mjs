// Generates a procedural "ball impact" WAV file at public/sounds/ball-impact.wav.
// Run once: `node scripts/gen-impact-sound.mjs`.
// Synthesizes a short attack-decay burst combining a low thump, body resonance,
// and a filtered click for a satisfying padel-ball-meets-wall sound.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../public/sounds/ball-impact.wav");

const sampleRate = 44100;
const durationSec = 0.22;
const numSamples = Math.floor(sampleRate * durationSec);

const samples = new Float32Array(numSamples);

// Layer 1 — low thump (80 Hz sine, ~80ms decay)
const thumpFreq = 80;
const thumpDecay = 18;
// Layer 2 — body resonance (220 Hz sine, ~120ms decay)
const bodyFreq = 220;
const bodyDecay = 9;
// Layer 3 — high click via simple lowpass-filtered white noise (~25ms decay)
const clickDecay = 70;

let noiseState = 0;
const lpAlpha = 0.35; // simple one-pole lowpass on noise

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;

  const thump = Math.sin(2 * Math.PI * thumpFreq * t) * Math.exp(-thumpDecay * t);
  const body = Math.sin(2 * Math.PI * bodyFreq * t) * Math.exp(-bodyDecay * t) * 0.5;

  const raw = Math.random() * 2 - 1;
  noiseState = noiseState * (1 - lpAlpha) + raw * lpAlpha;
  const click = noiseState * Math.exp(-clickDecay * t) * 0.6;

  let mix = thump * 0.7 + body + click;

  // soft clip
  mix = Math.tanh(mix * 1.2);

  // brief attack ramp (1ms) to avoid speaker pop on samples[0]
  const attackSamples = Math.floor(sampleRate * 0.001);
  if (i < attackSamples) {
    mix *= i / attackSamples;
  }

  samples[i] = mix;
}

// peak-normalize to -1 dBFS
let peak = 0;
for (let i = 0; i < numSamples; i++) {
  const a = Math.abs(samples[i]);
  if (a > peak) peak = a;
}
const targetPeak = 0.89; // ~-1 dBFS
const gain = peak > 0 ? targetPeak / peak : 1;

// build WAV (16-bit PCM mono)
const bytesPerSample = 2;
const dataSize = numSamples * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write("RIFF", 0, "ascii");
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8, "ascii");
buffer.write("fmt ", 12, "ascii");
buffer.writeUInt32LE(16, 16); // subchunk1 size
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * bytesPerSample, 28); // byte rate
buffer.writeUInt16LE(bytesPerSample, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample
buffer.write("data", 36, "ascii");
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
  const s = Math.max(-1, Math.min(1, samples[i] * gain));
  buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, buffer);

console.log(`Wrote ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
