"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";

const services = [
  {
    title: "Aerial Mapping and Surveying",
    description: "We provide accurate aerial mapping and surveying solutions using advanced drone technology. Our services support land assessment, construction planning, and geospatial data collection. We ensure high-resolution outputs that help clients make informed decisions efficiently.",
    image: "/drone.jpg",
  },
  {
    title: "Drone Piloting Training",
    description: "Our drone piloting training equips individuals with practical flying skills and industry knowledge. Trainees learn safety procedures, flight control, and mission planning. The program is designed for both beginners and those looking to enhance their expertise.",
    image: "/simulation.jpg",
  },
  {
    title: "Technician Training",
    description: "We offer technician training focused on drone maintenance, troubleshooting, and system management. Participants gain hands-on experience with real equipment and tools. This training prepares technicians to ensure reliable and safe drone operations.",
    image: "/consulting.jpg",
  },
  {
    title: "Drone Engineering Training",
    description: "Our drone engineering training covers design, assembly, and system integration. Students learn the technical foundations behind drone technology and innovation. The course is ideal for those interested in building and improving drone systems.",
    image: "/drone.jpg",
  },
  {
    title: "Consultancy",
    description: "We provide expert consultancy services tailored to your drone-related needs. Our team supports project planning, technology selection, and operational strategy. We help organizations adopt drone solutions effectively and responsibly.",
    image: "/simulation.jpg",
  },
  {
    title: "Agricultural and Infrastructure Inspection",
    description: "Our drones enable efficient inspection of agricultural fields and infrastructure assets. We help identify issues such as crop health concerns, structural damage, or maintenance needs. This approach saves time while improving accuracy and safety.",
    image: "/consulting.jpg",
  },
  {
    title: "Customized Missions",
    description: "We design and execute customized drone missions based on specific client requirements. Whether for research, monitoring, or specialized operations, we adapt our solutions accordingly. Our team ensures precision, flexibility, and reliable results in every project.",
    image: "/drone.jpg",
  },
];

