import Container from "../components/Container";
import Section from "../components/Section";
import ProductsGrid from "../components/ProductsGrid";

export const metadata = {
  title: "Skywin Aeronautics | Products",
  description: "View featured aerospace products and solutions from Skywin Aeronautics.",
};

export default function ProductsPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">Products</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Aerospace products that deliver excellence.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Our product lineup showcases cutting-edge aerospace solutions designed for reliability, performance, and innovation.
            </p>
          </div>
        </Section>

        <Section>
          <ProductsGrid />
        </Section>
      </Container>
    </main>
  );
}
