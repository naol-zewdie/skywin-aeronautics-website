import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <h2 className="text-4xl font-bold text-[color:var(--primary)] mb-4">404 - Page Not Found</h2>
      <p className="text-[color:var(--muted)] mb-8 max-w-md mx-auto">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--accent)] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
