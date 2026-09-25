export default function Loading() {
  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-hidden pt-24 sm:pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 space-y-16 animate-pulse">
        {/* Top Hero Skeleton */}
        <div className="max-w-4xl mx-auto text-center space-y-6 pt-6 sm:pt-10">
          <div className="h-4 w-40 mx-auto bg-white/[0.05] rounded-full" />
          <div className="h-14 sm:h-20 w-3/4 mx-auto bg-white/[0.06] rounded-2xl" />
          <div className="h-4 w-2/3 mx-auto bg-white/[0.03] rounded" />
        </div>

        {/* Filter and Cards Grid Skeleton */}
        <div className="space-y-8">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-full bg-white/[0.04]" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-[#0b111c]/60 overflow-hidden"
              >
                <div className="aspect-[16/10] bg-white/[0.04]" />
                <div className="p-6 space-y-4">
                  <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
                  <div className="h-3 w-full bg-white/[0.03] rounded" />
                  <div className="h-3 w-4/5 bg-white/[0.03] rounded" />
                  <div className="pt-4 border-t border-white/[0.06] flex justify-between">
                    <div className="h-3 w-28 bg-white/[0.03] rounded" />
                    <div className="h-3 w-4 bg-white/[0.03] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
