import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// TODO: re-enable cookie consent banner (indigo, cheeky copy)
// import CookieBanner from "@/components/cookie-banner";

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
    description: "Stop your AI from building ugly apps.",
    siteName: "dzyne",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${sourceSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
