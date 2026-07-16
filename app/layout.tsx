import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import Footer from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://dw-event-co.vercel.app";
const SITE_NAME = "DW Event Co";
const DEFAULT_DESCRIPTION =
  "Party and event equipment rentals delivered to Keller, Southlake, Colleyville, Trophy Club, Fort Worth, and surrounding DFW areas. Tables, chairs & more — book online in minutes with $25 flat delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DW Event Co | Party & Event Rentals in Keller, TX",
    template: "%s | DW Event Co",
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon-badge.png",
    apple: "/favicon-badge.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "DW Event Co | Party & Event Rentals in Keller, TX",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DW Event Co — Party & Event Rentals serving Keller, Southlake, Colleyville, Trophy Club, and Fort Worth, TX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DW Event Co | Party & Event Rentals in Keller, TX",
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocalBusinessSchema />
        {children}
        <Footer />
      </body>
    </html>
  );
}
