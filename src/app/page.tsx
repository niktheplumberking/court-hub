import { PageIntro } from "@/components/PageIntro";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { BroadcastGlass } from "@/components/BroadcastGlass";
import { ScreenCrack } from "@/components/ScreenCrack";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SectionBridge } from "@/components/transitions/SectionBridge";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { Shop } from "@/components/sections/Shop";
import { BuildACourt } from "@/components/sections/BuildACourt";
import { Tournaments } from "@/components/sections/Tournaments";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main id="top" className="relative">
      {/* Site-wide Lenis smooth scroll, wired into gsap.ticker so every
          ScrollTrigger pin and scrub flows on the smoothed scroll value. */}
      <SmoothScroll />

      {/* Premium load entrance — broadcast tuning in, lifts to reveal hero. */}
      <PageIntro />

      <Navbar />
      {/* Full-viewport broadcast panel chrome — sits under nav / cracks. */}
      <BroadcastGlass />
      <Hero />
      {/* No bridge after Hero — the lime → ink ball wipe IS the transition
          into WhoWeAre. One hero section, no second wordmark lockup. */}
      <WhoWeAre />
      <SectionBridge variant="marquee-pros" height="70vh" />
      <Shop />
      <SectionBridge variant="blueprint" height="80vh" />
      <BuildACourt />
      <SectionBridge variant="stadium-lights" height="80vh" />
      <Tournaments />
      <SectionBridge variant="lights-out" height="70vh" />
      <Footer />

      {/* Click anywhere on the broadcast to shatter glass — heals ~6–7 s. */}
      <ScreenCrack />
    </main>
  );
}
