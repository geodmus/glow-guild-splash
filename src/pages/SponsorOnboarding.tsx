import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";

const INDUSTRIES = [
  "Food & beverage",
  "Fitness & wellness",
  "Fashion & apparel",
  "Beauty & personal care",
  "Tech / SaaS",
  "Consumer goods",
  "Hospitality",
  "Financial services",
  "Entertainment",
  "Local services",
  "Other",
];

export default function SponsorOnboarding() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/auth?mode=signup&role=sponsor");
        return;
      }
      setUid(authData.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profile?.role === "creator") {
        navigate("/creator/onboarding");
        return;
      }

      const { data: existing } = await supabase
        .from("sponsors")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (existing) {
        setCompanyName(existing.company_name ?? "");
        setWebsiteUrl(existing.website_url ?? "");
        setIndustry(existing.industry ?? "");
        setDescription(existing.description ?? "");
        setBudgetMin(existing.budget_typical_min_usd ? String(existing.budget_typical_min_usd) : "");
        setBudgetMax(existing.budget_typical_max_usd ? String(existing.budget_typical_max_usd) : "");
      }

      setChecking(false);
    })();
  }, [navigate]);

  const budgetMinNum = Number(budgetMin);
  const budgetMaxNum = Number(budgetMax);

  const canSubmit =
    companyName.trim().length >= 2 &&
    description.trim().length >= 20 &&
    budgetMinNum > 0 &&
    budgetMaxNum >= budgetMinNum;

  const handleSubmit = async () => {
    if (!uid || !canSubmit) return;
    setSaving(true);
    setError(null);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "sponsor" })
      .eq("id", uid);
    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    const row = {
      id: uid,
      company_name: companyName.trim(),
      website_url: websiteUrl.trim() || null,
      industry: industry || null,
      description: description.trim(),
      budget_typical_min_usd: budgetMinNum,
      budget_typical_max_usd: budgetMaxNum,
    };

    const { error: upsertError } = await supabase
      .from("sponsors")
      .upsert(row, { onConflict: "id" });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    navigate("/discover");
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
          <div className="eyebrow mb-3">Sponsor setup</div>
          <h1 className="font-display text-gg-3xl md:text-gg-4xl tracking-gg-tight font-medium mb-4">Set up your sponsor profile.</h1>
          <p className="text-gg-base text-gg-text-2 max-w-[56ch]">A short profile is all creators need to decide if you're a fit. You can polish this later.</p>
        </div>
      </header>

      <div className="border-b border-gg-line bg-gg-ink-2">
        <div className="container py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2 text-gg-sm text-gg-text-2">
            <ShieldCheck className="h-4 w-4 text-gg-cyan" />
            <span className="font-mono text-gg-xs uppercase tracking-gg-wider text-gg-cyan">Every creator vetted</span>
            <span>before they show up in search</span>
          </div>
          <div className="flex items-center gap-2 text-gg-sm text-gg-text-2">
            <Target className="h-4 w-4 text-gg-cyan" />
            <span className="font-mono text-gg-xs uppercase tracking-gg-wider text-gg-cyan">$5.20 ROI per $1</span>
            <span>nano & micro creators outperform</span>
          </div>
        </div>
      </div>

      <main className="container py-10 md:py-14 max-w-3xl">
        {error && <div className="border border-gg-error/40 bg-gg-error/5 rounded-gg-md p-4 text-gg-sm text-gg-text mb-6">{error}</div>}

        <div className="space-y-6">
          <Field label="Company name" required>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Matcha & Co." className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
          </Field>

          <Field label="Website" helper="Optional but recommended.">
            <Input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://matchaand.co" className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11" />
          </Field>

          <Field label="Industry" helper="Pick the closest match.">
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => {
                const active = industry === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndustry(active ? "" : i)}
                    className={`font-mono text-gg-xs uppercase tracking-gg-wide px-3 py-1.5 rounded-gg-sm border transition-colors ${
                      active ? "bg-gg-cyan text-gg-ink border-gg-cyan" : "bg-gg-ink-2 border-gg-line text-gg-text-2 hover:border-gg-line-2 hover:text-gg-text"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="About your company" required helper="20 words minimum.">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="We're a small-batch matcha company based in Evanston. We source from one farm in Uji and sell direct-to-consumer…" className="bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md resize-y min-h-[120px]" />
            <div className="font-mono text-[10px] uppercase tracking-gg-wider text-gg-text-3 mt-1.5">{description.trim().split(/\s+/).filter(Boolean).length} words</div>
          </Field>

          <Field label="Typical budget per creator (USD)" required helper="Your normal range per single booking.">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="eyebrow mb-1.5">Minimum</div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gg-text-3 font-mono">$</span>
                  <Input type="number" inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="200" className="pl-7 bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11 tabular-nums" />
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1.5">Maximum</div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gg-text-3 font-mono">$</span>
                  <Input type="number" inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="1500" className="pl-7 bg-gg-ink-2 border-gg-line text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:ring-1 focus:ring-gg-cyan rounded-gg-md h-11 tabular-nums" />
                </div>
              </div>
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 pt-10 mt-10 border-t border-gg-line">
          <Button onClick={handleSubmit} disabled={!canSubmit || saving} size="lg" className="h-12 px-6 bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? "Saving…" : "Start discovering creators"}
            <Check className="ml-2 h-4 w-4" />
          </Button>
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
