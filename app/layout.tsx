import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aliverso — Shared Universe Gallery",
  description: "A shared universe web application celebrating moments, photos, and memories centered on Ali.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-muted/20">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 Aliverso. Celebrating shared universe moments.</p>
              <p>Powered by Next.js, Vercel Blob & Vercel Postgres</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
