import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, Building, User } from "lucide-react";

const ProfileCompletion = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    company_name: profile?.company_name || "",
    bio: profile?.bio || "",
    website_url: profile?.website_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          company_name: formData.company_name,
          bio: formData.bio,
          website_url: formData.website_url,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to The Glow Guild. Redirecting to your dashboard...",
      });

      // Redirect to appropriate dashboard
      setTimeout(() => {
        const redirectPath = profile?.user_type === 'brand' ? '/brand/dashboard' : '/creator/dashboard';
        window.location.href = redirectPath;
      }, 1000);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isBrand = profile?.user_type === 'brand';

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl shadow-luxury">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center">
            {isBrand ? (
              <Building className="w-8 h-8 text-luxury-gold-foreground" />
            ) : (
              <User className="w-8 h-8 text-luxury-gold-foreground" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Complete Your Profile
            </CardTitle>
            <p className="text-muted-foreground">
              {isBrand 
                ? "Set up your brand profile to start connecting with creators"
                : "Complete your creator profile to attract brand partnerships"
              }
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="display_name" className="text-sm font-medium">
                  {isBrand ? "Contact Name" : "Display Name"} *
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder={isBrand ? "Your name" : "How you'd like to be known"}
                  required
                  className="mt-1"
                />
              </div>

              {isBrand && (
                <div>
                  <Label htmlFor="company_name" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Your brand or company name"
                    required
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="bio" className="text-sm font-medium">
                  {isBrand ? "Brand Description" : "About You"}
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={
                    isBrand 
                      ? "Tell creators about your brand, values, and what you're looking for in partnerships..."
                      : "Share your content style, audience, and what makes you unique..."
                  }
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website_url" className="text-sm font-medium">
                  {isBrand ? "Brand Website" : "Website/Portfolio"}
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder={
                    isBrand 
                      ? "https://yourbrand.com"
                      : "https://yourportfolio.com or Instagram URL"
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const redirectPath = profile?.user_type === 'brand' ? '/brand/dashboard' : '/creator/dashboard';
                  window.location.href = redirectPath;
                }}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.display_name}
                className="flex-1 shadow-button"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Complete Profile
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-luxury-gold" />
              You can always update this information later in your profile settings
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;