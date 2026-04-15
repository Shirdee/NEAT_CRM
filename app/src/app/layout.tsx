import type {Metadata, Viewport} from "next";
import {Inter, Manrope} from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CRM Foundation",
  description: "Sprint 1 application shell for the bilingual CRM foundation."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
