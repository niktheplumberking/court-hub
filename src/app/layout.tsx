import type { Metadata, Viewport } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Court Hub Group — UAE's Premium Padel Platform",
  description:
    "Equipment. Courts. Tournaments. The home of premium padel in the UAE. HEAD and Wilson authorized retailer, court construction, and tournament organization.",
  metadataBase: new URL("https://courthub.ae"),
};

export const viewport: Viewport = {
  themeColor: "#0E0E0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivoBlack.variable} antialiased`}
    >
      <body className="min-h-dvh bg-ink text-white">{children}</body>
    </html>
  );
}
