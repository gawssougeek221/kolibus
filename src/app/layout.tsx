import type { Metadata, Viewport } from "next";
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
  title: "KoliBus — Réserver. Suivre. Récupérer.",
  description:
    "KoliBus : transport de colis par Tata et transporteurs partenaires au Sénégal. Pilote sur la ligne Keur Massar ⇄ Pikine — réservation, suivi GPS en temps réel et retrait sécurisé par code.",
  keywords: ["KoliBus", "colis", "Sénégal", "Tata", "Keur Massar", "Pikine", "suivi GPS"],
  authors: [{ name: "KoliBus" }],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand/kb-icon.png" },
  openGraph: {
    title: "KoliBus — Réserver. Suivre. Récupérer.",
    description:
      "Transport de colis par Tata au Sénégal : réservez, suivez le véhicule en temps réel, récupérez avec un code sécurisé.",
    siteName: "KoliBus",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#123D33",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
