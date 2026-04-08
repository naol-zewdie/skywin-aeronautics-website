"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const products = [
  {
    title: "Flight Control Systems",
    description:
      "Advanced avionics and flight control solutions for modern aircraft with enhanced safety and reliability features.",
    image: "/drone.jpg",
  },
  {
    title: "Aerospace Components",
    description:
      "High-precision structural components and assemblies designed for demanding aerospace applications.",
    image: "/simulation.jpg",
  },
  {
    title: "Navigation Systems",
    description:
      "State-of-the-art navigation and guidance systems for commercial and military aviation platforms.",
    image: "/consulting.jpg",
  },
];

export default function ProductsSection() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    <>
      {/* Debug element to check dark mode */}
      <div className="hidden dark:block fixed top-20 right-4 bg-red-500 text-white p-2 z-50">
        DARK MODE ACTIVE
      </div>
      <div className="dark:hidden fixed top-20 right-4 bg-green-500 text-white p-2 z-50">
        LIGHT MODE ACTIVE
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <div key={product.title}>
            {isDarkMode ? (
              /* Dark Mode Card */
              <div className="overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[#23364F] shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#23364F]/50 hover:-translate-y-2 hover:ring-2 hover:ring-[#23364F]/30 ring-offset-4 ring-offset-[color:var(--background)]">
                {/* Image Section - Upper Half */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                {/* Text Section - Bottom Half */}
                <div className="p-6 bg-[#23364F]">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {product.title}
                  </h3>
                  <p className="text-sm leading-6 text-white/90">
                    {product.description}
                  </p>
                </div>
              </div>
            ) : (
              /* Light Mode Card */
              <div className="overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--background-alt)] shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-400/30 hover:-translate-y-2 hover:ring-2 hover:ring-gray-300/50 ring-offset-4 ring-offset-[color:var(--background)]">
                {/* Image Section - Upper Half */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                {/* Text Section - Bottom Half */}
                <div className="p-6 bg-gray-200">
                  <h3 className="text-xl font-semibold text-[#23364F] mb-3">
                    {product.title}
                  </h3>
                  <p className="text-sm leading-6 text-[#23364F]">
                    {product.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
