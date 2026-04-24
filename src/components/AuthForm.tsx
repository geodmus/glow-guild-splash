import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building2, Users, Sparkles } from "lucide-react";

type UserType = 'sponsor' | 'creator';

export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>('creator');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    companyName: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { user_type: userType },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeOptions = [
    {
      value: 'creator' as const,
      label: 'Content Creator',
      icon: Sparkles,
      description: 'Join our network and get paid for authentic content'
    },
    {
      value: 'sponsor' as const,
      label: 'Sponsor',
      icon: Building2,
      description: 'Connect with creators and scale your marketing'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-subtle">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">
              Join The Glow Guild
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Where authentic beauty content meets data-driven brands
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="signup" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">I am a...</Label>
                <div className="grid gap-3">
                  {userTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`cursor-pointer p-3 rounded-lg border transition-all ${
                        userType === option.value
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => setUserType(option.value)}
                    >
                      <div className="flex items-center gap-3">
                        <option.icon className="w-5 h-5 text-accent" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                        {userType === option.value && (
                          <Badge variant="secondary" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="How should we call you?"
                    required
                  />
                </div>

                {userType === 'sponsor' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your company name"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant={userType === 'sponsor' ? 'brand' : 'creator'}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : `Join as ${userType === 'sponsor' ? 'Sponsor' : 'Creator'}`}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="brand"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};