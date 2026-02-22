import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmithKit — AI-Powered Dev Tools",
  description: "Changelogs, uptime monitoring, commit bots, and more. AI-powered dev tools in one dashboard. $39/mo for everything.",
  keywords: ["developer tools", "AI dev tools", "changelog", "uptime monitoring", "commit bot", "dev platform"],
  openGraph: {
    title: "SmithKit — AI-Powered Dev Tools",
    description: "Stop paying $500/mo for dev tools. Get AI-powered tools for $39/mo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
