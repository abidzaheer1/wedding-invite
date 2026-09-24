/**
 * Single source of truth for everything guest-facing. Edit this file to
 * personalise the invitation — the 3D scenes, overlay text, metadata and RSVP
 * summary all read from here.
 */
export const wedding = {
  groom: {
    name: "Ayaan",
    fullName: "Ayaan Ahmed Khan",
    parents: "son of Mr. & Mrs. Ahmed Khan",
  },
  bride: {
    name: "Zara",
    fullName: "Zara Fatima Siddiqui",
    parents: "daughter of Mr. & Mrs. Imran Siddiqui",
  },
  city: "Hyderabad",
  hashtag: "#AyaanWedsZara",

  nikah: {
    title: "The Nikah",
    date: "Saturday, 12 December 2026",
    time: "11:00 AM",
    venue: "Masjid-e-Noor",
    address: "12 Crescent Road, Banjara Hills, Hyderabad",
    mapUrl: "https://maps.google.com/?q=Masjid-e-Noor+Banjara+Hills+Hyderabad",
    note: "Followed by a Dua and lunch in the courtyard",
  },

  valima: {
    title: "The Valima",
    date: "Sunday, 13 December 2026",
    time: "7:30 PM onwards",
    venue: "Royal Orchid Function Hall",
    address: "Road No. 45, Jubilee Hills, Hyderabad",
    mapUrl: "https://maps.google.com/?q=Royal+Orchid+Function+Hall+Jubilee+Hills+Hyderabad",
    note: "Dinner & celebrations · Formal attire, festive colours welcome",
  },

  rsvpDeadline: "30 November 2026",
} as const;

export type Wedding = typeof wedding;
