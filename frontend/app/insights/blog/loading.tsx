export default function Loading() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="max-w-3xl space-y-6 mb-16">
          <div className="h-3 w-16 bg-[color:var(--muted)]/10 rounded" />
          <div className="h-12 w-3/4 bg-[color:var(--muted)]/10 rounded" />
          <div className="h-5 w-2/3 bg-[color:var(--muted)]/10 rounded" />
        </div>
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col md:flex-row gap-8 p-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]">
              <div className="md:w-1/3 aspect-[16/9] bg-[color:var(--muted)]/10 rounded-xl" />
              <div className="md:w-2/3 space-y-3">
                <div className="h-4 w-16 bg-[color:var(--muted)]/10 rounded-full" />
                <div className="h-6 w-3/4 bg-[color:var(--muted)]/10 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-[color:var(--muted)]/10 rounded" />
                  <div className="h-3 w-4/5 bg-[color:var(--muted)]/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
