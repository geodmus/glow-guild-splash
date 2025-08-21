import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { UGCShowcase } from "@/components/UGCShowcase";
import { DataInsightsSection } from "@/components/DataInsightsSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <SocialProofSection />
        <UGCShowcase />
        <DataInsightsSection />
      </main>
    </div>
  );
};

export default Index;
