import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "AuctionWithMe | No-Loss Auction Protocol",
  description:
    "Decentralized no-loss auctions on Stellar Soroban with automatic refunds and luxury-grade UX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('auctionwithme-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${playfair.variable} ${spaceGrotesk.variable} theme-bg font-sans antialiased`}
      >
        <AppProviders>
          <Header />
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
