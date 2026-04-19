import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AnimeWatch Hymn",
  description: "A dark anime streaming interface with provider fallback, search, detail pages, and a Vidstack player."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
