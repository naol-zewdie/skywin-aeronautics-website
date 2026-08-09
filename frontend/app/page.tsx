export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import Button from "./components/Button";
import Container from "./components/Container";
import Section from "./components/Section";
import ProductsSection from "./components/ProductsSection";

const services = [
  {
    title: "Aerial Mapping and Surveying",
    description: "We provide accurate aerial mapping and surveying solutions using advanced drone technology. Our services support land assessment, construction planning, and geospatial data collection. We ensure high-resolution outputs that help clients make informed decisions efficiently.",
    image: "/assets/surveying.JPG",
  },
  {
    title: "Drone Piloting Training",
    description: "Our drone piloting training equips individuals with practical flying skills and industry knowledge. Trainees learn safety procedures, flight control, and mission planning. The program is designed for both beginners and those looking to enhance their expertise.",
    image: "/assets/training.JPG",
  },
  {
    title: "Technician Training",
    description: "We offer technician training focused on drone maintenance, troubleshooting, and system management. Participants gain hands-on experience with real equipment and tools. This training prepares technicians to ensure reliable and safe drone operations.",
    image: "/assets/dronetechnician.jpg",
  },
  {
    title: "Drone Engineering Training",
    description: "Our drone engineering training covers design, assembly, and system integration. Students learn the technical foundations behind drone technology and innovation. The course is ideal for those interested in building and improving drone systems.",
    image: "/assets/vtolservice.JPG",
  },
  {
    title: "Consultancy",
    description: "We provide expert consultancy services tailored to your drone-related needs. Our team supports project planning, technology selection, and operational strategy. We help organizations adopt drone solutions effectively and responsibly.",
    image: "/simulation.jpg",
  },
  {
    title: "Agricultural and Infrastructure Inspection",
    description: "Our drones enable efficient inspection of agricultural fields and infrastructure assets. We help identify issues such as crop health concerns, structural damage, or maintenance needs. This approach saves time while improving accuracy and safety.",
    image: "/consulting.jpg",
  },
  {
    title: "Customized Missions",
    description: "We design and execute customized drone missions based on specific client requirements. Whether for research, monitoring, or specialized operations, we adapt our solutions accordingly. Our team ensures precision, flexibility, and reliable results in every project.",
    image: "/drone.jpg",
  },
];


export default function Home() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        {/* Hero Section */}
        <Section className="pt-12">
          <div className="relative overflow-hidden rounded-[2rem] min-h-[520px] flex items-center">
            {/* Mesh gradient background */}
            <div className="absolute inset-0" style={{background: 'var(--gradient-mesh)'}} />
            
            {/* Animated gradient orbs */}
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-mesh-flow" style={{background: 'radial-gradient(circle, rgba(35,54,79,0.3) 0%, transparent 70%)'}} />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 animate-mesh-flow" style={{background: 'radial-gradient(circle, rgba(69,87,109,0.25) 0%, transparent 70%)', animationDelay: '-3s'}} />
            
            {/* Tech grid overlay */}
            <div className="absolute inset-0 tech-grid opacity-30" />
            
            {/* Image background with dark overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/hero_background.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#23364F]/95 via-[#23364F]/75 to-[#23364F]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#23364F]/40 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="relative max-w-3xl space-y-8 px-10 py-20 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/80">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow" />
                Precision Aerospace Engineering
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
                Advancing Aerospace Innovation<br />
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">Through Precision Engineering</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/80">
                Skywin Aeronautics delivers cutting-edge aerospace solutions with advanced engineering, modern design, and proven performance for the most demanding applications.
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Button href="/services" className="relative animate-ripple-glow dark:text-white">
                  <span className="relative z-10">Explore Services</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Services Section - Aesthetic Cards */}
          <div className="mt-6 relative">
            {/* Section header */}
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)] font-medium">What We Offer</p>
              <h2 className="text-3xl font-bold mt-3 text-[color:var(--primary)]">Company Overview</h2>
              <p className="mt-3 max-w-2xl mx-auto text-base leading-7 text-[color:var(--muted)]">
                We help aerospace organizations accelerate development with services for engineering, design, validation, manufacturing, and operational consulting.
              </p>
            </div>
            
            {/* Service cards grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 4).map((service, i) => (
                <Link
                  key={service.title}
                  href="/services"
                  className="group relative block overflow-hidden rounded-2xl bg-[color:var(--background-alt)] border border-[color:var(--border)] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    boxShadow: 'var(--shadow-glass)',
                    animation: `fade-in-up 0.6s ease-out ${i * 0.1}s both`
                  }}
                >
                  {/* Glow on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#23364F]/0 via-[#45576D]/0 to-[#23364F]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-xl bg-[color:var(--border)] mb-5 aspect-[4/3]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={320}
                      height={240}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#23364F]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-[color:var(--primary)] group-hover:text-[#23364F] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-6 text-[color:var(--muted)] line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#23364F] to-[#45576D] transition-all duration-500 rounded-full" />
                </Link>
              ))}
            </div>
          </div>
        </Section>

        {/* Featured Products Section */}
        <Section className="relative overflow-hidden rounded-[2rem] px-6 py-16 sm:px-10 sm:py-20" backgroundImage="/website_images/background.jpg">
          
          <div className="relative space-y-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--foreground)] font-medium">Featured Products</p>
                <h2 className="text-3xl font-bold mt-2 text-[color:var(--foreground)]">Selected Products</h2>
              </div>
              <div>
                <Button
                  href="/products"
                  variant="primary"
                  className="dark:text-white"
                >
                  View all products
                </Button>
              </div>
            </div>
            <ProductsSection />
          </div>
        </Section>

        {/* CTA Section */}
        <Section>
          <div className="relative overflow-hidden rounded-[2rem] p-12 sm:p-16">
            {/* Animated gradient background */}
            <div className="absolute inset-0" style={{background: 'var(--gradient-primary)'}} />
            <div className="absolute inset-0 opacity-30" style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }} />
            <div className="absolute inset-0 tech-grid opacity-20" />
            
            {/* Glowing orbs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 animate-mesh-flow" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)'}} />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-15 animate-mesh-flow" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', animationDelay: '-4s'}} />
            
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to work with Skywin?
                </h2>
                <p className="mt-4 text-lg leading-8 text-white/80">
                  Contact our team for aerospace engineering, consulting, or collaboration inquiries.
                </p>
              </div>
              <Button
                href="/contact"
                className="!bg-white dark:!bg-[#23364F] !text-[#23364F] dark:!text-white hover:!bg-white/90 dark:hover:!bg-[#2c4463] hover:!shadow-xl hover:!shadow-white/25 !ring-white/30 dark:!ring-[#45576D]/30"
              >
                Start a conversation
              </Button>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}
