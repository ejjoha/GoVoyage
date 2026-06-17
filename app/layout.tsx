import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import RegisterServiceWorker from "./register-service-worker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GoVoyage",
  description: "Plan it. See it. Enjoy it.",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    title: "GoVoyage",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#F6F1E9",
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
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <RegisterServiceWorker />
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}