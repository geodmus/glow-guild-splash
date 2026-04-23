// src/components/Nav.tsx — REPLACES the version from the previous drop
// Fix: creators and sponsors tables are keyed by id = auth.uid(), not a separate user_id column.

import { useEffect, useState } from “react”;
import { Link, useLocation, useNavigate } from “react-router-dom”;
import { LogOut, User as UserIcon } from “lucide-react”;
import { Button } from “@/components/ui/button”;
import { supabase } from “@/integrations/supabase/client”;

type Role = “creator” | “sponsor” | “admin” | null;

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

```
const { data: authListener } = supabase.auth.onAuthStateChange(() => {
  loadUser();
});

return () => {
  authListener.subscription.unsubscribe();
};
```

}, []);

const loadUser = async () => {
const { data: authData } = await supabase.auth.getUser();
if (!authData?.user) {
setUser(null);
setLoading(false);
return;
}

```
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

setUser({
  id: uid,
  email: authData.user.email ?? null,
  role,
  displayName,
  slug,
});
setLoading(false);
```

};

const handleSignOut = async () => {
await supabase.auth.signOut();
setMenuOpen(false);
navigate(”/”);
};

const isActive = (path: string) => location.pathname.startsWith(path);

const initials =
user?.displayName
?.split(” “)
.map((w) => w[0])
.slice(0, 2)
.join(””)
.toUpperCase() ??
user?.email?.[0]?.toUpperCase() ??
“?”;

return (
<nav className="sticky top-0 z-50 border-b border-gg-line bg-gg-ink/90 backdrop-blur-lg">
<div className="container flex h-[72px] items-center justify-between">
<Link
to="/"
className="flex items-center gap-2 font-display font-medium tracking-gg-tight text-gg-lg text-gg-text hover:text-gg-cyan transition-colors"
>
<span className="inline-block w-2 h-2 rounded-full bg-gg-cyan" />
Glow Guild
</Link>

```
    <div className="flex items-center gap-2">
      {loading ? (
        <div className="h-9 w-24 bg-gg-ink-2 rounded-gg-sm animate-pulse" />
      ) : !user ? (
        <SignedOutLinks />
      ) : user.role === "sponsor" ? (
        <SponsorLinks isActive={isActive} />
      ) : user.role === "creator" ? (
        <CreatorLinks isActive={isActive} slug={user.slug} />
      ) : (
        <SignedOutLinks />
      )}

      {user && (
        <AvatarMenu
          open={menuOpen}
          onToggle={() => setMenuOpen((v) => !v)}
          onClose={() => setMenuOpen(false)}
          onSignOut={handleSignOut}
          initials={initials}
          displayName={user.displayName ?? user.email ?? "Account"}
          role={user.role}
          slug={user.slug}
        />
      )}
    </div>
  </div>
</nav>
```

);
}

function SignedOutLinks() {
return (
<>
<Link to="/discover">
<Button variant="ghost" size="sm" className="text-gg-text-2 hover:text-gg-text hover:bg-transparent">
Discover
</Button>
</Link>
<Link to="/auth">
<Button variant="ghost" size="sm" className="text-gg-text-2 hover:text-gg-text hover:bg-transparent">
Sign in
</Button>
</Link>
<Link to="/auth?mode=signup">
<Button size="sm" className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium">
Join
</Button>
</Link>
</>
);
}

function SponsorLinks({ isActive }: { isActive: (path: string) => boolean }) {
return (
<>
<NavLink to=”/discover” active={isActive(”/discover”)}>Discover</NavLink>
<NavLink to=”/sponsor/dashboard” active={isActive(”/sponsor”)}>Dashboard</NavLink>
</>
);
}

function CreatorLinks({ isActive, slug }: { isActive: (path: string) => boolean; slug: string | null; }) {
return (
<>
<NavLink to=”/creator/dashboard” active={isActive(”/creator”)}>Dashboard</NavLink>
{slug && <NavLink to={`/c/${slug}`} active={isActive(`/c/${slug}`)}>My profile</NavLink>}
</>
);
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode; }) {
return (
<Link to={to}>
<Button variant=“ghost” size=“sm” className={`hover:bg-transparent ${active ? "text-gg-cyan" : "text-gg-text-2 hover:text-gg-text"}`}>
{children}
</Button>
</Link>
);
}

function AvatarMenu({
open, onToggle, onClose, onSignOut, initials, displayName, role, slug,
}: {
open: boolean;
onToggle: () => void;
onClose: () => void;
onSignOut: () => void;
initials: string;
displayName: string;
role: Role;
slug: string | null;
}) {
return (
<div className="relative ml-2">
<button
onClick={onToggle}
className="w-9 h-9 rounded-full bg-gg-ink-3 border border-gg-line flex items-center justify-center font-mono text-gg-xs text-gg-text-2 hover:border-gg-cyan transition-colors focus-visible:outline-2 focus-visible:outline-gg-cyan focus-visible:outline-offset-2"
aria-label="Account menu"
aria-expanded={open}
>
{initials}
</button>

```
  {open && (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-gg-ink-3 border border-gg-line-2 rounded-gg-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gg-line">
          <div className="font-display text-gg-sm font-medium text-gg-text truncate">{displayName}</div>
          {role && <div className="eyebrow mt-1 text-gg-cyan">{role}</div>}
        </div>
        <div className="py-1">
          {role === "creator" && slug && (
            <MenuLink to={`/c/${slug}`} onClick={onClose}>
              <UserIcon className="h-3.5 w-3.5" />
              View public profile
            </MenuLink>
          )}
          {role === "creator" && (
            <MenuLink to="/creator/dashboard" onClick={onClose}>
              <UserIcon className="h-3.5 w-3.5" />
              Dashboard
            </MenuLink>
          )}
          {role === "sponsor" && (
            <MenuLink to="/sponsor/dashboard" onClick={onClose}>
              <UserIcon className="h-3.5 w-3.5" />
              Dashboard
            </MenuLink>
          )}
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-gg-sm text-gg-text-2 hover:text-gg-text hover:bg-gg-ink-4 transition-colors text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )}
</div>
```

);
}

function MenuLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode; }) {
return (
<Link
to={to}
onClick={onClick}
className="flex items-center gap-2 px-4 py-2.5 text-gg-sm text-gg-text-2 hover:text-gg-text hover:bg-gg-ink-4 transition-colors"
>
{children}
</Link>
);
}
