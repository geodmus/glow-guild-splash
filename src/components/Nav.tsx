import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Role = "creator" | "sponsor" | "admin" | null;

type NavUser = {
  id: string;
  email: string | null;
  role: Role;
  displayName: string | null;
  slug: string | null;
};

export function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    const uid = authData.user.id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .maybeSingle();

    const role = (profile?.role as Role) ?? null;

    let displayName: string | null = null;
    let slug: string | null = null;

    if (role === "creator") {
      const { data: creator } = await supabase
        .from("creators")
        .select("display_name, profile_slug")
        .eq("id", uid)
        .maybeSingle();
      displayName = creator?.display_name ?? null;
      slug = creator?.profile_slug ?? null;
    } else if (role === "sponsor") {
      const { data: sponsor } = await supabase
        .from("sponsors")
        .select("company_name")
        .eq("id", uid)
        .maybeSingle();
      displayName = sponsor?.company_name ?? null;
    }

    setUser({ id: uid, email: authData.user.email ?? null, role, displayName, slug });
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const initials = user?.displayName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="sticky top-0 z-50 border-b border-gg-line bg-gg-ink/90 backdrop-blur-lg">
      <div className="container flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-medium tracking-gg-tight text-gg-lg text-gg-text hover:text-gg-cyan transition-colors">
          <span className="inline-block w-2 h-2 rounded-full bg-gg-cyan" />
          Glow Guild
        </Link>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 bg-gg-ink-2 rounded-gg-sm animate-pulse" />
          ) : !user ? (
            <>
              <Link to="/discover"><Button variant="ghost" size="sm" className="text-gg-text-2 hover:text-gg-text hover:bg-transparent">Discover</Button></Link>
              <Link to="/auth"><Button variant="ghost" size="sm" className="text-gg-text-2 hover:text-gg-text hover:bg-transparent">Sign in</Button></Link>
              <Link to="/auth?mode=signup"><Button size="sm" className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium">Join</Button></Link>
            </>
          ) : user.role === "sponsor" ? (
            <>
              <Link to="/discover"><Button variant="ghost" size="sm" className={`hover:bg-transparent ${isActive("/discover") ? "text-gg-cyan" : "text-gg-text-2 hover:text-gg-text"}`}>Discover</Button></Link>
              <Link to="/sponsor/dashboard"><Button variant="ghost" size="sm" className={`hover:bg-transparent ${isActive("/sponsor") ? "text-gg-cyan" : "text-gg-text-2 hover:text-gg-text"}`}>Dashboard</Button></Link>
            </>
          ) : user.role === "creator" ? (
            <>
              <Link to="/creator/dashboard"><Button variant="ghost" size="sm" className={`hover:bg-transparent ${isActive("/creator") ? "text-gg-cyan" : "text-gg-text-2 hover:text-gg-text"}`}>Dashboard</Button></Link>
              {user.slug && <Link to={`/c/${user.slug}`}><Button variant="ghost" size="sm" className={`hover:bg-transparent ${isActive(`/c/${user.slug}`) ? "text-gg-cyan" : "text-gg-text-2 hover:text-gg-text"}`}>My profile</Button></Link>}
            </>
          ) : null}

          {user && (
            <div className="relative ml-2">
              <button onClick={() => setMenuOpen((v) => !v)} className="w-9 h-9 rounded-full bg-gg-ink-3 border border-gg-line flex items-center justify-center font-mono text-gg-xs text-gg-text-2 hover:border-gg-cyan transition-colors focus-visible:outline-2 focus-visible:outline-gg-cyan focus-visible:outline-offset-2" aria-label="Account menu" aria-expanded={menuOpen}>
                {initials}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-gg-ink-3 border border-gg-line-2 rounded-gg-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gg-line">
                      <div className="font-display text-gg-sm font-medium text-gg-text truncate">{user.displayName}</div>
                      {user.role && <div className="eyebrow mt-1 text-gg-cyan">{user.role}</div>}
                    </div>
                    <div className="py-1">
                      {user.role === "creator" && user.slug && <Link to={`/c/${user.slug}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-gg-sm text-gg-text-2 hover:text-gg-text hover:bg-gg-ink-4 transition-colors"><UserIcon className="h-3.5 w-3.5" />View public profile</Link>}
                      {user.role === "creator" && <Link to="/creator/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-gg-sm text-gg-text-2 hover:text-gg-text hover:bg-gg-ink-4 transition-colors"><UserIcon className="h-3.5 w-3.5" />Dashboard</Link>}
                      {user.role === "sponsor" && <Link to="/sponsor/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-gg-sm text-gg-text-2 hover:text-gg-text hover:bg-gg-ink-4 transition-colors"><UserIcon className="h-3.5 w-3.5" />Dashboard</Link>}
                      <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-gg-sm text-gg-text-2 hover:text-gg-text hover:bg-gg-ink-4 transition-colors text-left"><LogOut className="h-3.5 w-3.5" />Sign out</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
