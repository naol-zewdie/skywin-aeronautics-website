// Renders: [ LABEL TEXT ]
// Monospace, letter-spaced, dim — matches weevolveit.com section tags
export default function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="inline-block text-xs tracking-[0.22em] uppercase"
      style={{
        fontFamily: 'var(--font-mono)',
        color: 'rgba(240,244,255,0.40)',
        letterSpacing: '0.22em',
      }}
    >
      [ {children} ]
    </p>
  );
}
