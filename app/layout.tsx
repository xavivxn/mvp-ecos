import { Fraunces, Manrope } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VisitBeacon } from "@/components/VisitBeacon";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ecos · Intención de voto",
  description:
    "Encuesta ciudadana de intención de voto para las municipales 2026. No es un resultado oficial del TSJE.",
  applicationName: "Ecos",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#10261c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink text-cream">
        <VisitBeacon />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
