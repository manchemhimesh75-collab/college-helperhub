import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "College Academic Hub | Find, Share & Personalize Study Resources",
    template: "%s | College Academic Hub",
  },
  description: "Your college's academic resource hub. Find practicals, assignments, notes, and study materials. Personalize documents with your details and download as DOCX or PDF.",
  keywords: ["college", "academic", "resources", "practicals", "assignments", "notes", "study materials", "DOCX", "PDF", "students"],
  authors: [{ name: "College Academic Hub" }],
  creator: "College Academic Hub",
  publisher: "College Academic Hub",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://college-academic-hub.com",
    siteName: "College Academic Hub",
    title: "College Academic Hub | Find, Share & Personalize Study Resources",
    description: "Your college's academic resource hub. Find practicals, assignments, notes, and study materials.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "College Academic Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "College Academic Hub",
    description: "Your college's academic resource hub. Find practicals, assignments, notes, and study materials.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}