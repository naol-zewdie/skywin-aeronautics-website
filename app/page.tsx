import Image from "next/image";
import Link from "next/link";
import Button from "./components/Button";
import Container from "./components/Container";
import Section from "./components/Section";
import ProductsSection from "./components/ProductsSection";

export const metadata = {
  title: "Skywin Aeronautics | Home",
  description:
    "Skywin Aeronautics offers aerospace engineering, design, manufacturing, and consulting services for modern aerospace programs.",
};

const services = [
  {
    title: "Aerospace Engineering",
    description: "Systems engineering and structural design for high-reliability aerospace programs.",
    image: "/drone.jpg",
  },
  {
    title: "Design & Simulation",
    description: "Digital modeling, analysis, and simulation services tailored to aerospace systems.",
    image: "/simulation.jpg",
  },
  {
    title: "Manufacturing",
    description: "Manufacturing readiness support and process planning for aerospace production.",
    image: "/featured_work.jpg",
  },
  {
    title: "Consulting",
    description: "Strategic advisory for program execution, compliance, and operations improvement.",
    image: "/consulting.jpg",
  },
];

const products = [
  {
    title: "Flight Control Systems",
    description:
      "Advanced avionics and flight control solutions for modern aircraft with enhanced safety and reliability features.",
    image: "/drone.jpg",
  },
  {
    title: "Aerospace Components",
    description:
      "High-precision structural components and assemblies designed for demanding aerospace applications.",
    image: "/simulation.jpg",
  },
  {
    title: "Navigation Systems",
    description:
      "State-of-the-art navigation and guidance systems for commercial and military aviation platforms.",
    image: "/consulting.jpg",
  },
];

export default function Home() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div
            className="relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-16"
            style={{
              backgroundImage: "url('/hero_background.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Black overlay that decreases opacity from left to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 via-black/40 to-transparent" />
            
            <div className="relative max-w-3xl space-y-8 text-white text-left">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl animate-pulse">
                Advancing Aerospace Innovation Through Precision Engineering
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white animate-fade-in">
                Skywin Aeronautics delivers cutting-edge aerospace solutions with advanced engineering, modern design, and proven performance for the most demanding applications.
              </p>
              <div className="flex flex-col items-start gap-4">
                <Button href="/services" className="relative animate-glowing-loop">
                  <span className="relative z-10">Explore Services</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--background)] p-10 shadow-sm">
            <div className="space-y-5">
              <h2 className="text-2xl font-bold tracking-tight text-[color:var(--primary)]">Company overview</h2>
              <p className="text-base leading-7 text-[color:var(--muted)]">
                We help aerospace organizations accelerate development with services for engineering, design, validation, manufacturing, and operational consulting.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {services.slice(0, 4).map((service) => (
                  <div key={service.title} className="rounded-3xl bg-[color:var(--background-alt)] p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[color:var(--accent)]/50 hover:-translate-y-2 hover:animate-slide-up">
                    <div className="mx-auto mb-5 w-5/6 overflow-hidden rounded-3xl bg-[color:var(--border)] ring-1 ring-[color:var(--border)]">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={320}
                        height={320}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="mx-auto w-5/6 space-y-3 text-left">
                      <h3 className="text-base font-semibold text-[color:var(--primary)]">{service.title}</h3>
                      <p className="text-sm leading-6 text-[color:var(--muted)]">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section className="relative overflow-hidden rounded-[2rem] text-[color:var(--foreground)] px-6 py-14 sm:px-10 sm:py-16">
          <div className="relative space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="ml-4 md:ml-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[#23364F]">Featured products</p>
                <h2 className="text-3xl font-semibold text-[#23364F]">Selected products</h2>
              </div>
              <div className="mr-4 md:mr-6">
                <Button
                  href="/products"
                  variant="ghost"
                  className="!bg-transparent text-[#23364F] border-[#23364F] hover:!bg-[#23364F]/10 hover:text-[#23364F]"
                >
                  View all products
                </Button>
              </div>
            </div>
            <ProductsSection />
          </div>
        </Section>

        <Section>
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--background)] p-10 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-[color:var(--primary)]">Ready to work with Skywin?</h2>
                <p className="mt-4 text-lg leading-8 text-[color:var(--muted)]">
                  Contact our team for aerospace engineering, consulting, or collaboration inquiries.
                </p>
              </div>
              <Button href="/contact">Start a conversation</Button>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}