const products = [
  {
    title: "Tew-k 01",
    shortDescription: "Advanced FPV drone with 3kg payload capacity and 15km range",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        Tew K are models of our best FPV drones in field. They are capable of precise hovering and high maneuverability, making them suitable for accurate attacks. The Tew K have been well tested, and their performance is assured for different purposes.
      </p>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Tew k 01</h3>
      <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
        <p><strong>Total empty weight:</strong> 3 kg</p>
        <p><strong>Payload weight:</strong> 2 kg</p>
        <p><strong>Power system:</strong> Battery power system</p>
        <p><strong>Altitude climb:</strong> 3500 m</p>
        <p><strong>Range:</strong> 15 km with a supported signal</p>
        <p><strong>Endurance time:</strong> 15 min</p>
      </div>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Application:</h3>
      <p class="text-lg text-[color:var(--muted)]">
        Defense and security
      </p>
    `,
    images: ["/website_images/10 inch Tew-k 01.jpg", "/website_images/10 inch Tew-k 01.jpg", "/website_images/10 inch Tew-k 01.jpg", "/website_images/10 inch Tew-k 01.jpg"],
  },
  {
    title: "Tew-k 02",
    shortDescription: "Enhanced FPV drone with 4kg payload capacity and 20km range",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        Tew K are models of our best FPV drones in field. They are capable of precise hovering and high maneuverability, making them suitable for accurate attacks. The Tew K have been well tested, and their performance is assured for different purposes.
      </p>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Tew k 02</h3>
      <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
        <p><strong>Total empty weight:</strong> 5 kg</p>
        <p><strong>Payload weight:</strong> 4 kg</p>
        <p><strong>Power system:</strong> Battery power system</p>
        <p><strong>Altitude climb:</strong> 3500 m</p>
        <p><strong>Range:</strong> 20 km with a supported signal</p>
        <p><strong>Endurance time:</strong> 30 min</p>
      </div>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Application:</h3>
      <p class="text-lg text-[color:var(--muted)]">
        Defense and security
      </p>
    `,
    images: ["/website_images/10 inch Tew-k 02.jpg", "/website_images/10 inch Tew-k 02.jpg", "/website_images/10 inch Tew-k 02.jpg", "/website_images/10 inch Tew-k 02.jpg"],
  },
  {
    title: "SR (Surveillance)",
    shortDescription: "High-altitude surveillance drone with 40x optical zoom and thermal imaging",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        SR is a sophisticated aerial vehicle, proudly designed and manufactured by Skywin Aeronautics. Equipped with a high-precision camera, it thrives in high-altitude environments, capable of climbing up to 4,000 meters with ease. Primarily built for surveillance, SR excels at scouting hostile zones and tracking moving objects with unwavering accuracy.
      </p>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Specifications</h3>
      <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
        <p><strong>Total empty weight:</strong> 50 kg</p>
        <p><strong>Payload weight:</strong> 5 kg</p>
        <p><strong>Power system:</strong> Battery power system</p>
        <p><strong>Altitude climb:</strong> 4000 m</p>
        <p><strong>Range:</strong> 30 km</p>
        <p><strong>Endurance time:</strong> 50 min @ 4000 m alt</p>
        <p><strong>All weather flight capability</strong></p>
        <p><strong>Integrated with high precision camera with optical zoom up to 40x & IR thermal night vision</strong></p>
        <p><strong>Laser rangefinder:</strong> up to 3000 m</p>
      </div>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Suitable for</h3>
      <div class="space-y-1 text-lg text-[color:var(--muted)] mb-6">
        <p>Defense and Security service</p>
        <p>Surveillance and reconnaissance</p>
        <p>Target tracking and security surveillance</p>
        <p>Support for other drones</p>
      </div>
    `,
    images: ["/website_images/Survaillance.jpg", "/website_images/Survaillance(2).jpg", "/website_images/Survaillance.jpg", "/website_images/Survaillance(2).jpg"],
  },
  {
    title: "Mebrek",
    shortDescription: "Heavy lift quadcopter with 20kg payload capacity and advanced surveillance systems",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        Mebrek is one of our biggest aerial vehicles proudly designed, tested, and expertly manufactured entirely in Skywin Aeronautics. Integrated with state-of-the-art equipment, it conquers most hostile environments while soaring to altitudes of 4,000 meters above sea level with unshakable stability. Whether integrating payloads, delivering critical cargo, or executing stealthy scouting missions, Mebrek adapts seamlessly to virtually any role you imagine.
      </p>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Specifications</h3>
      <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
        <p><strong>Total empty weight:</strong> 150 kg</p>
        <p><strong>Payload weight:</strong> 20 kg</p>
        <p><strong>Power system:</strong> Battery power system</p>
        <p><strong>Altitude climb:</strong> 4000 m</p>
        <p><strong>Range:</strong> 25 km</p>
        <p><strong>Endurance time:</strong> 50 min @ 4000 m alt</p>
        <p><strong>All weather flight capability</strong></p>
        <p><strong>Integrated with high precision camera with optical zoom up to 40x & IR thermal night vision</strong></p>
        <p><strong>Laser rangefinder:</strong> up to 2500 m</p>
      </div>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Suitable for</h3>
      <div class="space-y-1 text-lg text-[color:var(--muted)] mb-6">
        <p>Defense and Security service</p>
        <p>Surveillance and reconnaissance</p>
        <p>Target tracking and security surveillance</p>
        <p>Large payload delivery</p>
        <p>Firefighting payload and reconnaissance</p>
      </div>
    `,
    images: ["/website_images/Heavy lift quadcopter.jpg", "/website_images/Heavy lift quadcopter (2).jpg", "/website_images/Heavy lift quadcopter.jpg", "/website_images/Heavy lift quadcopter (2).jpg"],
  },
  {
    title: "Battery Packs",
    shortDescription: "Custom engineered battery packs for any specification from low-energy to high-power applications",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        Here at Skywin Aeronautics, we don't just build drones, we engineer custom battery packs in any specification you demand. From low-energy applications to most power-devouring machines. Every cell we use is tested, fully certified, and renowned for an exceptional energy density delivering maximum power without the penalty of bulk. Whether you need a compact, lightweight pack or a massive energy beast, we tailor each battery precisely to your specifications, from smallest to largest.
      </p>
    `,
    images: ["/drone.jpg", "/drone.jpg", "/drone.jpg", "/drone.jpg"],
  },
  {
    title: "Vtol SW-01",
    shortDescription: "Largest VTOL vehicle with AI-integrated system and 30kg payload capacity",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        SW-01 is our largest VTOL vehicle proudly designed and manufactured here at Skywin Aeronautics. Equipped with cutting-edge equipment and an AI-integrated system, its performance is remarkable in whether tackling the most demanding missions or enduring brutally harsh environments, SW-01 stands unshaken. Thanks to its sustained energy efficiency, it achieves seamless vertical takeoff and landing while delivering exceptional endurance when every second in the sky counts.
      </p>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Specifications</h3>
      <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
        <p><strong>Total empty weight:</strong> 60 kg</p>
        <p><strong>Payload weight:</strong> 30 kg</p>
        <p><strong>Power system:</strong> Hybrid system</p>
        <p><strong>Altitude climb:</strong> 4500 m – 5000 m</p>
        <p><strong>Range:</strong> 100 km</p>
        <p><strong>Endurance time:</strong> 5 – 7 hrs</p>
        <p><strong>Cruise speed:</strong> 100 km/ hr – 120 km/ hr</p>
      </div>
      
      <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Payload with integrated high precision camera and ER sensors ideal for</h3>
      <div class="space-y-1 text-lg text-[color:var(--muted)] mb-6">
        <p>Mapping and Surveillance</p>
        <p>Boarder monitoring</p>
        <p>Targeted reconnaissance and Tracking capability</p>
        <p>Defense and Security</p>
      </div>
    `,
    images: ["/website_images/vtol3.png", "/website_images/vtol1.png", "/website_images/vtol2.png", "/website_images/vtol3.png"],
  },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", hasDropdown: true },
  { href: "/products", label: "Products", hasDropdown: true },
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);

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
