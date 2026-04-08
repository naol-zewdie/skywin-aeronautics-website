"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

// Smooth scroll to top function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
        <Link 
          href="/" 
          onClick={scrollToTop}
          className="flex items-center gap-3 transition hover:opacity-80"
          aria-label="Scroll to top"
        >
          <Image
            src="/skywin_logo.jpg"
            alt="Skywin Aeronautics logo"
            width={300}
            height={67}
            className="h-16 w-auto object-contain"
          />
          <span className="sr-only">Skywin Aeronautics</span>
        </Link>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className="hidden md:flex items-center justify-center flex-1"
        >
          <ul className="flex flex-row items-center gap-6 text-sm font-medium text-[color:var(--muted)]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-[color:var(--primary)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="flex items-center gap-4 md:hidden">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="primary-navigation"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="7" x2="21" y2="7" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="17" x2="21" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        id="primary-navigation"
        aria-label="Primary navigation"
        className={`absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] px-6 shadow-lg transition-all duration-300 ease-out md:hidden ${
          isOpen
            ? "max-h-[400px] opacity-100 pointer-events-auto py-5"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-4 text-sm font-medium text-[color:var(--muted)]">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition hover:text-[color:var(--primary)] w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
