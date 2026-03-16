import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Episode Compare - Rick & Morty",
  description: "Rick and Morty character episode comparison challenge.",
  icons: {
    icon: [
      { url: "/icons8-rick-sanchez-color-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons8-rick-sanchez-color-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons8-rick-sanchez-color-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons8-rick-sanchez-color-120.png", sizes: "120x120", type: "image/png" },
    ],
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
        className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
