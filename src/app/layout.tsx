import type { Metadata } from "next";
import { Amiri, Cormorant_Garamond, Geist_Mono, Great_Vibes } from "next/font/google";
import { wedding } from "@/data/wedding";
import "./globals.css";

const displaySerif = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

const arabic = Amiri({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${wedding.groom.name} & ${wedding.bride.name} · Nikah & Valima`,
  description: `${wedding.groom.name} & ${wedding.bride.name} invite you to their Nikah on ${wedding.nikah.date} and Valima on ${wedding.valima.date} in ${wedding.city}. Scroll through the story and send your RSVP.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displaySerif.variable} ${script.variable} ${arabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
