import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { KineticExperience } from "./KineticExperience";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kabir-marwaha-portfolio.hotwheelers11.chatgpt.site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kabir Marwaha Portfolio",
  description:
    "An interactive WebGPU and WebGL portfolio for Kabir Marwaha, a New York-based computer science and AI student building automation, data, and systems software.",
  openGraph: {
    title: "Kabir Marwaha Portfolio",
    description: "Interactive software engineering, automation, data, and AI work by Kabir Marwaha.",
    url: "/",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 908, alt: "Kabir Marwaha — Systems in Motion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kabir Marwaha Portfolio",
    description: "Interactive software engineering, automation, data, and AI work by Kabir Marwaha.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <KineticExperience />
        {children}
      </body>
    </html>
  );
}
