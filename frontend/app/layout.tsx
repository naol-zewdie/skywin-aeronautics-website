import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Container from "./components/Container";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skywin Aeronautics",
  description:
    "Skywin Aeronautics corporate website for aerospace engineering, design, manufacturing, and consulting services.",
  icons: {
    icon: "/skywin_logo.png",
  },
  openGraph: {
    title: "Skywin Aeronautics",
    description: "Aerospace engineering, design, manufacturing, and consulting services.",
    siteName: "Skywin Aeronautics",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#23364F",
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-[color:var(--background)] text-[color:var(--foreground)]">
        <Navbar />
        <div className="flex min-h-[calc(100vh-72px)] flex-col">{children}</div>
          <footer className="relative overflow-hidden border-t border-[color:var(--border)] bg-[color:var(--primary)]">
            {/* Decorative background inspired by the illustration (no direct image use) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
              <div
                className="absolute -top-16 left-0 w-full h-64 opacity-30"
                style={{
                  background:
                    'radial-gradient(circle at 10% 20%, rgba(35,54,79,0.18), transparent 25%), radial-gradient(circle at 90% 80%, rgba(69,87,109,0.12), transparent 25%)',
                  mixBlendMode: 'overlay',
                }}
              />
              <svg
                className="absolute bottom-0 left-0 w-full h-28"
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="#23364F" />
                    <stop offset="1" stopColor="#45576D" />
                  </linearGradient>
                </defs>
                <path d="M0,40 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="url(#g1)" opacity="0.45" />
              </svg>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(35,54,79,0.9), rgba(69,87,109,0.35), transparent)' }} />
            </div>
          <Container>
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-sm py-8 dark:pt-4 dark:pb-8 footer-text">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">© 2026 Skywin Aeronautics. All rights reserved.</span>
                  <span className="text-xs">Designed for aerospace organizations seeking precision and reliability.</span>
                </div>

                <nav className="hidden sm:flex gap-6 text-sm footer-text">
                  <Link href="/about" className="hover:underline">About</Link>
                  <Link href="/services" className="hover:underline">Services</Link>
                  <Link href="/careers" className="hover:underline">Careers</Link>
                  <Link href="/contact" className="hover:underline">Contact</Link>
                </nav>
              </div>
            </div>
          </Container>
        </footer>
      </body>
    </html>
  );
}
