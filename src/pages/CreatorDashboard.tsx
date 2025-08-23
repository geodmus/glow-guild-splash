import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Share2, DollarSign, Calendar, Briefcase } from "lucide-react";

const CreatorDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    {
      title: "Total Followers",
      value: "125K",
      change: "+2.3K this month",
      icon: Heart,
      color: "text-accent"
    },
    {
      title: "Avg. Engagement",
      value: "8.7%",
      change: "+0.5% from last month",
      icon: Eye,
      color: "text-success"
    },
    {
      title: "Brand Partnerships",
      value: "6",
      change: "+2 this quarter",
      icon: Briefcase,
      color: "text-luxury-gold"
    },
    {
      title: "Earnings (30d)",
      value: "$3,240",
      change: "+18% from last month",
      icon: DollarSign,
      color: "text-primary"
    }
  ];

  const recentPosts = [
    { title: "Summer Skincare Routine", engagement: "12.4K", date: "2 days ago", type: "Sponsored" },
    { title: "Morning Makeup Look", engagement: "8.9K", date: "4 days ago", type: "Organic" },
    { title: "Product Unboxing", engagement: "15.2K", date: "1 week ago", type: "Sponsored" }
  ];

  const upcomingCampaigns = [
    { brand: "Glow Beauty Co.", campaign: "Fall Collection Launch", deadline: "Oct 15", status: "In Progress" },
    { brand: "Luxe Skincare", campaign: "Holiday Gift Guide", deadline: "Nov 1", status: "Starting Soon" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.display_name}
          </h1>
          <p className="text-muted-foreground">
            Track your content performance and brand partnerships
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-luxury transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-success">{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Content */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={post.type === 'Sponsored' ? 'default' : 'secondary'}>
                        {post.type}
                      </Badge>
                      <div className="flex items-center text-sm text-foreground">
                        <Heart className="h-4 w-4 mr-1 text-accent" />
                        {post.engagement}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Campaigns */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Upcoming Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingCampaigns.map((campaign, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{campaign.brand}</h3>
                    <Badge variant={campaign.status === 'In Progress' ? 'default' : 'outline'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.campaign}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due: {campaign.deadline}
                  </div>
                </div>
              ))}
              
              <Button className="w-full shadow-button" variant="outline">
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;