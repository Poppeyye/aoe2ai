import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AoE2.ai | AI Tools for Age of Empires II Players",
  description:
    "Scout opponents, analyze matchups, understand your replays, and turn game knowledge into practical decisions fast.",
  openGraph: {
    title: "AoE2.ai",
    description: "Your AI advantage for Age of Empires II",
    url: "https://aoe2.ai",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
