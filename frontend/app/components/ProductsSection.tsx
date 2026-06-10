"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProducts, FrontendProduct } from "../../lib/api";

export default function ProductsSection() {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const handleCardClick = (product: FrontendProduct) => {
    router.push(`/products?selected=${encodeURIComponent(product.title)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[color:var(--primary)]"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

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
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                />
              </div>
              
              {/* Text Section - Bottom Half */}
              <div className="p-6 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]">
                <h3 className="text-xl font-semibold text-[#23364F] mb-3">
                  {product.title}
                </h3>
                <p className="text-sm leading-6 text-[#23364F]">
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
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={400}
                  height={300}
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
