# Court Hub — /public/videos

Drop final hero video files here. The codebase expects these paths:

- `hero-court-loop.mp4` — desktop hero, 16:9, ~8s, H.264, muted, < 15 MB.
- `hero-court-loop-mobile.mp4` — mobile hero, 9:16 vertical crop of the same shot.

When these files exist, the hero auto-upgrades from the static `Hero.png.webp` poster to a scroll-scrubbed video timeline via GSAP ScrollTrigger.
