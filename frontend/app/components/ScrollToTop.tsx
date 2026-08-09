"use client";

export default function ScrollToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[color:var(--accent)]/50 ring-2 ring-[color:var(--accent)]/20 ring-offset-4 ring-offset-[color:var(--background)] md:bottom-12 md:right-12"
      aria-label="Scroll to top"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M5 10l7-7m0 0l-7 7" />
      </svg>
    </button>
  );
}
