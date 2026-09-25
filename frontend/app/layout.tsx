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

                {/* Bottom row: copyright + subtle developer credit */}
                <div
                  className="pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "rgba(240,244,255,0.25)",
                    letterSpacing: "0.10em",
                  }}
                >
                  <span>© 2025 Skywin Aeronautics Industry. All rights reserved.</span>

                  <a
                    href="https://www.linkedin.com/in/naol-zewdie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white/60 w-fit"
                    style={{ color: "rgba(240,244,255,0.20)" }}
                  >
                    <span>made with love by Naol</span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="opacity-70"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.65 1.66 1.66 0 0 0 1.65-1.65c0-.92-.74-1.66-1.65-1.66Z" />
                    </svg>
                  </a>

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
