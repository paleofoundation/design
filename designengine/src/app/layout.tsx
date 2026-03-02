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
  // TODO: Change to https://refinedesign.ai after DNS configured
  metadataBase: new URL("https://www.dzyne.app"),
  title: "Refine Design — Refine your design.",
  description:
    "The first AI that understands why good design looks good. Refine your design with AI-powered design intelligence.",
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
    title: "Refine Design — Refine your design.",
    description:
      "The first AI that understands why good design looks good. Refine your design with AI-powered design intelligence.",
    siteName: "Refine Design",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Refine Design — Refine your design.",
    description:
      "The first AI that understands why good design looks good. Refine your design with AI-powered design intelligence.",
  },
  keywords: [
    "design system generator",
    "AI design consistency",
    "design tokens",
    "MCP design tools",
    "Cursor design system",
    "AI web design",
    "design system for developers",
    "Refine Design",
    "AI with design taste",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Refine Design',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  // TODO: Change to https://refinedesign.ai after DNS configured
  url: 'https://www.dzyne.app',
  description:
    'AI with design taste. Refine your design with AI-powered design intelligence — typography, spacing, color theory.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free during beta',
  },
  creator: {
    '@type': 'Organization',
    name: 'Refine Design',
    // TODO: Change to https://refinedesign.ai after DNS configured
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
