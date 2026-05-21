export type TournamentEvent = {
  id: string;
  name: string;
  date: string; // ISO 8601
  location: string;
  status: "upcoming" | "past";
  winner?: string;
  image?: string;
};

// "Today" reference: 2026-05-13. The next event is in roughly six weeks.
export const upcomingEvent: TournamentEvent = {
  id: "ch-open-2026",
  name: "Court Hub Open 2026",
  date: "2026-06-28T18:00:00+04:00",
  location: "Dubai · Court Hub Arena",
  status: "upcoming",
};

export const pastEvents: TournamentEvent[] = [
  {
    id: "spring-cup-2026",
    name: "Spring Cup",
    date: "2026-03-15T18:00:00+04:00",
    location: "Abu Dhabi",
    status: "past",
    winner: "Tapia / Coello",
    image: "/images/opponent-swing.png",
  },
  {
    id: "winter-classic-2026",
    name: "Winter Classic",
    date: "2026-01-24T18:00:00+04:00",
    location: "Dubai Marina",
    status: "past",
    winner: "Galán / Lebrón",
    image: "/images/opponent-neutral.png",
  },
  {
    id: "autumn-shootout-2025",
    name: "Autumn Shootout",
    date: "2025-11-08T18:00:00+04:00",
    location: "Sharjah",
    status: "past",
    winner: "Stupaczuk / Di Nenno",
    image: "/images/opponent-miss.png",
  },
];

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
