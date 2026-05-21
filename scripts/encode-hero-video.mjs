#!/usr/bin/env node
/**
 * encode-hero-video.mjs
 *
 * Re-encodes the supplied hero MP4 so it scrubs smoothly under GSAP
 * ScrollTrigger.
 *
 *   1. -t TRIM_DURATION    → trim away the "Court Hub" lockup near the end of
 *                             the source clip (appears around t≈5.5s). Field
 *                             zoom + blue cover the rest of the transition.
 *   2. -g 1 -keyint_min 1   → every frame is a keyframe (instant seeks)
 *   3. scale (configurable) → smaller pixel count = lighter decode
 *   4. CRF (configurable)   → quality knob; we use CRF 21 (visually lossless)
 *   5. -an                  → strip audio (we render muted anyway)
 *   6. +faststart           → MP4 metadata at the front so playback starts
 *                             before full download
 *
 * Source: c:/Users/mihaj/Web-Design-Agency/Home Repo/hero-video.mp4
 * Output: public/videos/hero-court-loop.mp4
 *
 * Optional second pass:
 *   Set ALSO_MOBILE=1 to also produce
 *   public/videos/hero-court-loop-mobile.mp4 at 960x960.
 */

import ffmpegStatic from "ffmpeg-static";
import { spawn } from "node:child_process";
import { existsSync, statSync, renameSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const SOURCE = path.resolve(
  "C:/Users/mihaj/Web-Design-Agency/Home Repo/hero-video.mp4",
);

// Use the full original clip so the drone descends all the way to the
// bird's-eye perspective at the end.  The lockup that appeared near the
// old trim point (~5.5 s) is part of the original footage; the field-zoom
// + blue overlay now start only after the full clip has played.
const TRIM_DURATION_S = "10.04";

const TARGETS = [
  {
    label: "desktop",
    output: path.join(projectRoot, "public", "videos", "hero-court-loop.mp4"),
    scale: "1600:1600",
    crf: "21",
  },
];

if (process.env.ALSO_MOBILE === "1") {
  TARGETS.push({
    label: "mobile",
    output: path.join(
      projectRoot,
      "public",
      "videos",
      "hero-court-loop-mobile.mp4",
    ),
    scale: "960:960",
    crf: "23",
  });
}

if (!existsSync(SOURCE)) {
  console.error(`✗ Source not found: ${SOURCE}`);
  process.exit(1);
}

if (!ffmpegStatic) {
  console.error("✗ ffmpeg-static did not resolve to a binary path.");
  process.exit(1);
}

const sourceSize = statSync(SOURCE).size;
const sourceMB = (sourceSize / 1_048_576).toFixed(2);
console.log(`→ Source: ${SOURCE}`);
console.log(`  Size:    ${sourceMB} MB\n`);

async function encode({ label, output, scale, crf }) {
  const staging = `${output}.encoding.tmp`;
  console.log(`→ Encoding ${label}: scale=${scale}, CRF=${crf}, every-frame keyframes`);

  const args = [
    "-y",
    "-i", SOURCE,
    "-t", TRIM_DURATION_S,
    "-vf", `scale=${scale}:flags=lanczos`,
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", crf,
    "-g", "1",
    "-keyint_min", "1",
    "-sc_threshold", "0",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.2",
    "-movflags", "+faststart",
    "-an",
    "-f", "mp4",
    staging,
  ];

  const t0 = Date.now();

  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegStatic, args, {
      stdio: ["ignore", "ignore", "ignore"],
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  }).catch((err) => {
    console.error(`✗ ${label} failed: ${err.message}`);
    if (existsSync(staging)) {
      try { unlinkSync(staging); } catch {}
    }
    throw err;
  });

  const outSize = statSync(staging).size;
  const outMB = (outSize / 1_048_576).toFixed(2);
  const reduction = (((sourceSize - outSize) / sourceSize) * 100).toFixed(1);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  renameSync(staging, output);

  console.log(`  ✓ ${outMB} MB · ${reduction}% smaller · ${elapsed}s`);
}

for (const target of TARGETS) {
  try {
    await encode(target);
  } catch {
    process.exit(1);
  }
}

console.log("\n────────────────────────────────────────────────────────────");
console.log("✓ All encodes complete · every frame is a keyframe");
console.log("────────────────────────────────────────────────────────────");
