'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <h2 className="text-3xl font-bold text-[color:var(--primary)] mb-4">Something went wrong!</h2>
      <p className="text-[color:var(--muted)] mb-8 max-w-md mx-auto">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--accent)] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-[color:var(--primary)] text-[color:var(--primary)] rounded-lg hover:bg-[color:var(--primary)] hover:text-white transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
