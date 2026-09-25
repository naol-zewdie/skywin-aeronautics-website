"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FrontendService } from "../../lib/types";

interface ServicesExplorerProps {
  services: FrontendService[];
}

export default function ServicesExplorer({ services }: ServicesExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Derive unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [services]);

  // Filter services by active category
  const filteredServices = useMemo(() => {
    if (selectedCategory === "ALL") return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <div className="w-full space-y-8">
      {/* ── Top Controls: Filter Pills & View Switcher (matching Image 2) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #23364F 0%, #45576D 100%)"
                    : "rgba(13, 20, 34, 0.6)",
                  border: isActive
                    ? "1px solid rgba(106, 126, 152, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.55)",
                  boxShadow: isActive
                    ? "0 0 16px rgba(69, 87, 109, 0.35)"
                    : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{
              background:
                viewMode === "grid"
                  ? "rgba(69, 87, 109, 0.25)"
                  : "rgba(13, 20, 34, 0.5)",
              border:
                viewMode === "grid"
                  ? "1px solid #6a7e98"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              color: viewMode === "grid" ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
            }}
          >
            {/* Grid icon */}
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{
              background:
                viewMode === "list"
                  ? "rgba(69, 87, 109, 0.25)"
                  : "rgba(13, 20, 34, 0.5)",
              border:
                viewMode === "list"
                  ? "1px solid #6a7e98"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              color: viewMode === "list" ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
            }}
          >
            {/* List icon */}
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Services Cards Presentation (matching Image 2) ── */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="text-sm text-white/50"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            No services found under &ldquo;{selectedCategory}&rdquo;.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredServices.map((service, idx) => (
            <Link
              key={service.slug || service.id || idx}
              href={`/services/${service.slug || service.id}`}
              className="group relative rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/25 hover:-translate-y-1.5"
              style={{
                background: "rgba(11, 17, 28, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
              }}
            >
              {/* Image & Header Container */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-black/40">
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                  <span
                    className="text-[9px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full text-[#8fa3bf] border border-[#45576D]/40 bg-[#141f33]/80 backdrop-blur-md font-semibold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    POPULAR
                  </span>

                  <span className="text-[#6a7e98] text-xs drop-shadow-[0_0_8px_rgba(106,126,152,0.8)]">
                    ✦
                  </span>
                </div>

                {/* Service Visual */}
                <Image
                  src={service.image || "/drone.jpg"}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-108 brightness-90 group-hover:brightness-100"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Gradient shade at bottom of image */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(11, 17, 28, 0.95) 100%)",
                  }}
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <h3
                    className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight line-clamp-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {service.title}
                  </h3>

                  <p
                    className="text-xs text-white/55 leading-relaxed line-clamp-2"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Footer link */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-wider text-white/45 group-hover:text-white transition-colors font-mono inline-flex items-center gap-1.5"
                  >
                    <span>EXPLORE</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredServices.map((service, idx) => (
            <Link
              key={service.slug || service.id || idx}
              href={`/services/${service.slug || service.id}`}
              className="group relative rounded-2xl p-5 sm:p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-300 hover:border-white/25 hover:-translate-y-1"
              style={{
                background: "rgba(11, 17, 28, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black/40">
                  <Image
                    src={service.image || "/drone.jpg"}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="80px"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded text-[#8fa3bf] border border-[#45576D]/40 bg-[#141f33]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {service.category || "SERVICE"}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-xs text-white/55 font-mono line-clamp-1 max-w-xl"
                  >
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center self-end sm:self-center">
                <span className="text-xs uppercase tracking-wider font-mono text-white/50 group-hover:text-white transition-colors flex items-center gap-1.5">
                  <span>EXPLORE</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
