"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { FrontendService, FrontendProduct, slugify } from "../../lib/api";

interface NavbarMegaMenuProps {
  type: "services" | "products";
  onClose: () => void;
  services?: FrontendService[];
  products?: FrontendProduct[];
}

function cleanSnippet(text?: string, maxLen = 85): string {
  if (!text) return "";
  const plain = text.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen) + "…";
}

function getBadge(title: string, category: string, index: number): string | null {
  const upperTitle = title.toUpperCase();
  const upperCat = category.toUpperCase();

  if (index === 0) return "POPULAR";
  if (upperTitle.includes("01") || upperTitle.includes("02")) return "FPV";
  if (upperCat.includes("DEFENSE") || upperTitle.includes("DEFENSE")) return "DEFENSE";
  if (upperCat.includes("SURVEILLANCE") || upperTitle.includes("SURVEILLANCE")) return "RECON";
  if (upperCat.includes("HEAVY") || upperTitle.includes("HEAVY")) return "HEAVY LIFT";
  if (upperCat.includes("TRAINING") || upperTitle.includes("TRAINING")) return "ACADEMY";
  if (upperCat.includes("SURVEY") || upperCat.includes("MAPPING")) return "PRECISION";
  if (upperCat.includes("CONSULT")) return "STRATEGY";
  if (upperCat.includes("AVIONIC") || upperCat.includes("BATTERY") || upperCat.includes("GCS")) return "AVIONICS";
  return null;
}

export default function NavbarMegaMenu({
  type,
  onClose,
  services = [],
  products = [],
}: NavbarMegaMenuProps) {
  // ── Group Services dynamically by category from backend ──
  const groupedServices = useMemo(() => {
    const map: Record<string, FrontendService[]> = {};
    services.forEach((s) => {
      const cat = s.category ? s.category.trim().toUpperCase() : "AEROSPACE SERVICES";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [services]);

  // ── Group Products dynamically by category from backend ──
  const groupedProducts = useMemo(() => {
    const map: Record<string, FrontendProduct[]> = {};
    products.forEach((p) => {
      const cat = p.category ? p.category.trim().toUpperCase() : "UAV PLATFORMS";
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [products]);

  const categoryEntries = useMemo<[string, (FrontendService | FrontendProduct)[]][]>(() => {
    return Object.entries(type === "services" ? groupedServices : groupedProducts);
  }, [type, groupedServices, groupedProducts]);

  const totalItemsCount = type === "services" ? services.length : products.length;

  return (
    <div
      className="w-full rounded-2xl md:rounded-[22px] p-5 sm:p-6 transition-all duration-300"
      style={{
        background: "rgba(7, 11, 20, 0.96)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(69, 87, 109, 0.30)",
        boxShadow:
          "0 28px 80px -10px rgba(0, 0, 0, 0.92), 0 0 40px rgba(35, 54, 79, 0.25), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
    >
      {/* ── Top Header Row ── */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/50 font-medium">
            {type === "services" ? "SERVICES DIRECTORY" : "PRODUCT FLEET"}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-sky-300 border border-sky-500/20 ml-1">
            {totalItemsCount} {totalItemsCount === 1 ? "AVAILABLE" : "ONLINE"}
          </span>
        </div>

        <Link
          href={type === "services" ? "/services" : "/products"}
          onClick={onClose}
          className="group/link inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-sky-400 hover:text-sky-300 transition-colors"
        >
          <span>{type === "services" ? "ALL SERVICES" : "ALL PRODUCTS"}</span>
          <span className="transition-transform duration-200 group-hover/link:translate-x-1">
            ⟶
          </span>
        </Link>
      </div>

      {/* ── Dynamic Category Columns Grid ── */}
      {categoryEntries.length === 0 ? (
        <div className="py-10 text-center font-mono text-xs text-white/50 flex flex-col items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
          <span>SYNCHRONIZING AEROSPACE FLEET DATA...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categoryEntries.map(([categoryName, items]) => (
            <div key={categoryName} className="flex flex-col">
              {/* Category Column Header */}
              <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-[#8fa3bf]/75 mb-2.5 px-1 block truncate">
                {categoryName}
              </span>

              {/* Stack of Cards for this category */}
              <div className="space-y-2.5 flex-1">
                {items.map((item, itemIdx) => {
                  const isService = type === "services";
                  const s = item as FrontendService;
                  const p = item as FrontendProduct;

                  const targetSlug = isService
                    ? s.slug || slugify(s.title) || s.id
                    : p.slug || slugify(p.title) || p.id;

                  const href = isService
                    ? `/services/${targetSlug}`
                    : `/products/${targetSlug}`;

                  const title = item.title;
                  const description = cleanSnippet(
                    isService ? s.description : p.shortDescription || p.description
                  );

                  const rawImage = isService
                    ? s.image
                    : p.images && p.images.length > 0
                    ? p.images[0]
                    : null;
                  const imageSrc = rawImage || (isService ? "/drone.jpg" : "/website_images/10 inch Tew-k 01.jpg");

                  const badge = getBadge(title, categoryName, itemIdx);

                  return (
                    <Link
                      key={title + itemIdx}
                      href={href}
                      onClick={onClose}
                      className="group/card relative block p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer"
                      style={{
                        background: "rgba(255, 255, 255, 0.025)",
                        border: "1px solid rgba(69, 87, 109, 0.22)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(35, 54, 79, 0.30)";
                        e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.45)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(69, 87, 109, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.025)";
                        e.currentTarget.style.borderColor = "rgba(69, 87, 109, 0.22)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        {/* Left: Text & Badges */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <span className="text-[12px] font-bold text-white group-hover/card:text-sky-300 transition-colors tracking-tight line-clamp-1">
                              {title}
                            </span>
                            {badge && (
                              <span className="text-[8.5px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded border border-sky-500/35 bg-sky-500/10 text-sky-300 font-semibold flex-shrink-0">
                                {badge}
                              </span>
                            )}
                          </div>

                          <p
                            className="text-[10.5px] leading-tight text-[#8fa3bf]/85 font-mono line-clamp-2 group-hover/card:text-white/80 transition-colors"
                            style={{ letterSpacing: "0.01em" }}
                          >
                            {description}
                          </p>
                        </div>

                        {/* Right: Aerospace Preview Thumbnail */}
                        <div className="relative w-14 h-12 sm:w-16 sm:h-13 rounded-lg overflow-hidden flex-shrink-0 bg-black/60 border border-white/10 group-hover/card:border-sky-400/40 transition-colors">
                          <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            sizes="80px"
                            className="object-cover group-hover/card:scale-110 transition-transform duration-300"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(35, 54, 79, 0.35) 0%, transparent 60%, rgba(4, 6, 10, 0.65) 100%)",
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom Strip / Footer (Matching Skywin Theme) ── */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
        <div className="flex items-center gap-2 text-white/60">
          <span className="text-sky-400 font-bold text-xs">✦</span>
          <span className="text-white/85 font-semibold uppercase tracking-wider text-[10px] sm:text-[10.5px]">
            {type === "services"
              ? "100% SOVEREIGN AEROSPACE ENGINEERING"
              : "COMBAT & MISSION-PROVEN UAV FLEET"}
          </span>
          <span className="text-white/30 hidden md:inline">—</span>
          <span className="text-[#8fa3bf] hidden md:inline text-[10px]">
            {type === "services"
              ? "All operations engineered to strict civil aviation and defense standards."
              : "Tactical FPVs, heavy-lift quadcopters & long-range surveillance drones."}
          </span>
        </div>

        <div className="flex items-center gap-3 text-white/40 text-[9.5px] uppercase tracking-wider">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
}
