import type { Metadata } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/i18n-provider";
import PrivyAppProvider from "@/components/providers/privy-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Bido — Real-Time Intent Auctions for AI Agents",
  description:
    "Bido enables real-time intent auctions inside AI agents, injecting sponsored context at decision-time and monetizing reasoning with onchain micropayments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider>
          <I18nProvider>
            <PrivyAppProvider>{children}</PrivyAppProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
