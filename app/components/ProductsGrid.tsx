"use client";

import { useState, useEffect } from "react";

const products = [
  {
    title: "Tew-k 01",
    shortDescription: "Advanced FPV drone with 3kg payload capacity and 15km range",
    description: `
      <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
      <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
        Tew K are models of our best FPV drones in the field. They are capable of precise hovering and high maneuverability, making them suitable for accurate attacks. The Tew K have been well tested, and their performance is assured for different purposes.
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
        Tew K are models of our best FPV drones in the field. They are capable of precise hovering and high maneuverability, making them suitable for accurate attacks. The Tew K have been well tested, and their performance is assured for different purposes.
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
        SR is a sophisticated aerial vehicle, proudly designed and manufactured by Skywin Aeronautics. Equipped with a high-precision camera, it thrives in high-altitude environments, capable of climbing up to 4,000 meters with ease. Primarily built for surveillance, the SR excels at scouting hostile zones and tracking moving objects with unwavering accuracy.
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
        Mebrek is one of our biggest aerial vehicles proudly designed, tested, and expertly manufactured entirely in Skywin Aeronautics. Integrated with state-of-the-art equipment, it conquers the most hostile environments while soaring to altitudes of 4,000 meters above sea level with unshakable stability. Whether integrating payloads, delivering critical cargo, or executing stealthy scouting missions, Mebrek adapts seamlessly to virtually any role you imagine.
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
        Here at Skywin Aeronautics, we don't just build drones, we engineer custom battery packs in any specification you demand. From low-energy applications to the most power-devouring machines. Every cell we use is tested, fully certified, and renowned for an exceptional energy density delivering maximum power without the penalty of bulk. Whether you need a compact, lightweight pack or a massive energy beast, we tailor each battery precisely to your specifications, from smallest to largest.
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

export default function ProductsGrid() {
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

  // Handle URL parameter for selected product
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedProduct = urlParams.get('selected');
    
    if (selectedProduct) {
      const productIndex = products.findIndex(p => 
        p.title.toLowerCase() === decodeURIComponent(selectedProduct?.toLowerCase() || '')
      );
      
      if (productIndex !== -1) {
        setSelectedCard(productIndex);
        setSelectedImageIndex(0);
        setSliderPosition(0);
      }
    }
  }, []);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    // Smooth scroll to top to show title and image
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
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
                    <div className="p-6 bg-gradient-to-br from-[#23364F] via-[#2a4663] to-[#315577]">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-6 text-white/90 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Light Mode Card */
                  <div 
                    className="h-full overflow-hidden rounded-3xl bg-[color:var(--background)] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-gray-400/30 hover:-translate-y-2 hover:ring-2 hover:ring-gray-300/50 ring-offset-4 ring-offset-[color:var(--background)] group cursor-pointer"
                    onClick={() => handleCardClick(index)}
                  >
                    {/* Image Section - Upper Half */}
                    <div className="aspect-[4/3] overflow-hidden border-0">
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
          // Vertical Stack Layout (when card is selected)
          <div className="grid gap-6">
            {products.map((product, index) => (
              <div 
                key={product.title}
                className={selectedCard === index ? "hidden" : ""}
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
                    <div className="p-6 bg-gradient-to-br from-[#23364F] via-[#2a4663] to-[#315577]">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-6 text-white/90 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Light Mode Card */
                  <div 
                    className="h-full overflow-hidden rounded-3xl bg-[color:var(--background)] shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-gray-400/30 hover:-translate-y-2 hover:ring-2 hover:ring-gray-300/50 ring-offset-4 ring-offset-[color:var(--background)] group cursor-pointer"
                    onClick={() => handleCardClick(index)}
                  >
                    {/* Image Section - Upper Half */}
                    <div className="aspect-[4/3] overflow-hidden border-0">
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
        )}
      </div>

      {/* Right Side - Selected Product Details */}
      {selectedCard !== null && (
        <div className="flex-1 lg:w-2/3">
          <div className="overflow-hidden rounded-3xl bg-[color:var(--background)] shadow-lg">
            {/* Image Slider */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {/* Right Arrow */}
                <button
                  onClick={slideRight}
                  disabled={sliderPosition >= products[selectedCard].images.length - 3}
                  className="p-2 rounded-full bg-[color:var(--primary)] text-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[color:var(--accent)] transition-colors"
                  aria-label="Slide right"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Description Taking Full Height */}
            <div className="flex-1">
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
    
      )}
    </div>
  );
}
