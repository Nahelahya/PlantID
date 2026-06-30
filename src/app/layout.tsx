import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PlantID - Identifikasi Tanaman",
  description: "Aplikasi identifikasi tanaman, deteksi kesehatan, persebaran, dan panduan perawatan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-green-700 hover:text-green-800">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              PlantID
            </a>
            <nav className="flex items-center gap-4 ml-auto text-sm font-medium text-zinc-600">
              <a href="/" className="hover:text-green-700 transition-colors">Beranda</a>
              <a href="/plants" className="hover:text-green-700 transition-colors">Tanaman</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-500">
          <div className="max-w-6xl mx-auto px-4">
            &copy; {new Date().getFullYear()} PlantID - Aplikasi Identifikasi Tanaman
          </div>
        </footer>
      </body>
    </html>
  );
}
