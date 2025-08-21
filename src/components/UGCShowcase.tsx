import { Button } from "@/components/ui/button";
import { Play, Heart, MessageCircle, Share } from "lucide-react";
import ugcUnboxing from "@/assets/ugc-unboxing.jpg";
import ugcSkincare from "@/assets/ugc-skincare.jpg";
import ugcMakeup from "@/assets/ugc-makeup.jpg";

export const UGCShowcase = () => {
  const ugcContent = [
    {
      image: ugcUnboxing,
      title: "Unboxing Experience",
      creator: "@beautylovee",
      engagement: "12.5K",
      type: "video"
    },
    {
      image: ugcSkincare,
      title: "Morning Routine",
      creator: "@glowwithsarah",
      engagement: "8.2K",
      type: "video"
    },
    {
      image: ugcMakeup,
      title: "Get Ready With Me",
      creator: "@makeupbylex",
      engagement: "15.7K",
      type: "video"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Real Content. Real Results.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our creators bring brands to life through authentic, 
            unpolished content that builds genuine connections with audiences.
          </p>
        </div>

        {/* UGC Gallery */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {ugcContent.map((content, index) => (
            <div 
              key={index}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-luxury transition-all duration-500 hover:scale-105"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="luxury" 
                    size="icon"
                    className="w-16 h-16 rounded-full"
                  >
                    <Play className="w-6 h-6" />
                  </Button>
                </div>
                {/* Video indicator */}
                <div className="absolute top-4 left-4">
                  <div className="bg-primary/80 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                    {content.type}
                  </div>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-6">
                <h3 className="font-semibold text-primary mb-2">{content.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">by {content.creator}</p>
                
                {/* Engagement Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{content.engagement}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">1.2K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="w-4 h-4" />
                      <span className="text-xs">340</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-luxury rounded-2xl p-12 text-primary-foreground">
          <h3 className="text-3xl font-bold mb-4">
            Ready to see your brand come to life?
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Our creators are waiting to showcase your products through 
            authentic, engaging content that converts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline-luxury" 
              size="lg"
              className="bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-background/20"
            >
              Request Demo
            </Button>
            <Button 
              variant="outline-luxury" 
              size="lg"
              className="bg-background/10 border-primary-foreground/30 text-primary-foreground hover:bg-background/20"
            >
              Join Creator Network
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};