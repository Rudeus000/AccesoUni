import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AccesoUni — Accesibilidad web para universidades",
  description:
    "Sistema SaaS de accesibilidad para portales universitarios. WCAG 2.1 AA, voz, perfiles visuales. ERS v2.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#contenido"
          className="absolute left-[-9999px] z-[200] rounded-br-lg bg-teal px-4 py-3 font-semibold text-white focus:left-0 focus:top-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-400"
        >
          Saltar al contenido principal
        </a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
