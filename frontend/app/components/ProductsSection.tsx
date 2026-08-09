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
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDarkMode(hasDarkClass);
    };

    checkDarkMode();

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
            <div 
              className="group h-full overflow-hidden rounded-2xl bg-[#152230] border border-[#2a3a4e] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:border-[#45576D]/50 cursor-pointer flex flex-col"
              onClick={() => handleCardClick(product)}
            >
              <div className="aspect-[4/3] overflow-hidden shrink-0 relative">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                    </div>
                    <div className="p-6 bg-gradient-to-br from-[#23364F] to-[#1a2736] flex-1 flex flex-col justify-start">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {product.title}
                </h3>
                <p className="text-sm leading-6 text-white/70">
                  {product.shortDescription}
                </p>
              </div>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#45576D] to-[#6a7e98] transition-all duration-500 rounded-full shrink-0" />
            </div>
          ) : (
            <div 
              className="group h-full overflow-hidden rounded-2xl bg-[color:var(--background)] border border-[color:var(--border)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(35,54,79,0.12)] hover:border-[#23364F]/30 cursor-pointer flex flex-col"
              onClick={() => handleCardClick(product)}
            >
              <div className="aspect-[4/3] overflow-hidden shrink-0 relative">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                    </div>
                    <div className="p-6 bg-gradient-to-br from-[#f0f2f5] via-[#e8ebf0] to-[#dce1e8] flex-1 flex flex-col justify-start">
                <h3 className="text-lg font-semibold text-[#23364F] mb-3">
                  {product.title}
                </h3>
                <p className="text-sm leading-6 text-[#45576D]">
                  {product.shortDescription}
                </p>
              </div>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#23364F] to-[#45576D] transition-all duration-500 rounded-full shrink-0" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
