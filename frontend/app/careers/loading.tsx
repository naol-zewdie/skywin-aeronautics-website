export default function Loading() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
          <div className="h-3 w-24 mx-auto bg-[color:var(--muted)]/10 rounded" />
          <div className="h-12 w-3/4 mx-auto bg-[color:var(--muted)]/10 rounded" />
          <div className="h-5 w-2/3 mx-auto bg-[color:var(--muted)]/10 rounded" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-6 space-y-3">
              <div className="h-5 w-2/3 bg-[color:var(--muted)]/10 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[color:var(--muted)]/10 rounded" />
                <div className="h-3 w-4/5 bg-[color:var(--muted)]/10 rounded" />
                <div className="h-3 w-3/4 bg-[color:var(--muted)]/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
