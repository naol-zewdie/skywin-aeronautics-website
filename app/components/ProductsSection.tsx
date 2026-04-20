"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const products = [
  {
    title: "Tew-k 01",
    shortDescription: "Advanced FPV drone with 3kg payload capacity and 15km range",
    image: "/website_images/10 inch Tew-k 01.jpg",
  },
  {
    title: "Tew-k 02",
    shortDescription: "Enhanced FPV drone with 4kg payload capacity and 20km range",
    image: "/website_images/10 inch Tew-k 02.jpg",
  },
  {
    title: "SR (Surveillance)",
    shortDescription: "High-altitude surveillance drone with 40x optical zoom and thermal imaging",
    image: "/website_images/Survaillance.jpg",
  },
  {
    title: "Mebrek",
    shortDescription: "Heavy lift quadcopter with 20kg payload capacity and advanced surveillance systems",
    image: "/website_images/Heavy lift quadcopter.jpg",
  },
  {
    title: "Vtol SW-01",
    shortDescription: "Largest VTOL vehicle with AI-integrated system and 30kg payload capacity",
    image: "/website_images/vtol3.png",
  },
  {
    title: "Battery Packs",
    shortDescription: "Custom engineered battery packs for any specification from low-energy to high-power applications",
    image: "/drone.jpg",
  },
];

export default function ProductsSection() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

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

  const handleCardClick = (product: any) => {
    // Navigate to products page with the selected product
    router.push(`/products?selected=${encodeURIComponent(product.title)}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.slice(0, 3).map((product) => (
        <div key={product.title}>
          {isDarkMode ? (
            /* Dark Mode Card */
            <div 
              className="h-full overflow-hidden rounded-3xl bg-[#23364F] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-[#23364F]/50 hover:-translate-y-2 hover:ring-2 hover:ring-[#23364F]/50 ring-offset-4 ring-offset-[color:var(--background)] group cursor-pointer"
              onClick={() => handleCardClick(product)}
            >
              {/* Image Section - Upper Half */}
              <div className="aspect-[4/3] overflow-hidden border-0">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                />
              </div>
              
              {/* Text Section - Bottom Half */}
              <div className="p-6 bg-gradient-to-br from-[#23364F] via-[#2a4663] to-[#315577]">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {product.title}
                </h3>
                <p className="text-sm leading-6 text-white/90">
                  {product.shortDescription}
                </p>
              </div>
            </div>
          ) : (
            /* Light Mode Card */
            <div 
              className="h-full overflow-hidden rounded-3xl bg-[color:var(--background)] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-[#23364F]/30 hover:-translate-y-2 hover:ring-2 hover:ring-[#23364F]/50 ring-offset-4 ring-offset-[color:var(--background)] group cursor-pointer"
              onClick={() => handleCardClick(product)}
            >
              {/* Image Section - Upper Half */}
              <div className="aspect-[4/3] overflow-hidden border-0">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                />
              </div>
              
              {/* Text Section - Bottom Half */}
              <div className="p-6 bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]">
                <h3 className="text-xl font-semibold text-[#23364F] mb-3">
                  {product.title}
                </h3>
                <p className="text-sm leading-6 text-[#23364F]">
                  {product.shortDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
