"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getServices, getProducts, FrontendService, FrontendProduct } from "../../lib/api";
import NavbarMegaMenu from "./NavbarMegaMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", hasDropdown: true },
  { href: "/products", label: "Products", hasDropdown: true },
  { href: "/insights", label: "Insights", hasDropdown: true },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

/* ── Shared nav-link style helpers ── */
const LINK_BASE: React.CSSProperties = {
  color: "rgba(240,244,255,0.52)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.10em",
  fontSize: "11px",
  textTransform: "uppercase",
  position: "relative",
  textDecoration: "none",
  padding: "6px 12px",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  transition: "color 0.2s ease",
};

/* ── Desktop nav link with white glow + animated underline ── */
function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <>
      <Link href={href} className="nav-pill-link" style={LINK_BASE} onClick={onClick}>
        {children}
      </Link>
      <style>{`
        .nav-pill-link {
          position: relative;
          color: rgba(240,244,255,0.52);
          transition: color 0.2s ease, text-shadow 0.2s ease;
        }
        .nav-pill-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 12px;
          right: 12px;
          height: 1px;
          background: rgba(255,255,255,0.9);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1);
          border-radius: 2px;
        }
        .nav-pill-link:hover {
          color: #ffffff;
          text-shadow: 0 0 12px rgba(255,255,255,0.55), 0 0 24px rgba(255,255,255,0.20);
        }
        .nav-pill-link:hover::after {
          transform: scaleX(1);
        }
        .nav-dropdown-link {
          color: rgba(240,244,255,0.45);
          transition: color 0.18s ease, text-shadow 0.18s ease, background 0.18s ease;
        }
        .nav-dropdown-link:hover {
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255,255,255,0.40);
          background: rgba(255,255,255,0.05) !important;
        }
        .nav-btn-pill {
          color: rgba(240,244,255,0.52);
          transition: color 0.2s ease, text-shadow 0.2s ease;
          position: relative;
        }
        .nav-btn-pill::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 12px;
          right: 12px;
          height: 1px;
          background: rgba(255,255,255,0.9);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1);
          border-radius: 2px;
        }
        .nav-btn-pill:hover {
          color: #ffffff;
          text-shadow: 0 0 12px rgba(255,255,255,0.55), 0 0 24px rgba(255,255,255,0.20);
        }
        .nav-btn-pill:hover::after {
          transform: scaleX(1);
        }
      `}</style>
    </>
  );
}

