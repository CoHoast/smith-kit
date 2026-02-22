import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmithKit — Dashboard",
  description: "AI-powered dev tools dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
