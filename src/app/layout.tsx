import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Heart, Github } from "lucide-react";
import { QueryProvider } from "@/lib/query-client";
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
  title: "Haz que Daniel Bilbao sea juez | IA Hackathon Colombia",
  description: "Firma en 10 segundos para que Daniel Bilbao sea juez en el IA Hackathon de Colombia TechFest. Meta: 5,000 firmas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <header className="bg-white border-b border-black/10 relative">
            <div className="max-w-2xl mx-auto px-4 py-2 border-x border-black/10">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-black/60 tracking-wider">
                  IA HACKATHON — COLOMBIA TECHFEST
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-black/40 tracking-wider">
                    POWERED BY
                  </span>
                  <Image
                    src="/zapsign-logo.png"
                    alt="ZapSign"
                    width={60}
                    height={16}
                    className="h-4 w-auto opacity-70"
                  />
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-screen bg-white relative">
            {/* Vertical grid lines spanning full height */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="max-w-2xl mx-auto h-full border-x border-black/10"></div>
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </main>
        
        <footer className="bg-white border-t border-black/10 relative">
          <div className="max-w-2xl mx-auto px-4 py-6 border-x border-black/10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-black/60">
                  Made with 
                </span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                <span className="text-sm text-black/60">
                  by <Link href="https://www.linkedin.com/company/letsacc/" className="underline hover:text-black/80 transition-colors duration-200 cursor-pointer" target="_blank">ACC</Link>
                </span>
              </div>
              
              <div>
                <Link href="https://github.com/camilocbarrera/zap-sign" className="text-black/60 hover:text-black/80 transition-colors duration-200 cursor-pointer" target="_blank">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
