# Court Hub — /public/images

Drop final hero/section imagery here. The codebase expects these paths:

- `Hero.png.webp` — Dubai padel court at night, used by `Hero.tsx` (poster + fallback) and `BuildACourtScene.tsx`.
- `opponent-neutral.png`, `opponent-swing.png`, `opponent-miss.png` — used by `EventCard.tsx` for past events.

Hero asset spec:
- Format: WebP (preferred) or PNG.
- Aspect: 16:9 (e.g. 2560×1440).
- Mood: dark cinematic Dubai padel court, Burj Khalifa visible, blue turf, white centre line.

If `Hero.png.webp` is missing, `Hero.tsx` renders a procedural court fallback so the page never breaks.
