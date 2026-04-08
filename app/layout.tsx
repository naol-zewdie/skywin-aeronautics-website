import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import Container from "./components/Container";
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
  title: "Skywin Aeronautics",
  description:
    "Skywin Aeronautics corporate website for aerospace engineering, design, manufacturing, and consulting services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[color:var(--background)] text-[color:var(--foreground)]">
        <Navbar />
        <div className="flex min-h-[calc(100vh-72px)] flex-col">{children}</div>
        <footer className="border-t border-[color:var(--border)] bg-[color:var(--background)]">
          <Container>
            <div className="flex flex-col gap-4 py-8 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Skywin Aeronautics. All rights reserved.</p>
              <p>Designed for aerospace organizations seeking precision and reliability.</p>
            </div>
          </Container>
        </footer>
      </body>
    </html>
  );
}
