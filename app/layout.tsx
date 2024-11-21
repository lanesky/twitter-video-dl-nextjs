import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Twitter Video Downloader - Download Twitter Videos Easily",
  description: "Free online tool to download videos from Twitter/X. Save and share Twitter videos in high quality MP4 format with just one click.",
  keywords: ["twitter video downloader", "download twitter videos", "twitter mp4 download", "save twitter videos", "x video downloader"],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Twitter Video Downloader - Download Twitter Videos Easily",
    description: "Free online tool to download videos from Twitter/X. Save and share Twitter videos in high quality MP4 format with just one click.",
    type: "website",
    locale: "en_US",
    siteName: "Twitter Video Downloader"
  },
  twitter: {
    card: "summary_large_image",
    title: "Twitter Video Downloader - Download Twitter Videos Easily",
    description: "Free online tool to download videos from Twitter/X. Save and share Twitter videos in high quality MP4 format with just one click."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Add your Google verification code here
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
