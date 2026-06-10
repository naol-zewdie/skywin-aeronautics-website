import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <h1 className="text-4xl font-bold text-[color:var(--primary)]">Page not found</h1>
      <p className="text-lg text-[color:var(--muted)] text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Go home
      </Link>
    </main>
  );
}
