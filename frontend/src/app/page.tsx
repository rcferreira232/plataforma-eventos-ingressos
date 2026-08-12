import { OrganizerCta } from "@/components/organizer-cta";
import { TrendingSection } from "@/components/trending-section";
import { VenuesSection } from "@/components/venues-section";
import { CategoriesSection } from "@/components/categories-section";
import { FeaturesSection } from "@/components/features-section";
import { HeroCarousel } from "@/components/hero-carousel";

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <main className='flex-1'>
        <HeroCarousel />
        <CategoriesSection />
        <TrendingSection />
        <FeaturesSection />
        <VenuesSection />
        <OrganizerCta />
      </main>
    </div>
  );
}
