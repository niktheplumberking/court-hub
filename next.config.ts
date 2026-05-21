import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next stops detecting the
  // stray lockfile in C:\Users\mihaj and warning at build time.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
