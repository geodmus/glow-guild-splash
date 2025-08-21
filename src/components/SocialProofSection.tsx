import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Star, Heart } from "lucide-react";

export const SocialProofSection = () => {
  const brandLogos = [
    "Glossier", "The Ordinary", "Fenty Beauty", "Rare Beauty", "Drunk Elephant"
  ];

  const stats = [
    { icon: Users, label: "Active Creators", value: "2,500+", trend: "+15%" },
    { icon: TrendingUp, label: "Avg. Engagement", value: "8.2%", trend: "+3x" },
    { icon: Star, label: "Brand Satisfaction", value: "4.9/5", trend: "98%" },
    { icon: Heart, label: "UGC Posts", value: "50K+", trend: "+200%" }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-subtle">
      <div className="max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl shadow-card border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
              <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                {stat.trend}
              </Badge>
            </div>
          ))}
        </div>

        {/* Brand Logos */}
        <div className="text-center">
          <p className="text-muted-foreground mb-8 text-lg">
            Trusted by leading indie beauty brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {brandLogos.map((brand, index) => (
              <div 
                key={index}
                className="text-2xl font-semibold text-primary hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>

        {/* Creator Network CTA */}
        <div className="text-center mt-16 p-8 bg-accent/5 rounded-2xl border border-accent/20">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="text-success font-medium">Live Creator Network</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">
            Join 2,500+ Content Creators
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our vetted network includes micro-influencers across all beauty categories, 
            from skincare enthusiasts to makeup artists, ready to create authentic content for your brand.
          </p>
        </div>
      </div>
    </section>
  );
};