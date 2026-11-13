import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ScrollBackground from "@/components/ScrollBackground";
import { ContentProvider } from "@/components/ContentProvider";
import { API_URL, getContent } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CursorGlow, Preloader, WhatsAppFloat } from "@/components/Extras";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", weight: ["400", "600", "700", "800"] });
const instrument = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["normal", "italic"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"] });

/** Adresse publique du site (Vercel la fournit automatiquement en production) */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Hostella Agency",
  appleWebApp: { capable: true, title: "Hostella", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  title: {
    default: "Hostella Agency — Hôtesses événementielles à Bobo-Dioulasso",
    template: "%s · Hostella Agency",
  },
  description:
    "Hostella Agency : hôtesses d'accueil, protocole, service en réception et organisation d'événements à Bobo-Dioulasso et au Burkina Faso. Le charme de l'accueil.",
  keywords: ["hôtesses", "Bobo-Dioulasso", "Burkina Faso", "événementiel", "protocole", "mariage", "conférence", "Hostella"],
  openGraph: {
    title: "Hostella Agency — Le charme de l'accueil",
    description: "Hôtesses événementielles & organisation d'événements au Burkina Faso.",
    images: ["/images/equipe-hotesses.jpg"],
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#120509",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // utilise tout l'écran des iPhone à encoche (zones sûres gérées en CSS)
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const content = await getContent();
  return (
    <html lang="fr" className={`${bricolage.variable} ${instrument.variable} ${manrope.variable} antialiased`}>
      <body className="grain">
        <ContentProvider value={{ ...content, apiUrl: API_URL }}>
          <Providers>
            <ScrollBackground />
            <Preloader />
            <CursorGlow />
            <Header />
            <main className="relative">{children}</main>
            <Footer />
            <WhatsAppFloat />
          </Providers>
        </ContentProvider>
      </body>
    </html>
  );
}
