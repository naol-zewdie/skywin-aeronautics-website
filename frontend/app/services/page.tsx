import Card from "../components/Card";
import Container from "../components/Container";
import Section from "../components/Section";

// Smooth scroll to top function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const services = [
  {
    title: "Aerial Mapping and Surveying",
    description: "We provide accurate aerial mapping and surveying solutions using advanced drone technology. Our services support land assessment, construction planning, and geospatial data collection. We ensure high-resolution outputs that help clients make informed decisions efficiently.",
    image: "/drone.jpg",
  },
  {
    title: "Drone Piloting Training",
    description: "Our drone piloting training equips individuals with practical flying skills and industry knowledge. Trainees learn safety procedures, flight control, and mission planning. The program is designed for both beginners and those looking to enhance their expertise.",
    image: "/simulation.jpg",
  },
  {
    title: "Technician Training",
    description: "We offer technician training focused on drone maintenance, troubleshooting, and system management. Participants gain hands-on experience with real equipment and tools. This training prepares technicians to ensure reliable and safe drone operations.",
    image: "/consulting.jpg",
  },
  {
    title: "Drone Engineering Training",
    description: "Our drone engineering training covers design, assembly, and system integration. Students learn the technical foundations behind drone technology and innovation. The course is ideal for those interested in building and improving drone systems.",
    image: "/drone.jpg",
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

export default function ServicesPage() {
  return (
    <main className="bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Container>
        <Section className="pt-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">What we do</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--primary)] sm:text-5xl">
              Comprehensive aerospace services built for growth.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Our service offerings are designed to support aerospace programs at every stage, from early concept through production and delivery.
            </p>
          </div>
        </Section>

        <Section>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.title} title={service.title} description={service.description} image={service.image} />
            ))}
          </div>
        </Section>
      </Container>
      
      {/* Floating Scroll to Top Button */}
      <button
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
    </main>
  );
}
