import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import Link from "next/link";
import { JetBrains_Mono, Syne, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import Container from "./components/Container";
import {
  FluidBackground,
  LoadingScreen,
  ScrollProgress,
} from "./components/ClientComponents";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-header",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skywin Aeronautics",
  description:
    "Skywin Aeronautics — Precision UAV manufacturing, aerospace engineering, design, and consulting from Addis Ababa.",
  icons: {
    icon: "/skywin_logo.png",
  },
  openGraph: {
    title: "Skywin Aeronautics",
    description: "Precision UAV manufacturing and aerospace engineering from Ethiopia.",
    siteName: "Skywin Aeronautics",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-[color:var(--foreground)]">
        {/* Dark mode detection — must run before hydration */}
        <Script
          id="dark-mode-init"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('dark')`,
          }}
        />
        {/* ── WebGL + Loading ── */}
        <LoadingScreen />
        <FluidBackground />

        {/* ── Floating Pill Navbar ── */}
        <Navbar />

        {/* ── Scroll progress (right edge) ── */}
        <ScrollProgress />

        {/* ── Page content ── */}
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}


          {/* ── Footer ── */}
          <footer
            className="relative overflow-hidden border-t"
            style={{ borderColor: "rgba(69,87,109,0.25)", background: "#000000" }}
          >
            {/* Theme accent top border */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #45576D, transparent)" }}
            />

            <Container>
              <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
                {/* Top row: logo + nav */}
                <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between mb-8">
                  <div>
                    <p
                      className="text-white font-bold text-lg tracking-wider"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      SKYWIN
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "rgba(240,244,255,0.30)",
                        letterSpacing: "0.15em",
                        marginTop: "4px",
                      }}
                    >
                      [ AERONAUTICS ]
                    </p>
                  </div>

                  <nav className="flex gap-8" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.12em" }}>
                    {["About", "Services", "Products", "Careers", "Contact"].map((l) => (
                      <Link
                        key={l}
                        href={`/${l.toLowerCase()}`}
                        className="uppercase transition-colors duration-200 hover:text-white"
                        style={{ color: "rgba(232,237,248,0.45)" }}
                      >
                        {l}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Bottom row: copyright */}
                <div
                  className="pt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "rgba(240,244,255,0.25)",
                    letterSpacing: "0.10em",
                  }}
                >
                  <span>© 2025 Skywin Aeronautics Industry. All rights reserved.</span>
                  <span>Addis Ababa, Ethiopia</span>
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </body>
    </html>
  );
}
