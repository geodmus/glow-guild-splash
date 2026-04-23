import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Plus, ShieldCheck, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";

const NICHES = ["fitness", "food", "fashion", "beauty", "lifestyle", "gaming", "finance", "parenting", "music", "travel", "tech", "art", "wellness", "auto"];
const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter / X" },
  { value: "twitch", label: "Twitch" },
  { value: "other", label: "Other" },
];

type Step = 1 | 2 | 3;

export default function CreatorOnboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [locationCity, setLocationCity] = useState("");
  const [locationRegion, setLocationRegion] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");

  const [niches, setNiches] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [followerCount, setFollowerCount] = useState<string>("");
  const [rateMin, setRateMin] = useState<string>("");
  const [rateMax, setRateMax] = useState<string>("");

  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(["", "", ""]);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/auth?mode=signup&role=creator");
        return;
      }
      setUid(authData.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profile?.role === "sponsor") {
        navigate("/sponsor/onboarding");
        return;
      }

      const { data: existing } = await supabase
        .from("creators")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (existing) {
        setDisplayName(existing.display_name ?? "");
        setProfileSlug(existing.profile_slug ?? "");
        setSlugEdited(Boolean(existing.profile_slug));
        setLocationCity(existing.location_city ?? "");
        setLocationRegion(existing.location_region ?? "");
        setTagline(existing.tagline ?? "");
        setBio(existing.bio ?? "");
        setNiches(existing.niche_tags ?? []);
        setPlatforms(existing.primary_platforms ?? []);
        setFollowerCount(existing.follower_count_total ? String(existing.follower_count_total) : "");
        setRateMin(existing.rate_min_usd ? String(existing.rate_min_usd) : "");
        setRateMax(existing.rate_max_usd ? String(existing.rate_max_usd) : "");
        const urls = existing.portfolio_urls ?? [];
        setPortfolioUrls(urls.length > 0 ? urls : ["", "", ""]);
        setIsAvailable(existing.is_available ?? true);
      }

      setChecking(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!slugEdited && displayName) {
      const auto = displayName.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
      setProfileSlug(auto);
    }
  }, [displayName, slugEdited]);

  const step1Valid = useMemo(
    () => displayName.trim().length >= 2 && profileSlug.trim().length >= 2 && /^[a-z0-9-]+$/.test(profileSlug) && locationCity.trim().length > 0 && bio.trim().length >= 20,
    [displayName, profileSlug, locationCity, bio]
  );

  const step2Valid = useMemo(() => {
    const min = Number(rateMin);
    const max = Number(rateMax);
    return niches.length >= 1 && niches.length <= 5 && platforms.length >= 1 && Number(followerCount) >= 100 && min > 0 && max >= min;
  }, [niches, platforms, followerCount, rateMin, rateMax]);

  const filledPortfolioUrls = portfolioUrls.filter((u) => u.trim().length > 0);
  const step3Valid = filledPortfolioUrls.length >= 3;

  const toggleNiche = (n: string) => setNiches((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  const togglePlatform = (p: string) => setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  const updatePortfolioUrl = (idx: number, value: string) => setPortfolioUrls((prev) => prev.map((u, i) => (i === idx ? value : u)));
  const addPortfolioSlot = () => {
    if (portfolioUrls.length < 6) setPortfolioUrls((prev) => [...prev, ""]);
  };
  const removePortfolioSlot = (idx: number) => {
    setPortfolioUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!uid) return;
    setSaving(true);
    setError(null);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "creator" })
      .eq("id", uid);
    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    const cleanUrls = filledPortfolioUrls.map((u) => u.trim());

    const row = {
      id: uid,
      display_name: displayName.trim(),
      profile_slug: profileSlug.trim(),
      tagline: tagline.trim() || null,
      bio: bio.trim(),
      location_city: locationCity.trim(),
      location_region: locationRegion.trim() || null,
      location_country: "US",
      niche_tags: niches,
      primary_platforms: platforms,
      follower_count_total: Number(followerCount),
      rate_min_usd: Number(rateMin),
      rate_max_usd: Number(rateMax),
      portfolio_urls: cleanUrls,
      is_available: isAvailable,
    };

    const { error: upsertError } = await supabase
      .from("creators")
      .upsert(row, { onConflict: "id" });

    if (upsertError) {
      if (upsertError.message.toLowerCase().includes("unique")) {
        setError(`The handle /c/${profileSlug} is taken. Try another.`);
      } else {
        setError(upsertError.message);
      }
      setSaving(false);
      return;
    }

    navigate("/creator/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gg-ink text-gg-text">
        <Nav />
        <div className="container py-20 animate-pulse text-gg-text-3">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gg-ink text-gg-text">
      <Nav />

      <header className="border-b border-gg-line bg-gg-ink">
        <div className="container py-10 md:py-14">
          <div className="eyebrow mb-3">Creator setup · Step {step} of 3</div>
          <h1 className="font-display text-gg-3xl md:text-gg-4xl tracking-gg-tight font-medium mb-4">
            {step === 1 && "Who are you?"}
            {step === 2 && "What do you make?"}
            {step === 3 && "Show your work."}
          </h1>
          <p className="text-gg-base text-gg-text-2 max-w-[56ch]">
            {step === 1 && "The basics a sponsor sees before they click through."}
            {step === 2 && "Niches, platforms, and rate range. Set expectations early — it's how you get paid what you're worth."}
            {step === 3 && "3 to 6 recent posts. The best signal a sponsor has of your work."}
          </p>

          <div className="mt-8 flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-gg-sm transition-colors ${i <= step ? "bg-gg-cyan" : "bg-gg-line"}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="border-b border-gg-line bg-gg-ink-2">
        <div className="container py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2 text-gg-sm text-gg-text-2">
            <Wallet className="h-4 w-4 text-gg-cyan" />
            <span className="font-mono text-gg-xs uppercase tracking-gg-wider text-gg-cyan">Instant payout</span>
            <span>within 24h of verified delivery</span>
          </div>
          <div className="flex items-center gap-2 text-gg-sm text-gg-text-2">
            <ShieldCheck className="h-4 w-4 text-gg-cyan" />
            <span className="font-mono text-gg-xs uppercase tracking-gg-wider text-gg-cyan">Free forever</span>
            <span>for creators</span>
          </div>
        </div>
      </div>

      <main className="container py-10 md:py-14 max-w-3xl">
        {error && <div className="border border-gg-error/40 bg-gg-error/5 rounded-gg-md p-4 text-gg-sm text-gg-text mb-6">{error}</div>}

        {step === 1 && (
          <div className="space-y-6">
            <Field label="Display name" required helper="How your name appears on your profile and in search.">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Gina's Plate" className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
            </Field>
            <Field label="Profile URL" required helper="Letters, numbers, and dashes only.">
              <div className="flex items-stretch border border-gg-line rounded-gg-md overflow-hidden focus-within:border-gg-cyan focus-within:ring-1 focus-within:ring-gg-cyan">
                <span className="bg-gg-ink-3 px-3 flex items-center font-mono text-gg-sm text-gg-text-2">glow.geodm.us/c/</span>
                <Input value={profileSlug} onChange={(e) => {
                  setSlugEdited(true);
                  setProfileSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9-]/g, ""));
                }} placeholder="your-handle" className="flex-1 bg-gg-ink-2 border-0 text-gg-text placeholder:text-gg-text-3 rounded-none focus:ring-0 h-11" />
              </div>
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
              <Field label="City" required>
                <Input value={locationCity} onChange={(e) => setLocationCity(e.target.value)} placeholder="Chicago" className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
              </Field>
              <Field label="Region" helper="State or province">
                <Input value={locationRegion} onChange={(e) => setLocationRegion(e.target.value)} placeholder="IL" className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
              </Field>
            </div>
            <Field label="Tagline" helper="One line that captures what you do.">
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="plant-forward home cooking in chicago" maxLength={120} className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
            </Field>
            <Field label="Bio" required helper="20 words minimum.">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} placeholder="I cook vegetable-first dinners in a 400-square-foot kitchen and film them honestly…" className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md resize-y min-h-[140px]" />
              <div className="font-mono text-[10px] uppercase tracking-gg-wider text-gg-text-3 mt-1.5">{bio.trim().split(/\s+/).filter(Boolean).length} words</div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <Field label="Niches" required helper="Pick up to 5.">
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => {
                  const active = niches.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNiche(n)}
                      disabled={!active && niches.length >= 5}
                      className={`font-mono text-gg-xs uppercase tracking-gg-wide px-3 py-1.5 rounded-gg-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        active ? "bg-gg-cyan text-gg-ink border-gg-cyan" : "bg-gg-ink-2 border-gg-line text-gg-text-2 hover:border-gg-line-2 hover:text-gg-text"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-gg-wider text-gg-text-3 mt-2">{niches.length} / 5 selected</div>
            </Field>
            <Field label="Primary platforms" required helper="Where you post most.">
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = platforms.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => togglePlatform(p.value)}
                      className={`font-mono text-gg-xs uppercase tracking-gg-wide px-3 py-1.5 rounded-gg-sm border transition-colors ${
                        active ? "bg-gg-cyan text-gg-ink border-gg-cyan" : "bg-gg-ink-2 border-gg-line text-gg-text-2 hover:border-gg-line-2 hover:text-gg-text"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Total followers" required helper="Approximate. Combined across platforms.">
              <Input type="number" inputMode="numeric" value={followerCount} onChange={(e) => setFollowerCount(e.target.value)} placeholder="24800" min={100} className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11 tabular-nums" />
            </Field>
            <Field label="Rate range (USD)" required helper="Your typical price for a single post.">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="eyebrow mb-1.5">Minimum</div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gg-text-3 font-mono">$</span>
                    <Input type="number" inputMode="numeric" value={rateMin} onChange={(e) => setRateMin(e.target.value)} placeholder="300" className="pl-7 bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11 tabular-nums" />
                  </div>
                </div>
                <div>
                  <div className="eyebrow mb-1.5">Maximum</div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gg-text-3 font-mono">$</span>
                    <Input type="number" inputMode="numeric" value={rateMax} onChange={(e) => setRateMax(e.target.value)} placeholder="800" className="pl-7 bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11 tabular-nums" />
                  </div>
                </div>
              </div>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <Field label="Portfolio links" required helper="3 to 6 posts. Instagram, TikTok, or YouTube URLs.">
              <div className="space-y-3">
                {portfolioUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex items-center justify-center w-10 shrink-0 bg-gg-ink-3 border border-gg-line rounded-gg-md font-mono text-gg-xs text-gg-text-3 tabular-nums">{String(i + 1).padStart(2, "0")}</div>
                    <Input type="url" value={url} onChange={(e) => updatePortfolioUrl(i, e.target.value)} placeholder="https://instagram.com/p/…" className="flex-1 bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
                    {portfolioUrls.length > 3 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePortfolioSlot(i)} className="text-gg-text-3 hover:text-gg-error hover:bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {portfolioUrls.length < 6 && (
                  <Button type="button" variant="outline" onClick={addPortfolioSlot} className="bg-transparent border-gg-line text-gg-text-2 hover:bg-gg-ink-3 hover:text-gg-text rounded-gg-md">
                    <Plus className="mr-2 h-4 w-4" />
                    Add another
                  </Button>
                )}
              </div>
            </Field>

            <Field label="Available for bookings" helper="Turn off if paused.">
              <button
                type="button"
                onClick={() => setIsAvailable((v) => !v)}
                className={`flex items-center gap-3 border rounded-gg-md px-4 py-3 transition-colors ${isAvailable ? "bg-gg-ink-2 border-gg-cyan/40" : "bg-gg-ink-2 border-gg-line"}`}
              >
                <div className={`w-10 h-6 rounded-full relative transition-colors ${isAvailable ? "bg-gg-cyan" : "bg-gg-ink-4"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-gg-ink transition-transform ${isAvailable ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </div>
                <div className="text-left">
                  <div className="font-display text-gg-base font-medium text-gg-text">{isAvailable ? "On — accepting bookings" : "Off — paused"}</div>
                  <div className="font-mono text-gg-xs text-gg-text-3">Tap to toggle</div>
                </div>
              </button>
            </Field>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-10 mt-10 border-t border-gg-line">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1) as Step)} disabled={step === 1} className="text-gg-text-2 hover:text-gg-text hover:bg-transparent disabled:opacity-30">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => {
                setError(null);
                setStep((s) => (s + 1) as Step);
              }}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!step3Valid || saving}
              className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Finish"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, required, helper, children }: { label: string; required?: boolean; helper?: string; children: React.ReactNode; }) {
  return (
    <div>
      <Label className="flex items-center gap-1 font-mono text-gg-xs uppercase tracking-gg-wider text-gg-text-2 mb-2">
        {label}
        {required && <span className="text-gg-magenta">*</span>}
      </Label>
      {children}
      {helper && <p className="text-gg-xs text-gg-text-3 mt-1.5 leading-snug">{helper}</p>}
    </div>
  );
}
