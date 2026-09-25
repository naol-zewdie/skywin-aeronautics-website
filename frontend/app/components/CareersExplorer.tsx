"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FrontendCareer } from "../../lib/types";

interface CareersExplorerProps {
  careers: FrontendCareer[];
}

export default function CareersExplorer({ careers }: CareersExplorerProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Derive unique filter pills (ALL + types + locations)
  const filterPills = useMemo(() => {
    const types = new Set<string>();
    careers.forEach((c) => {
      if (c.type) types.add(c.type.toUpperCase());
    });
    return ["ALL", ...Array.from(types)];
  }, [careers]);

  // Filter careers based on active filter
  const filteredCareers = useMemo(() => {
    if (selectedFilter === "ALL") return careers;
    return careers.filter(
      (c) => c.type && c.type.toUpperCase() === selectedFilter
    );
  }, [careers, selectedFilter]);

  return (
    <div className="w-full space-y-10">
      {/* ── Subtitle / Browse Section (Matching Reference Image 1 bottom) ── */}
      <div className="space-y-4 pt-4">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#6a7e98]">
          BROWSE OPENINGS
        </p>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Pick a role — join our aerospace team.
        </h2>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {filterPills.map((pill) => {
            const isActive = selectedFilter === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedFilter(pill)}
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
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Latest Bar: Count + View Switcher (Matching Reference Image 2 top bar) ── */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-2">
        <span className="tracking-[0.16em] uppercase">LATEST</span>

        <div className="flex items-center gap-3">
          <span className="tracking-widest uppercase">
            {filteredCareers.length} {filteredCareers.length === 1 ? "OPENING" : "OPENINGS"}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                background:
                  viewMode === "grid"
                    ? "rgba(69, 87, 109, 0.35)"
                    : "rgba(13, 20, 34, 0.6)",
                border:
                  viewMode === "grid"
                    ? "1px solid #6a7e98"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                color: viewMode === "grid" ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                background:
                  viewMode === "list"
                    ? "rgba(69, 87, 109, 0.35)"
                    : "rgba(13, 20, 34, 0.6)",
                border:
                  viewMode === "list"
                    ? "1px solid #6a7e98"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                color: viewMode === "list" ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Careers Presentation Grid (Matching Reference Image 2 Cards) ── */}
      {filteredCareers.length === 0 ? (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#0b111c]/60">
          <p
            className="text-sm text-white/50"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            No open roles found under &ldquo;{selectedFilter}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSelectedFilter("ALL")}
            className="mt-4 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider text-sky-400 border border-sky-500/30 hover:bg-sky-500/10 transition-colors"
          >
            View all positions
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCareers.map((career) => {
            const careerSlug = career.slug || career.id || career.title.toLowerCase().replace(/\s+/g, "-");
            const careerHref = `/careers/${encodeURIComponent(careerSlug)}`;
            const displayImage = career.image || "/drone.jpg";
            const roleType = (career.type || "full-time").toUpperCase();
            const locationStr = (career.location || "Addis Ababa, Ethiopia").toUpperCase();

            return (
              <Link
                key={career.title}
                href={careerHref}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/25 hover:-translate-y-1.5"
                style={{
                  background: "rgba(11, 17, 28, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Image & Badges Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  {/* Top Badges Overlay (Matching Image 2) */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-md text-[#8fa3bf] border border-white/10 bg-[#070d18]/80 backdrop-blur-md font-mono font-semibold">
                      {roleType}
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded text-white/70 bg-black/60 backdrop-blur-md font-mono">
                      {locationStr.includes("ADDIS") ? "ADDIS ABABA" : "HYBRID"}
                    </span>
                  </div>

                  {/* Career Cover Image */}
                  <Image
                    src={displayImage}
                    alt={career.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-106 brightness-90 group-hover:brightness-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Bottom Vignette Gradient */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 45%, rgba(11, 17, 28, 0.95) 100%)",
                    }}
                  />
                </div>

                {/* Card Body (Matching Image 2 Typography & Spacing) */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-3">
                    <h3
                      className="text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight line-clamp-2 leading-[1.25]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {career.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed line-clamp-3 font-mono">
                      {career.description}
                    </p>

                    <p className="text-[11px] font-mono text-[#6a7e98] flex items-center gap-1.5 pt-1">
                      <span>📍</span>
                      <span>{career.location || "Addis Ababa, Ethiopia"}</span>
                    </p>
                  </div>

                  {/* Bottom Metadata & Arrow (Matching Image 2 Footer) */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/45">
                    <div className="flex items-center gap-2 tracking-wider">
                      <span className="text-white/60 font-semibold">
                        AEROSPACE DIVISION
                      </span>
                      <span>·</span>
                      <span>{roleType}</span>
                    </div>

                    <span className="text-sm transition-transform duration-200 group-hover:translate-x-1.5 text-white/50 group-hover:text-white">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredCareers.map((career) => {
            const careerSlug = career.slug || career.id || career.title.toLowerCase().replace(/\s+/g, "-");
            const careerHref = `/careers/${encodeURIComponent(careerSlug)}`;
            const displayImage = career.image || "/drone.jpg";

            return (
              <Link
                key={career.title}
                href={careerHref}
                className="group relative rounded-2xl p-5 sm:p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-300 hover:border-white/25 hover:-translate-y-1"
                style={{
                  background: "rgba(11, 17, 28, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-24 sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/40">
                    <Image
                      src={displayImage}
                      alt={career.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="112px"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/45">
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[#8fa3bf]">
                        {(career.type || "full-time").toUpperCase()}
                      </span>
                      <span>·</span>
                      <span>{career.location || "Addis Ababa, Ethiopia"}</span>
                    </div>

                    <h3
                      className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {career.title}
                    </h3>

                    <p className="text-xs text-white/55 font-mono line-clamp-1 max-w-xl">
                      {career.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center self-end sm:self-center">
                  <span className="text-xs uppercase tracking-wider font-mono text-white/50 group-hover:text-white transition-colors flex items-center gap-1.5">
                    <span>VIEW ROLE</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
