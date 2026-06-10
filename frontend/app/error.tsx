"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <h1 className="text-4xl font-bold text-[color:var(--primary)]">Something went wrong</h1>
      <p className="text-lg text-[color:var(--muted)] text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </main>
  );
}
