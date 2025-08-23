import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, DollarSign, Plus, Search } from "lucide-react";

const BrandDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    {
      title: "Active Campaigns",
      value: "12",
      change: "+2 this month",
      icon: BarChart3,
      color: "text-accent"
    },
    {
      title: "Creator Partners",
      value: "48",
      change: "+8 this month",
      icon: Users,
      color: "text-success"
    },
    {
      title: "Total Reach",
      value: "2.4M",
      change: "+15% from last month",
      icon: TrendingUp,
      color: "text-luxury-gold"
    },
    {
      title: "ROI",
      value: "4.2x",
      change: "+0.3x this quarter",
      icon: DollarSign,
      color: "text-primary"
    }
  ];

  const recentCampaigns = [
    { name: "Summer Glow Collection", creators: 12, status: "Active", engagement: "8.2%" },
    { name: "Holiday Beauty Box", creators: 8, status: "Planning", engagement: "—" },
    { name: "Skincare Routine", creators: 15, status: "Completed", engagement: "12.1%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.company_name || profile?.display_name}
          </h1>
          <p className="text-muted-foreground">
            Manage your creator partnerships and campaigns
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
          {/* Recent Campaigns */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Campaigns</CardTitle>
              <Button size="sm" className="shadow-button">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.creators} creators</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'}>
                        {campaign.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{campaign.engagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start shadow-button" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Find Creators
              </Button>
              <Button className="w-full justify-start shadow-button" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
              <Button className="w-full justify-start shadow-button" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start shadow-button" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Partnerships
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;