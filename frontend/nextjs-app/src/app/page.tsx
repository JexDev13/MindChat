import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      {/* Footer and other sections could be added here */}
      <footer className="py-10 text-center text-muted-foreground border-t border-white/10">
        <p>&copy; {new Date().getFullYear()} MindChat. All rights reserved.</p>
      </footer>
    </main>
  );
}
