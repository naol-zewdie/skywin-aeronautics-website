"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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

// Smooth scroll to top function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

export default function Navbar() {
  const [services, setServices] = useState<FrontendService[]>([]);
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [insightsDropdown, setInsightsDropdown] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDarkMode(hasDarkClass);
    };

    // Initial check
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Fetch services and products data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, productsData] = await Promise.all([
          getServices(),
          getProducts()
        ]);
        setServices(servicesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch navbar data:', error);
        // Fallback to empty arrays if API fails
        setServices([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] backdrop-blur-lg" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }}>
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            onClick={scrollToTop}
            className="flex items-center gap-4 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image
                src={isDarkMode ? "/skywin-logo-blue.png" : "/skywin_logo.png"}
                alt="Skywin Aeronautics logo"
                width={450 * 8}
                height={100 * 8}
                className="h-24 w-auto object-contain relative z-10"
              />
            </div>
            <span className="sr-only">Skywin Aeronautics</span>
          </Link>

          <nav
            id="primary-navigation"
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-12"
          >
            <ul className="flex flex-row items-center gap-8 text-lg font-semibold text-[color:var(--muted)]">
              {navLinks.map((link) => (
                <li key={link.href} className="relative">
                  {link.hasDropdown && link.label === "Services" ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setServicesDropdown(true)}
                      onMouseLeave={() => setServicesDropdown(false)}
                    >
                      <button
                        className="transition-all duration-300 hover:text-[color:var(--primary)] hover:scale-105 flex items-center gap-1"
                        onClick={() => setServicesDropdown(!servicesDropdown)}
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
                        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg overflow-hidden z-50">
                          <div className="py-2">
                            {services.map((service) => (
                              <Link
                                key={service.title}
                                href="/services"
                                className="block px-4 py-3 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] transition-colors duration-200"
                                onClick={() => {
                                  setServicesDropdown(false);
                                  setIsOpen(false);
                                }}
                              >
                                {service.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : link.hasDropdown && link.label === "Products" ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setProductsDropdown(true)}
                      onMouseLeave={() => setProductsDropdown(false)}
                    >
                      <button
                        className="transition-all duration-300 hover:text-[color:var(--primary)] hover:scale-105 flex items-center gap-1"
                        onClick={() => setProductsDropdown(!productsDropdown)}
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
                        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg overflow-hidden z-50">
                          <div className="py-2">
                            {products.map((product) => (
                              <Link
                                key={product.title}
                                href="/products"
                                className="block px-4 py-3 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] transition-colors duration-200"
                                onClick={() => {
                                  setProductsDropdown(false);
                                  setIsOpen(false);
                                }}
                              >
                                {product.title}
                              </Link>
                            ))}
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
                        className="transition-all duration-300 hover:text-[color:var(--primary)] hover:scale-105 flex items-center gap-1"
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
                        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg overflow-hidden z-50">
                          <div className="py-2">
                            <Link
                              href="/insights/news"
                              className="block px-4 py-3 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] transition-colors duration-200"
                              onClick={() => {
                                setInsightsDropdown(false);
                                setIsOpen(false);
                              }}
                            >
                              News
                            </Link>
                            <Link
                              href="/insights/blog"
                              className="block px-4 py-3 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] transition-colors duration-200"
                              onClick={() => {
                                setInsightsDropdown(false);
                                setIsOpen(false);
                              }}
                            >
                              Blog
                            </Link>
                            <Link
                              href="/insights/events"
                              className="block px-4 py-3 text-sm text-[color:var(--muted)] hover:bg-[color:var(--background-alt)] hover:text-[color:var(--primary)] transition-colors duration-200"
                              onClick={() => {
                                setInsightsDropdown(false);
                                setIsOpen(false);
                              }}
                            >
                              Events
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="transition-all duration-300 hover:text-[color:var(--primary)] hover:scale-105"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
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
      </div>

      {/* Mobile Navigation */}
      <nav
        id="primary-navigation"
        aria-label="Primary navigation"
        className={`absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] px-6 shadow-lg transition-all duration-300 ease-out md:hidden ${
          isOpen
            ? "max-h-[700px] opacity-100 pointer-events-auto py-5"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-4 text-base font-medium text-[color:var(--muted)]">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.hasDropdown && link.label === "Services" ? (
                <div>
                  <button
                    className="w-full text-left transition hover:text-[color:var(--primary)] flex items-center justify-between"
                    onClick={() => setServicesDropdown(!servicesDropdown)}
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
                    onClick={() => setProductsDropdown(!productsDropdown)}
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
                          href="/products"
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
