import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Users, Eye, Heart } from "lucide-react";

export const DataInsightsSection = () => {
  const metrics = [
    { label: "Engagement Rate", value: "8.2%", change: "+125%", color: "text-success" },
    { label: "Conversion Rate", value: "3.4%", change: "+89%", color: "text-accent" },
    { label: "Brand Awareness", value: "+67%", change: "+67%", color: "text-luxury-gold" },
    { label: "Cost per Acquisition", value: "$12", change: "-45%", color: "text-success" }
  ];

  const insights = [
    {
      icon: Target,
      title: "Audience Demographics",
      description: "Get detailed insights into who's engaging with your content and making purchases.",
      dataPoint: "25-34 age group shows 3x higher conversion"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track real-time performance metrics and ROI across all creator partnerships.",
      dataPoint: "Average 8.2% engagement vs industry 2.1%"
    },
    {
      icon: Users,
      title: "Creator Matching",
      description: "AI-powered matching based on audience overlap and content performance.",
      dataPoint: "94% brand-creator compatibility rate"
    }
  ];

  return (
    <section className="py-20 px-4 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border border-primary-foreground/20 rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-primary-foreground/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-foreground/5 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-6">
            <BarChart3 className="w-8 h-8 text-accent" />
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              Data Insights
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Beyond Content Creation: Actionable Data
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Every piece of UGC generates valuable consumer insights. 
            We transform creator content into strategic business intelligence.
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl font-bold mb-2">{metric.value}</div>
              <div className="text-sm text-primary-foreground/70 mb-2">{metric.label}</div>
              <div className={`text-xs font-medium ${metric.color}`}>
                {metric.change} vs industry avg
              </div>
            </div>
          ))}
        </div>

        {/* Insights Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-primary-foreground/10 animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <insight.icon className="w-12 h-12 text-accent mb-6" />
              <h3 className="text-xl font-bold mb-4">{insight.title}</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                {insight.description}
              </p>
              <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Key Insight</span>
                </div>
                <p className="text-sm text-primary-foreground/90 font-medium">
                  {insight.dataPoint}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo CTA */}
        <div className="text-center bg-gradient-data rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-foreground/5 backdrop-blur-sm" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">
              See Your Data Dashboard in Action
            </h3>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Get a personalized demo of our analytics platform and see how 
              your brand can leverage creator data for strategic decision-making.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline-luxury" 
                size="lg"
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              >
                View Demo Dashboard
              </Button>
              <Button 
                variant="outline-luxury" 
                size="lg"
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              >
                Request Custom Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};