"use client";

import { useState, useEffect } from "react";
import { getProducts, FrontendProduct } from "../../lib/api";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import DOMPurify from 'isomorphic-dompurify';

function formatDescription(text: string): string {
  if (!text) return '';
  // If it already contains HTML block tags, render as-is
  if (/<(p|div|h[1-6]|ul|ol|li|table)/i.test(text)) return text;
  // Plain text: split on newlines, wrap each line in <p>, bold labels
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const labelMatch = line.match(/^([^:]+:)/);
      if (labelMatch) {
        const label = labelMatch[1];
        const rest = line.slice(label.length);
        return `<p><strong>${label}</strong>${rest}</p>`;
      }
      return `<p>${line}</p>`;
    })
    .join('');
}

export default function ProductsGrid() {
  const searchParams = useSearchParams();
  const selectedProduct = searchParams.get('selected');
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const [sliderPosition, setSliderPosition] = useState(0);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct && products.length > 0) {
      const productIndex = products.findIndex(p => 
        p.title.toLowerCase() === decodeURIComponent(selectedProduct.toLowerCase())
      );
      
      if (productIndex !== -1) {
        setSelectedCard(productIndex);

        setSliderPosition(0);
      }
    }
  }, [products, selectedProduct]);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const slideLeft = () => {
    const newPosition = Math.max(sliderPosition - 1, 0);
    setSliderPosition(newPosition);
  };

  const slideRight = () => {
    const maxPosition = Math.max(0, products[selectedCard!].images.length - 3);
    const newPosition = Math.min(sliderPosition + 1, maxPosition);
    setSliderPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[color:var(--primary)] mb-4">Error</h2>
        <p className="text-[color:var(--muted)] mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--accent)] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className={`transition-all duration-500 ${selectedCard !== null ? 'w-full md:w-1/3 h-full' : 'flex-1'}`}>
        {selectedCard === null ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div 
                key={product.title}
              >
                {isDarkMode ? (
                  <div 
                    className="overflow-hidden rounded-2xl bg-[#152230] border border-[#2a3a4e] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:border-[#45576D]/50 group cursor-pointer flex flex-col h-full"
                    onClick={() => handleCardClick(index)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                      />
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-[#23364F] to-[#1a2736] flex-1 flex flex-col justify-start">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-6 text-white/70 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                    <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#45576D] to-[#6a7e98] transition-all duration-500 rounded-full shrink-0" />
                  </div>
                ) : (
                  <div 
                    className="overflow-hidden rounded-2xl bg-[color:var(--background)] border border-[color:var(--border)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(35,54,79,0.12)] hover:border-[#23364F]/30 group cursor-pointer flex flex-col h-full"
                    onClick={() => handleCardClick(index)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                      />
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-[#f0f2f5] via-[#e8ebf0] to-[#dce1e8] flex-1 flex flex-col justify-start">
                      <h3 className="text-lg font-semibold text-[#23364F] mb-3">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-6 text-[#45576D] line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                    <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#23364F] to-[#45576D] transition-all duration-500 rounded-full shrink-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full">
            {products.map((product, index) => (
              <div
                key={product.title}
                onClick={() => handleCardClick(index)}
                className={`flex-1 flex flex-col justify-center p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedCard === index
                    ? isDarkMode
                      ? 'bg-[#23364F] ring-2 ring-[#0d4f4f]'
                      : 'bg-[#dbeafe] ring-2 ring-[#0d4f4f]'
                    : isDarkMode
                    ? 'bg-gradient-to-br from-[#23364F] to-[#3b6a8f] hover:from-[#23364F] hover:to-[#4a7aa0]'
                    : 'bg-gradient-to-br from-[#23364F]/10 to-[#7da0c4]/20 hover:from-[#23364F]/15 hover:to-[#7da0c4]/30'
                }`}
              >
                <h3 className={`font-semibold text-lg ${
                  selectedCard === index
                    ? 'text-[color:var(--primary)]'
                    : isDarkMode
                    ? 'text-white'
                    : 'text-[#23364F]'
                }`}>
                  {product.title}
                </h3>
                <p className={`text-sm mt-2 leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {product.shortDescription}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCard !== null && (
        <div className="flex-1 min-w-0">
          <div className="relative overflow-hidden rounded-3xl bg-[color:var(--background)] shadow-lg px-8 pb-8 pt-4">
            {/* Close button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-2 bg-[color:var(--primary)] text-[color:var(--background)] rounded-full hover:bg-[color:var(--accent)] transition-colors z-10"
              aria-label="Close expanded view"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Centered title */}
            <h2 className="text-2xl font-bold text-[color:var(--primary)] text-center mb-6">
              {products[selectedCard].title}
            </h2>
            
            {/* Smaller image with slider */}
            <div className="max-w-lg mx-auto mb-6">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <div className="flex h-full transition-transform duration-500 ease-in-out" 
                     style={{ transform: `translateX(-${sliderPosition * 33.33}%)` }}>
                  {products[selectedCard].images.map((image, index) => (
                    <div key={index} className="relative w-full h-full flex-shrink-0">
                      <Image
                        src={image}
                        alt={`${products[selectedCard].title} - Image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-cover rounded-2xl"
                      />
                    </div>
                  ))}
                </div>
                
                {products[selectedCard].images.length > 3 && (
                  <>
                    <button
                      onClick={slideLeft}
                      disabled={sliderPosition === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[color:var(--primary)] text-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--accent)] transition-colors"
                      aria-label="Slide left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={slideRight}
                      disabled={sliderPosition >= products[selectedCard].images.length - 3}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[color:var(--primary)] text-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--accent)] transition-colors"
                      aria-label="Slide right"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Description under image */}
            <div 
              className="text-lg leading-8 text-[color:var(--muted)] space-y-3"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatDescription(products[selectedCard].description)) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}