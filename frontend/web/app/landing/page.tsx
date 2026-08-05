export const dynamic = "force-dynamic";

import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { ProductSection } from "./components/product-section";
import { Globalization } from "./components/globalization";
import { Pricing } from "./components/pricing";
import { FinalCTA } from "./components/final-cta";
import { Footer } from "./components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent">
      <Nav />
      <main>
        <Hero />
        <Features />
        <ProductSection />
        <Globalization />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
