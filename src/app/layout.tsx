import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shenzhen-bay.psyverse.fun"),
  title: "Shenzhen Bay Protocol | 深圳湾行动",
  description:
    "A fictional cinematic tactical action concept set in a near-future cyberpunk Shenzhen Bay. Drones, plasma rifles, holographic missions — designed as an AAA game landing page, not a real product.",
  keywords: [
    "Shenzhen Bay Protocol",
    "深圳湾行动",
    "cyberpunk game",
    "tactical action",
    "AAA concept",
    "sci-fi shooter",
    "drone combat",
    "Psyverse",
  ],
  authors: [{ name: "Gewenbo", url: "https://psyverse.fun" }],
  alternates: {
    canonical: "/",
    languages: { en: "/", "zh-CN": "/", "x-default": "/" },
  },
  openGraph: {
    title: "Shenzhen Bay Protocol · 深圳湾行动",
    description:
      "High-tech operations in a future megacity. A fictional AAA cyberpunk tactical concept.",
    url: "https://shenzhen-bay.psyverse.fun/",
    siteName: "Psyverse",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shenzhen Bay Protocol · 深圳湾行动",
    description: "Cinematic cyberpunk tactical concept set in near-future Shenzhen Bay.",
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#03050d" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=ZCOOL+XiaoWei&family=Noto+Sans+SC:wght@300;400;500;700&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="nightbay-field" aria-hidden />
        <div className="tac-grid" aria-hidden />
        {children}
        <Script
          src="https://analytics-dashboard-two-blue.vercel.app/tracker.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
