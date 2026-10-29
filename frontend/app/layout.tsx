import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "HASTKATHA — Stories Woven by Hand",
  description: "Discover, empower and preserve India's traditional crafts.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteHeader />{children}</body>
    </html>
  );
}
