import type {Metadata, Viewport} from "next";

import "./globals.css";

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
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
