import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Multi Tool",
  description: "A collection of clean, fast utilities — CPM Calculator, Zip Finder, CSV Splitter.",
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
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-semibold">
                M
              </span>
              <span className="text-lg font-semibold tracking-tight">Multi Tool</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-muted">
              <Link href="/cpm-calculator" className="hover:text-foreground transition">
                Cpm Calculator
              </Link>
              <Link href="/zip-finder" className="hover:text-foreground transition">
                Zip Finder
              </Link>
              <Link href="/csv-splitter" className="hover:text-foreground transition">
                Csv Splitter
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted">
            Built with Next.js — clean, fast, free.
          </div>
        </footer>
      </body>
    </html>
  );
}
