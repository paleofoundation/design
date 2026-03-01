import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dzyne.app"),
  title: "dzyne — Design systems for AI-powered builds",
  description:
    "Stop your AI from building ugly apps. dzyne captures your design intent and enforces it across every AI coding session — fonts, colors, spacing, components, all on-brand.",
  icons: {
    icon: [
      { url: "/assets/favicon/favicon.svg", type: "image/svg+xml" },
      {
        url: "/assets/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: "/assets/favicon/apple-touch-icon.png",
  },
  manifest: "/assets/favicon/site.webmanifest",
  openGraph: {
    title: "dzyne — Design systems for AI-powered builds",
    description:
      "Stop your AI from building ugly apps. dzyne captures your design intent and enforces it across every AI coding session.",
    siteName: "dzyne",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "dzyne — Design systems for AI-powered builds",
    description:
      "Stop your AI from building ugly apps. dzyne captures your design intent and enforces it across every AI coding session.",
  },
  keywords: [
    "design system generator",
    "AI design consistency",
    "design tokens",
    "MCP design tools",
    "Cursor design system",
    "AI web design",
    "design system for developers",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'dzyne',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  url: 'https://www.dzyne.app',
  description:
    'Design systems for AI-powered builds. Captures your design intent and enforces it across every AI coding session.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free during beta',
  },
  creator: {
    '@type': 'Organization',
    name: 'dzyne',
    url: 'https://www.dzyne.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="stylesheet" href="/assets/animations/cursor-follower.css" />
        <link rel="stylesheet" href="/assets/animations/button-states.css" />
        <link rel="stylesheet" href="/assets/animations/scroll-reveal.css" />
        <link rel="stylesheet" href="/assets/animations/loading-spinner.css" />
        <link rel="stylesheet" href="/assets/animations/glow-pulse.css" />
      </head>
      <body
        className={`${fraunces.variable} ${sourceSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <PostHogProvider />
        </Suspense>
        {children}
        <Script src="/assets/animations/cursor-follower.js" strategy="lazyOnload" />
        <Script src="/assets/animations/scroll-reveal.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