/* ── Dropdown glass panel for compact menus (e.g. Insights) ── */
function DropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full left-0 pt-3 z-50" style={{ minWidth: "200px" }}>
      <div style={{
        background: "rgba(5, 8, 16, 0.94)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
        overflow: "hidden",
        padding: "8px 0",
      }}>
        {children}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [services, setServices] = useState<FrontendService[]>([]);
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"services" | "products" | "insights" | null>(null);

  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileInsightsOpen, setMobileInsightsOpen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchedRef = useRef({ services: false, products: false });

  useEffect(() => {
    let mounted = true;
    getServices()
      .then((data) => {
        if (mounted && data) {
          fetchedRef.current.services = true;
          setServices(data);
        }
      })
      .catch(() => { });
    getProducts()
      .then((data) => {
        if (mounted && data) {
          fetchedRef.current.products = true;
          setProducts(data);
        }
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, []);

  const fetchServices = async () => {
    if (fetchedRef.current.services || services.length > 0) return;
    fetchedRef.current.services = true;
    try { setServices(await getServices()); } catch { setServices([]); }
  };

  const fetchProducts = async () => {
    if (fetchedRef.current.products || products.length > 0) return;
    fetchedRef.current.products = true;
    try { setProducts(await getProducts()); } catch { setProducts([]); }
  };

  const handleOpenDropdown = (type: "services" | "products" | "insights") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(type);
    if (type === "services") fetchServices();
    if (type === "products") fetchProducts();
  };

  const handleCloseWithDelay = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleCancelClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const dropdownLink = (href: string, label: string, onClose: () => void) => (
    <Link
      key={href + label}
      href={href}
      className="nav-dropdown-link block px-5 py-2.5 text-xs uppercase"
      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      onClick={() => { onClose(); setIsOpen(false); }}
    >
      {label}
    </Link>
  );

  return (
    <header
      className="fixed z-50"
      style={{ top: "20px", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 36px)", maxWidth: "1160px" }}
    >
      {/* ── Pill navbar ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(5, 8, 16, 0.88)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderRadius: "100px",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset",
        }}
      >
        {/* ── Brand / Logo ── */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Home" onClick={() => setActiveDropdown(null)}>
          <Image
            src="/website_images/logo svg.png"
            alt="Skywin Aeronautics logo"
            width={450 * 4}
            height={100 * 4}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="sr-only">Skywin Aeronautics</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav id="primary-navigation" aria-label="Primary navigation" className="hidden md:flex items-center gap-0">
          <ul className="flex flex-row items-center gap-0 text-xs">
            {navLinks.map((link) => (
              <li key={link.href} className="relative">
                {link.hasDropdown && link.label === "Services" ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleOpenDropdown("services")}
                    onMouseLeave={handleCloseWithDelay}
                  >
                    <button
                      className="nav-btn-pill flex items-center gap-1.5 px-3 py-2 uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.10em",
                        fontSize: "11px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: activeDropdown === "services" ? "#ffffff" : undefined,
                      }}
                      onClick={() => activeDropdown === "services" ? setActiveDropdown(null) : handleOpenDropdown("services")}
                    >
                      {link.label}
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "services" ? "rotate-180 text-sky-400" : ""
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                ) : link.hasDropdown && link.label === "Products" ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleOpenDropdown("products")}
                    onMouseLeave={handleCloseWithDelay}
                  >
                    <button
                      className="nav-btn-pill flex items-center gap-1.5 px-3 py-2 uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.10em",
                        fontSize: "11px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: activeDropdown === "products" ? "#ffffff" : undefined,
                      }}
                      onClick={() => activeDropdown === "products" ? setActiveDropdown(null) : handleOpenDropdown("products")}
                    >
                      {link.label}
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "products" ? "rotate-180 text-sky-400" : ""
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                ) : link.hasDropdown && link.label === "Insights" ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleOpenDropdown("insights")}
                    onMouseLeave={handleCloseWithDelay}
                  >
                    <button
                      className="nav-btn-pill flex items-center gap-1.5 px-3 py-2 uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.10em",
                        fontSize: "11px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: activeDropdown === "insights" ? "#ffffff" : undefined,
                      }}
                      onClick={() => activeDropdown === "insights" ? setActiveDropdown(null) : handleOpenDropdown("insights")}
                    >
                      {link.label}
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "insights" ? "rotate-180 text-sky-400" : ""
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {activeDropdown === "insights" && (
                      <DropdownPanel>
                        {[
                          { href: "/insights/news", label: "News" },
                          { href: "/insights/blog", label: "Blog" },
                          { href: "/insights/events", label: "Events" },
                        ].map((item) => dropdownLink(item.href, item.label, () => setActiveDropdown(null)))}
                      </DropdownPanel>
                    )}
                  </div>
                ) : (
                  <NavLink href={link.href} onClick={() => { setIsOpen(false); setActiveDropdown(null); }}>
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Right: Contact pill + mobile menu ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs uppercase transition-all duration-200"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.12em",
              color: "rgba(240,244,255,0.70)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "100px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.40)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(255,255,255,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(240,244,255,0.70)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Contact us
          </Link>
          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
            style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(240,244,255,0.7)" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mega Menu Desktop Container (Services & Products) ── */}
      {(activeDropdown === "services" || activeDropdown === "products") && (
        <div
          className="hidden md:block absolute top-[calc(100%+8px)] left-0 right-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={handleCancelClose}
          onMouseLeave={handleCloseWithDelay}
        >
          {/* Transparent hit bridge to prevent premature mouseleave */}
          <div className="absolute -top-3 left-0 right-0 h-3" />
          <NavbarMegaMenu
            type={activeDropdown}
            onClose={() => setActiveDropdown(null)}
            services={services}
            products={products}
          />
        </div>
      )}

      {/* ── Mobile dropdown ── */}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`absolute inset-x-0 top-full z-20 mt-3 overflow-hidden rounded-3xl md:hidden ${isOpen ? "max-h-[700px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        style={{
          background: "rgba(5,8,16,0.96)",
          border: isOpen ? "1px solid rgba(255,255,255,0.08)" : "none",
          backdropFilter: "blur(28px)",
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <ul className="flex flex-col gap-4 p-6 text-base font-medium" style={{ color: "rgba(240,244,255,0.55)", fontFamily: "var(--font-mono)" }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.hasDropdown && link.label === "Services" ? (
                <div>
                  <button className="w-full text-left flex items-center justify-between py-1 uppercase text-xs tracking-widest hover:text-white transition-colors"
                    onClick={() => { fetchServices(); setMobileServicesOpen(!mobileServicesOpen); }}>
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${mobileServicesOpen ? "rotate-180 text-sky-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileServicesOpen && (
                    <div className="mt-2 ml-3 space-y-1">
                      <Link href="/services" className="block px-3 py-1.5 text-xs uppercase tracking-wider text-sky-400 font-semibold hover:text-sky-300 transition-colors"
                        onClick={() => { setMobileServicesOpen(false); setIsOpen(false); }}>All Services ⟶</Link>
                      {services.map((s) => (
                        <Link key={s.title} href={`/services/${s.slug}`} className="block px-3 py-1.5 text-xs uppercase tracking-wider hover:text-white transition-colors"
                          onClick={() => { setMobileServicesOpen(false); setIsOpen(false); }}>{s.title}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : link.hasDropdown && link.label === "Products" ? (
                <div>
                  <button className="w-full text-left flex items-center justify-between py-1 uppercase text-xs tracking-widest hover:text-white transition-colors"
                    onClick={() => { fetchProducts(); setMobileProductsOpen(!mobileProductsOpen); }}>
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${mobileProductsOpen ? "rotate-180 text-sky-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileProductsOpen && (
                    <div className="mt-2 ml-3 space-y-1">
                      <Link href="/products" className="block px-3 py-1.5 text-xs uppercase tracking-wider text-sky-400 font-semibold hover:text-sky-300 transition-colors"
                        onClick={() => { setMobileProductsOpen(false); setIsOpen(false); }}>All Products ⟶</Link>
                      {products.map((p) => (
                        <Link key={p.title} href={`/products/${p.slug}`}
                          className="block px-3 py-1.5 text-xs uppercase tracking-wider hover:text-white transition-colors"
                          onClick={() => { setMobileProductsOpen(false); setIsOpen(false); }}>{p.title}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : link.hasDropdown && link.label === "Insights" ? (
                <div>
                  <button className="w-full text-left flex items-center justify-between py-1 uppercase text-xs tracking-widest hover:text-white transition-colors"
                    onClick={() => setMobileInsightsOpen(!mobileInsightsOpen)}>
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${mobileInsightsOpen ? "rotate-180 text-sky-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileInsightsOpen && (
                    <div className="mt-2 ml-3 space-y-1">
                      {[{ href: "/insights/news", label: "News" }, { href: "/insights/blog", label: "Blog" }, { href: "/insights/events", label: "Events" }].map(i => (
                        <Link key={i.href} href={i.href} className="block px-3 py-1.5 text-xs uppercase tracking-wider hover:text-white transition-colors"
                          onClick={() => { setMobileInsightsOpen(false); setIsOpen(false); }}>{i.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={link.href} className="block py-1 uppercase text-xs tracking-widest hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
