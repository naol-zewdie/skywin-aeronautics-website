"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";
import { getServices, getProducts, FrontendService, FrontendProduct } from "../../lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", hasDropdown: true },
  { href: "/products", label: "Products", hasDropdown: true },
  { href: "/insights", label: "Insights", hasDropdown: true },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [services, setServices] = useState<FrontendService[]>([]);
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [insightsDropdown, setInsightsDropdown] = useState(false);

  const fetchedRef = useRef({ services: false, products: false });

  const fetchServices = async () => {
    if (fetchedRef.current.services || services.length > 0) return;
    fetchedRef.current.services = true;
    try {
      setServices(await getServices());
    } catch {
      setServices([]);
    }
  };

  const fetchProducts = async () => {
    if (fetchedRef.current.products || products.length > 0) return;
    fetchedRef.current.products = true;
    try {
      setProducts(await getProducts());
    } catch {
      setProducts([]);
    }
  };

  return (
    <header
      className="fixed z-50"
      style={{
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 48px)",
        maxWidth: "1100px",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(8, 10, 18, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "100px",
          border: "1px solid rgba(56,189,248,0.14)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
          {/* ── Brand / Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-all duration-300 flex-shrink-0"
            aria-label="Home"
          >
            <Image
              src="/website_images/logo svg.png"
              alt="Skywin Aeronautics logo"
              width={450 * 4}
              height={100 * 4}
              className="h-10 w-auto object-contain"
              priority
            />
            {/* 4 indicator dots — weevolveit style */}
            <span className="sr-only">Skywin Aeronautics</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav
            id="primary-navigation"
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1"
          >
            <ul
              className="flex flex-row items-center gap-1 text-xs"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.10em" }}
            >
              {navLinks.map((link) => (
                <li key={link.href} className="relative">
                  {link.hasDropdown && link.label === "Services" ? (
                    <div
                      className="relative"
                      onMouseEnter={() => { fetchServices(); setServicesDropdown(true); }}
                      onMouseLeave={() => setServicesDropdown(false)}
                    >
                      <button
                        className="flex items-center gap-1 px-3 py-2 rounded-full uppercase transition-all duration-200"
                        style={{ color: "rgba(240,244,255,0.50)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.50)")}
                        onClick={() => setServicesDropdown(!servicesDropdown)}
                      >
                        {link.label}
                        <svg className={`w-3 h-3 transition-transform duration-200 ${servicesDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {servicesDropdown && (
                        <div className="absolute top-full left-0 pt-3 w-56 z-50">
                          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(8,10,18,0.95)", border: "1px solid rgba(56,189,248,0.15)", backdropFilter: "blur(20px)" }}>
                            <div className="py-2">
                              {services.map((service) => (
                              <Link
                                key={service.title}
                                href="/services"
                                className="block px-4 py-2.5 text-xs uppercase transition-colors duration-200"
                                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", color: "rgba(240,244,255,0.45)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.45)")}
                                onClick={() => { setServicesDropdown(false); setIsOpen(false); }}
                              >
                                {service.title}
                              </Link>
                            ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : link.hasDropdown && link.label === "Products" ? (
                    <div
                      className="relative"
                      onMouseEnter={() => { fetchProducts(); setProductsDropdown(true); }}
                      onMouseLeave={() => setProductsDropdown(false)}
                    >
                      <button
                        className="flex items-center gap-1 px-3 py-2 uppercase transition-all duration-200"
                        style={{ color: "rgba(240,244,255,0.50)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.50)")}
                        onClick={() => setProductsDropdown(!productsDropdown)}
                      >
                        {link.label}
                        <svg className={`w-3 h-3 transition-transform duration-200 ${productsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {productsDropdown && (
                        <div className="absolute top-full left-0 pt-3 w-56 z-50">
                          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(8,10,18,0.95)", border: "1px solid rgba(56,189,248,0.15)", backdropFilter: "blur(20px)" }}>
                            <div className="py-2">
                              {products.map((product) => (
                              <Link
                                key={product.title}
                                href={`/products?selected=${encodeURIComponent(product.title)}`}
                                className="block px-4 py-2.5 text-xs uppercase transition-colors duration-200"
                                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", color: "rgba(240,244,255,0.45)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.45)")}
                                onClick={() => { setProductsDropdown(false); setIsOpen(false); }}
                              >
                                {product.title}
                              </Link>
                            ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : link.hasDropdown && link.label === "Insights" ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setInsightsDropdown(true)}
                      onMouseLeave={() => setInsightsDropdown(false)}
                    >
                      <button
                        className="flex items-center gap-1 px-3 py-2 uppercase transition-all duration-200"
                        style={{ color: "rgba(240,244,255,0.50)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.50)")}
                        onClick={() => setInsightsDropdown(!insightsDropdown)}
                      >
                        {link.label}
                        <svg className={`w-3 h-3 transition-transform duration-200 ${insightsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {insightsDropdown && (
                        <div className="absolute top-full left-0 pt-3 w-44 z-50">
                          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(8,10,18,0.95)", border: "1px solid rgba(56,189,248,0.15)", backdropFilter: "blur(20px)" }}>
                            <div className="py-2">
                              {[{href:"/insights/news",label:"News"},{href:"/insights/blog",label:"Blog"},{href:"/insights/events",label:"Events"}].map(item => (
                                <Link key={item.href} href={item.href}
                                  className="block px-4 py-2.5 text-xs uppercase transition-colors duration-200"
                                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", color: "rgba(240,244,255,0.45)" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.45)")}
                                  onClick={() => { setInsightsDropdown(false); setIsOpen(false); }}
                                >{item.label}</Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="px-3 py-2 uppercase transition-all duration-200"
                      style={{ color: "rgba(240,244,255,0.50)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,244,255,0.50)")}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Right: Contact pill button + dark mode toggle ── */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs uppercase transition-all duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
                color: "rgba(240,244,255,0.70)",
                border: "1px solid rgba(56,189,248,0.30)",
                borderRadius: "100px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#38bdf8";
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.background = "rgba(56,189,248,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(240,244,255,0.70)";
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.30)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              Contact us
            </Link>
            <DarkModeToggle />
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
              style={{ border: "1px solid rgba(56,189,248,0.25)", color: "rgba(240,244,255,0.7)" }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
                )}
              </svg>
            </button>
          </div>{/* closes right-side flex group */}
        </div>{/* closes pill glass wrapper */}

      {/* Mobile dropdown nav — inside header, below the pill */}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`absolute inset-x-0 top-full z-20 mt-3 overflow-hidden rounded-3xl md:hidden ${
          isOpen
            ? "max-h-[700px] opacity-100 pointer-events-auto"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(8,10,18,0.96)",
          border: isOpen ? "1px solid rgba(56,189,248,0.15)" : "none",
          backdropFilter: "blur(24px)",
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <ul className="flex flex-col gap-4 text-base font-medium text-[color:var(--muted)]">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.hasDropdown && link.label === "Services" ? (
                <div>
                    <button
                      className="w-full text-left transition hover:text-[color:var(--primary)] flex items-center justify-between"
                      onClick={() => { fetchServices(); setServicesDropdown(!servicesDropdown); }}
                    >
                      {link.label}
                      <svg
                      className={`w-4 h-4 transition-transform duration-200 ${servicesDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {servicesDropdown && (
                    <div className="mt-2 ml-4 space-y-1">
                      {services.map((service) => (
                        <Link
                          key={service.title}
                          href="/services"
                          className="block px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] rounded-lg transition-colors duration-200"
                          onClick={() => {
                            setServicesDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          {service.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : link.hasDropdown && link.label === "Products" ? (
                <div>
                    <button
                      className="w-full text-left transition hover:text-[color:var(--primary)] flex items-center justify-between"
                      onClick={() => { fetchProducts(); setProductsDropdown(!productsDropdown); }}
                    >
                      {link.label}
                      <svg
                      className={`w-4 h-4 transition-transform duration-200 ${productsDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {productsDropdown && (
                    <div className="mt-2 ml-4 space-y-1">
                      {products.map((product) => (
                        <Link
                          key={product.title}
                          href={`/products?selected=${encodeURIComponent(product.title)}`}
                          className="block px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] rounded-lg transition-colors duration-200"
                          onClick={() => {
                            setProductsDropdown(false);
                            setIsOpen(false);
                          }}
                        >
                          {product.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : link.hasDropdown && link.label === "Insights" ? (
                <div>
                  <button
                    className="w-full text-left transition hover:text-[color:var(--primary)] flex items-center justify-between"
                    onClick={() => setInsightsDropdown(!insightsDropdown)}
                  >
                    {link.label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${insightsDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {insightsDropdown && (
                    <div className="mt-2 ml-4 space-y-1">
                      <Link
                        href="/insights/news"
                        className="block px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setInsightsDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        News
                      </Link>
                      <Link
                        href="/insights/blog"
                        className="block px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setInsightsDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Blog
                      </Link>
                      <Link
                        href="/insights/events"
                        className="block px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setInsightsDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Events
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={link.href}
                  className="transition hover:text-[color:var(--primary)] w-full text-left"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}