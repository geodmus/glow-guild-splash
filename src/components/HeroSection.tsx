import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AudienceToggle } from "./AudienceToggle";
import { ArrowRight, Play, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-beauty-ugc.jpg";

type Audience = 'brands' | 'creators';

const audienceContent = {
  brands: {
    headline: "Scale Authentic Beauty Content That Drives Sales",
    subheadline: "Connect with vetted micro-influencers who create genuine UGC while gaining valuable consumer insights that fuel your marketing strategy.",
    cta: "Request a Demo",
    secondaryCta: "View Case Study",
    features: [
      { icon: TrendingUp, text: "3x higher engagement rates" },
      { icon: Users, text: "Vetted creator network" },
      { icon: Play, text: "Data-driven insights" }
    ]
  },
  creators: {
    headline: "Get Paid for the Content You're Already Creating",
    subheadline: "Join our exclusive network of micro-influencers and monetize your authentic beauty content with brands that value genuine connections.",
    cta: "Join Creator Network",
    secondaryCta: "See Opportunities",
    features: [
      { icon: TrendingUp, text: "Fair compensation" },
      { icon: Users, text: "Exclusive brand partnerships" },
      { icon: Play, text: "Creative freedom" }
    ]
  }
};

export const HeroSection = () => {
  const [currentAudience, setCurrentAudience] = useState<Audience>('brands');
  const content = audienceContent[currentAudience];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/95" />
        <div className="absolute inset-0 bg-gradient-subtle opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Brand Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            The Glow Guild
          </h1>
          <p className="text-muted-foreground italic">
            Where Authentic Beauty Content Meets Data-Driven Brands
          </p>
        </div>

        {/* Audience Toggle */}
        <div className="mb-12 max-w-md mx-auto animate-scale-in">
          <AudienceToggle 
            onAudienceChange={setCurrentAudience}
            currentAudience={currentAudience}
          />
        </div>

        {/* Dynamic Content */}
        <div className="mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
            {content.headline}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            {content.subheadline}
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {content.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 shadow-card"
              >
                <feature.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant={currentAudience === 'brands' ? 'brand' : 'creator'} 
              size="lg"
              className="text-lg px-8 py-6 h-auto animate-pulse-glow"
            >
              {content.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline-luxury" 
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              {content.secondaryCta}
            </Button>
          </div>
        </div>

        {/* Social Proof Ticker */}
        <div className="text-center text-muted-foreground animate-fade-in">
          <p className="text-sm mb-2">Trusted by indie beauty brands and 2,500+ creators</p>
          <div className="flex justify-center items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs">Live network</span>
          </div>
        </div>
      </div>
    </section>
  );
};