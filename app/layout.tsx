import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND_ICON_VERSION } from "@/lib/brand";
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
  metadataBase: new URL("https://family-care-beta.vercel.app"),
  title: "FamilyCare",
  description: "Shared care coordination for families",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FamilyCare",
  },
  icons: {
    icon: `/icons/icon-192.png?v=${BRAND_ICON_VERSION}`,
    apple: `/icons/icon-512.png?v=${BRAND_ICON_VERSION}`,
  },
  openGraph: {
    title: "FamilyCare",
    description: "Shared care coordination for families",
    images: [`/icons/icon-512.png?v=${BRAND_ICON_VERSION}`],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
