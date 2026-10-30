import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { GlassNav } from "@/components/site/GlassNav";
import { Footer } from "@/components/site/Footer";
import { getPortfolio } from "@/lib/content/portfolio";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${profile.name} · Portfolio`, template: `%s · ${profile.name}` },
    description: profile.positioning,
    openGraph: { type: "website", siteName: `${profile.name} · Portfolio` },
  };
}

export const viewport: Viewport = { themeColor: "#05070f" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getPortfolio();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-space-2 focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <GlassNav name={profile.name} />
        <main id="main">{children}</main>
        <Footer profile={profile} />
        <ChatLauncher />
      </body>
    </html>
  );
}
