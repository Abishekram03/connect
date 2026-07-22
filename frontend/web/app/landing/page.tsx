export const dynamic = "force-dynamic";

import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { LogoMarquee } from "./components/logo-marquee";
import { Features } from "./components/features";
import { ProductSection } from "./components/product-section";
import { Globalization } from "./components/globalization";
import { Metrics } from "./components/metrics";
import { Testimonials } from "./components/testimonials";
import { Pricing } from "./components/pricing";
import { FinalCTA } from "./components/final-cta";
import { Footer } from "./components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent">
      <Nav />
      <main>
        <Hero />
        <LogoMarquee />
        <Features />
        <ProductSection />
        <Globalization />
        <Metrics />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
