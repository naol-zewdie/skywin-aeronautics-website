"use client";

import { useState, useEffect } from "react";
import { getProducts, FrontendProduct } from "../../lib/api";

export default function ProductsGrid() {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(0);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDarkMode(hasDarkClass);
    };

    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Fetch products from API
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

  // Handle URL parameter for selected product
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedProduct = urlParams.get('selected');
    
    if (selectedProduct && products.length > 0) {
      const productIndex = products.findIndex(p => 
        p.title.toLowerCase() === decodeURIComponent(selectedProduct?.toLowerCase() || '')
      );
      
      if (productIndex !== -1) {
        setSelectedCard(productIndex);
        setSelectedImageIndex(0);
        setSliderPosition(0);
      }
    }
  }, [products]);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    // Smooth scroll to top to show title and image
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)]"></div>
      </div>
    );
  }

  // Error state
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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Side - Cards Grid (when no selection) or Vertical Stack (when selection) */}
      <div className={`transition-all duration-500 ${selectedCard !== null ? 'w-1/3' : 'flex-1'}`}>
        {selectedCard === null ? (
          // Default Grid Layout
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div 
                key={product.title}
              >
                {isDarkMode ? (
                  /* Dark Mode Card */
                  <div 
                    className="overflow-hidden rounded-3xl bg-[#23364F] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-[#23364F]/50 hover:-translate-y-2 hover:ring-2 hover:ring-[#23364F]/30 ring-offset-4 ring-offset-[color:var(--background)] group cursor-pointer"
                    onClick={() => handleCardClick(index)}
                  >
                    {/* Image Section - Upper Half */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                      />
                    </div>
                    
                    {/* Text Section - Bottom Half */}
                    <div className="p-6 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-6 text-white line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Light Mode Card */
                  <div 
                    className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-[#93c5fd]/50 hover:-translate-y-2 hover:ring-2 hover:ring-[#93c5fd]/30 ring-offset-4 ring-offset-[color:var(--background)] group cursor-pointer"
                    onClick={() => handleCardClick(index)}
                  >
                    {/* Image Section - Upper Half */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover border-0 transition-transform duration-500 hover:scale-110 group-hover:brightness-110"
                      />
                    </div>
                    
                    {/* Text Section - Bottom Half */}
                    <div className="p-6 bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]">
                      <h3 className="text-xl font-semibold text-[#23364F] mb-3">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-6 text-[#23364F] line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Selected Product Stack Layout
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.title}
                onClick={() => handleCardClick(index)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedCard === index
                    ? isDarkMode
                      ? 'bg-[#23364F] ring-2 ring-[#3b82f6]'
                      : 'bg-[#dbeafe] ring-2 ring-[#3b82f6]'
                    : isDarkMode
                    ? 'bg-[#1e3a8a] hover:bg-[#23364F]'
                    : 'bg-[#e0f2fe] hover:bg-[#dbeafe]'
                }`}
              >
                <h3 className={`font-semibold ${
                  selectedCard === index
                    ? 'text-[color:var(--primary)]'
                    : isDarkMode
                    ? 'text-white'
                    : 'text-[#23364F]'
                }`}>
                  {product.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {product.shortDescription}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side - Selected Product Details */}
      {selectedCard !== null && (
        <div className="flex-1 lg:w-2/3">
          <div className="overflow-hidden rounded-3xl bg-[color:var(--background)] shadow-lg">
            {/* Image Slider */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" 
                   style={{ transform: `translateX(-${sliderPosition * 33.33}%)` }}>
                {products[selectedCard].images.map((image, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <img
                      src={image}
                      alt={`${products[selectedCard].title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              {products[selectedCard].images.length > 3 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={slideLeft}
                    disabled={sliderPosition === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[color:var(--primary)] text-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--accent)] transition-colors"
                    aria-label="Slide left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Right Arrow */}
                  <button
                    onClick={slideRight}
                    disabled={sliderPosition >= products[selectedCard].images.length - 3}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[color:var(--primary)] text-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--accent)] transition-colors"
                    aria-label="Slide right"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Description Section */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[color:var(--primary)] mb-4">
                {products[selectedCard].title}
              </h2>
              <div 
                className="text-lg leading-8 text-[color:var(--muted)]"
                dangerouslySetInnerHTML={{ __html: products[selectedCard].description }}
              />
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-2 bg-[color:var(--primary)] text-[color:var(--background)] rounded-full hover:bg-[color:var(--accent)] transition-colors"
              aria-label="Close expanded view"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
