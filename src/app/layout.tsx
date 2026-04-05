import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "👟 Premium Core Recommender",
  description: "Find your perfect running shoe from our ultimate database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-50 selection:bg-cyan-500/30 selection:text-cyan-50`}>
        {children}
      </body>
    </html>
  );
}
