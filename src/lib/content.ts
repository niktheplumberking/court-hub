export const CONTENT = {

  nav: {
    logo: "COURT HUB",
    links: [
      { label: "Shop", href: "#shop" },
      { label: "Courts", href: "#courts" },
      { label: "Tournaments", href: "#tournaments" },
    ],
    cta: "WhatsApp Us",
    ctaHref: "https://wa.me/971500000000",
  },

  hero: {
    scrollHint: "SCROLL TO SERVE ↓",
    words: ["Equipment.", "Courts.", "Tournaments."],
    reveal: {
      heading: "COURT HUB",
      tagline: "The home of premium padel in the UAE.",
      ctaPrimary: { label: "Shop Equipment", href: "#shop" },
      ctaSecondary: { label: "Our Story", href: "#about" },
    },
  },

  whoWeAre: {
    eyebrow: "WHO WE ARE",
    heading: "The home of\npremium padel\nin the UAE.",
    headingAccent: "in the UAE.",
    body: "From racket to court to championship moment — Court Hub Group powers every part of the game. We stock what the pros play with, build the surfaces they win on, and stage the tournaments where careers are made.",
    stats: [
      { value: 250000, display: "250K", label: "Monthly Community", prefix: "" },
      { value: 3, display: "3", label: "Business Pillars", prefix: "" },
      { value: 6, display: "6+", label: "Courts Built in UAE", prefix: "" },
    ],
    pillars: [
      {
        number: "01",
        title: "Equipment Shop",
        body: "Authorised HEAD and Wilson dealer. Every racket, ball, bag, and accessory the serious player needs — plus our Used Racket marketplace powered by the UAE's largest padel Instagram community.",
      },
      {
        number: "02",
        title: "Court Construction",
        body: "End-to-end padel court design, supply, and installation. We've built courts for hotels, private clubs, and residential developments across the UAE. 24-hour quote response guaranteed.",
      },
      {
        number: "03",
        title: "Tournaments",
        body: "The Court Hub Open brings together the UAE's best players. From amateur leagues to elite invitationals — we organise, manage, and elevate competitive padel in the region.",
      },
    ],
  },

  shop: {
    eyebrow: "THE SHOP",
    heading: "Equipment.",
    subheading: "Everything the serious player needs.",
    filterTabs: ["All", "HEAD", "Wilson", "Pre-Owned"],
    products: [
      {
        id: "head-delta-pro",
        brand: "HEAD",
        name: "HEAD Delta Pro 2024",
        description: "The racket of choice for players who demand control and power in equal measure.",
        price: 1299,
        currency: "AED",
        badge: "Best Seller",
        category: "HEAD",
      },
      {
        id: "head-flash",
        brand: "HEAD",
        name: "HEAD Flash 2024",
        description: "Lightweight and explosive. Designed for players who win rallies at the net.",
        price: 899,
        currency: "AED",
        badge: "New",
        category: "HEAD",
      },
      {
        id: "head-alpha",
        brand: "HEAD",
        name: "HEAD Alpha Pro",
        description: "A balanced diamond-shape racket delivering maximum power from the baseline.",
        price: 1099,
        currency: "AED",
        badge: null,
        category: "HEAD",
      },
      {
        id: "wilson-carbon",
        brand: "Wilson",
        name: "Wilson Carbon Force Pro",
        description: "Carbon fibre construction meets Tour-proven design. Built for elite performance.",
        price: 1499,
        currency: "AED",
        badge: "Pro Choice",
        category: "Wilson",
      },
      {
        id: "wilson-bela",
        brand: "Wilson",
        name: "Wilson Bela Pro V2",
        description: "Fernando Bela's signature racket. Precision-engineered for elite competitive play.",
        price: 1199,
        currency: "AED",
        badge: null,
        category: "Wilson",
      },
      {
        id: "used-head-extreme",
        brand: "HEAD",
        name: "HEAD Extreme Pro — Used",
        description: "Excellent condition. Barely played. Full carbon frame, original grip. Verified by Court Hub.",
        price: 450,
        currency: "AED",
        badge: "Verified Used",
        category: "Pre-Owned",
      },
    ],
    cta: "View Full Shop →",
  },

  buildACourt: {
    eyebrow: "BUILD A COURT",
    heading: "We build courts that win championships.",
    body: "From design to surface to lighting — Court Hub delivers complete padel court construction across the UAE. Hotels, clubs, and developers trust us to deliver on time, on budget, and to the highest international standard.",
    features: [
      "Full design and engineering",
      "Panoramic glass walls",
      "Professional LED lighting",
      "Artificial grass surface",
      "12-month structural warranty",
      "Ongoing maintenance plans",
    ],
    form: {
      heading: "Get a quote",
      fields: [
        { name: "name", label: "Your name", type: "text", placeholder: "Ahmed Al Mansouri" },
        { name: "email", label: "Email address", type: "email", placeholder: "ahmed@example.com" },
        { name: "phone", label: "Phone / WhatsApp", type: "tel", placeholder: "+971 50 000 0000" },
        { name: "message", label: "Tell us about your project", type: "textarea", placeholder: "Hotel rooftop, 2 courts, Dubai Marina..." },
      ],
      submitLabel: "Request a Quote →",
      guarantee: "24hr response guaranteed",
      guaranteeIcon: "✓",
    },
  },

  tournaments: {
    eyebrow: "TOURNAMENTS",
    heading: "Tournaments.",
    subheading: "Where UAE padel gets serious.",
    nextEvent: {
      eyebrow: "NEXT EVENT",
      name: "Court Hub Open — Dubai 2025",
      location: "Dubai Sports City",
      date: "2025-09-15T10:00:00",
      description: "The UAE's premier padel tournament returns. 64 players. 3 days. One champion.",
      registerLabel: "Register Now →",
      registerHref: "https://wa.me/971500000000",
      prize: "AED 25,000 Prize Pool",
    },
    pastEvents: [
      {
        name: "Court Hub Open 2024",
        date: "March 2024",
        location: "Dubai Sports City",
        players: "48 players · 24 teams",
        result: "Winner: Al Habtoor Padel Club",
        link: "#",
      },
      {
        name: "UAE Padel Invitational",
        date: "November 2023",
        location: "Abu Dhabi",
        players: "32 players · 16 teams",
        result: "Winner: Emirates Padel Academy",
        link: "#",
      },
      {
        name: "Ramadan Padel Cup",
        date: "April 2023",
        location: "Dubai Marina",
        players: "24 players · 12 teams",
        result: "Winner: Court Hub All-Stars",
        link: "#",
      },
    ],
  },

  footer: {
    logo: "COURT HUB",
    tagline: "The home of premium padel in the UAE.",
    whatsapp: { label: "WhatsApp Us →", href: "https://wa.me/971500000000" },
    columns: [
      {
        heading: "Shop",
        links: [
          { label: "All Equipment", href: "#shop" },
          { label: "HEAD Rackets", href: "#shop" },
          { label: "Wilson Rackets", href: "#shop" },
          { label: "Used Rackets", href: "#shop" },
          { label: "Accessories", href: "#shop" },
        ],
      },
      {
        heading: "Courts",
        links: [
          { label: "Build a Court", href: "#courts" },
          { label: "Our Projects", href: "#courts" },
          { label: "Get a Quote", href: "#courts" },
          { label: "Maintenance", href: "#courts" },
          { label: "FAQ", href: "#courts" },
        ],
      },
      {
        heading: "Tournaments",
        links: [
          { label: "Court Hub Open", href: "#tournaments" },
          { label: "Register to Play", href: "#tournaments" },
          { label: "Past Events", href: "#tournaments" },
          { label: "Sponsorship", href: "#tournaments" },
          { label: "Rankings", href: "#tournaments" },
        ],
      },
    ],
    social: [
      { label: "Instagram", href: "https://instagram.com/courthubgroup" },
      { label: "WhatsApp", href: "https://wa.me/971500000000" },
    ],
    legal: "© 2025 Court Hub Group · courthub.ae · All rights reserved.",
  },

} as const;
