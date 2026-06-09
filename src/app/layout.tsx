import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
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
  title: "OF Ranking · Human Authenticity First",
  description:
    "Editorial rankings of real OnlyFans creators by estimated Human Authenticity Score — built from public data only.",
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
      <body className="flex min-h-full flex-col">
        <Navigation />
        {children}
        <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
          <p>
            Creator profiles use publicly available marketing information only
            (social bios, promo pages, press). We do not scrape OnlyFans or use
            paywalled content.
          </p>
          <p className="mt-2">
            Rankings and authenticity scores are editorial estimates — not
            verified audits. Not affiliated with OnlyFans.
          </p>
        </footer>
      </body>
    </html>
  );
}
