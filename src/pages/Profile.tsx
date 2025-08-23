import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { User, Building, Globe, Edit3, Save, X } from "lucide-react";

const Profile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    company_name: "",
    bio: "",
    website_url: "",
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        company_name: profile.company_name || "",
        bio: profile.bio || "",
        website_url: profile.website_url || "",
      });
    }
  }, [profile]);

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
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });

      setEditing(false);
      // Refresh the page to show updated data
      window.location.reload();

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

  const handleCancel = () => {
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        company_name: profile.company_name || "",
        bio: profile.bio || "",
        website_url: profile.website_url || "",
      });
    }
    setEditing(false);
  };

  const isBrand = profile?.user_type === 'brand';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-luxury rounded-full flex items-center justify-center">
                  {isBrand ? (
                    <Building className="w-6 h-6 text-luxury-gold-foreground" />
                  ) : (
                    <User className="w-6 h-6 text-luxury-gold-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {profile?.display_name || "Incomplete Profile"}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {profile?.user_type || "Unknown"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {editing ? (
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
                          Company Name
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          placeholder="Your brand or company name"
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

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.display_name}
                      className="gap-2 shadow-button"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        {isBrand ? "Contact Name" : "Display Name"}
                      </h3>
                      <p className="text-foreground">
                        {profile?.display_name || "Not provided"}
                      </p>
                    </div>

                    {isBrand && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Company Name
                        </h3>
                        <p className="text-foreground">
                          {profile?.company_name || "Not provided"}
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        {isBrand ? "Brand Description" : "About You"}
                      </h3>
                      <p className="text-foreground whitespace-pre-wrap">
                        {profile?.bio || "No description provided"}
                      </p>
                    </div>

                    {profile?.website_url && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          {isBrand ? "Brand Website" : "Website/Portfolio"}
                        </h3>
                        <a
                          href={profile.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-accent transition-colors flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          {profile.website_url}
                        </a>
                      </div>
                    )}
                  </div>

                  {(!profile?.display_name || !profile?.bio) && (
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">
                        💡 Complete your profile to {isBrand ? "attract creators" : "get noticed by brands"}! 
                        Add a description and {isBrand ? "company details" : "portfolio link"} to stand out.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;