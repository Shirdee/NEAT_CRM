import type {Metadata, Viewport} from "next";
import {ClerkProvider} from "@clerk/nextjs";
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
  title: "CRM",
  description: "Internal bilingual CRM for daily sales work and follow-ups.",
  icons: {
    icon: [
      {url: "/favicon.ico"},
      {url: "/favicon-16x16.png", sizes: "16x16", type: "image/png"},
      {url: "/favicon-32x32.png", sizes: "32x32", type: "image/png"},
      {url: "/favicon-96x96.png", sizes: "96x96", type: "image/png"}
    ]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const hasClerkProvider = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());

  return (
    <html className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>{hasClerkProvider ? <ClerkProvider>{children}</ClerkProvider> : children}</body>
    </html>
  );
}
