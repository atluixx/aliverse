import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Aliverso — Shared Universe Gallery",
  description: "A warm, editorial shared universe web application celebrating moments, photos, and memories centered on Ali.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-8 text-center text-xs text-muted-foreground bg-muted/30">
            <div className="container max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-serif text-sm">Aliverso — Celebrating shared universe moments.</p>
              <p className="text-muted-foreground">Powered by Next.js, Vercel Blob & Vercel Postgres</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
