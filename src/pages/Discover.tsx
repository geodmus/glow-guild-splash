// src/pages/Discover.tsx

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreatorCard, type Creator, type Platform } from "@/components/CreatorCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const NICHES = [
  "Fitness", "Food", "Fashion", "Beauty", "Lifestyle",
  "Travel", "Tech", "Gaming", "Health", "Finance",
  "Parenting", "Pets", "Home", "Music", "Art",
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
];

const FOLLOWER_RANGES = [
  { label: "1K – 10K", min: 1_000, max: 10_000 },
  { label: "10K – 50K", min: 10_000, max: 50_000 },
  { label: "50K – 100K", min: 50_000, max: 100_000 },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "followers_desc", label: "Most followers" },
  { value: "followers_asc", label: "Fewest followers" },
  { value: "engagement_desc", label: "Highest engagement" },
  { value: "rate_asc", label: "Lowest rate" },
  { value: "rate_desc", label: "Highest rate" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-[#121214] border border-[#2a2a2f] rounded-[4px] p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[#1a1a1d] shrink-0" />
        <div className="flex flex-col gap-2 flex-1 pt-1">
          <div className="h-2.5 w-16 bg-[#1a1a1d] rounded" />
          <div className="h-4 w-28 bg-[#242428] rounded" />
          <div className="h-2.5 w-20 bg-[#1a1a1d] rounded" />
        </div>
      </div>
      <div className="h-px bg-[#1a1a1d]" />
      <div className="flex gap-4">
        <div className="h-3 w-20 bg-[#1a1a1d] rounded" />
        <div className="h-3 w-16 bg-[#1a1a1d] rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-14 bg-[#1a1a1d] rounded-[2px]" />
        <div className="h-5 w-16 bg-[#1a1a1d] rounded-[2px]" />
      </div>
      <div className="flex justify-between items-end mt-auto pt-1">
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-14 bg-[#1a1a1d] rounded" />
          <div className="h-4 w-20 bg-[#242428] rounded" />
        </div>
        <div className="w-7 h-7 bg-[#1a1a1d] rounded-[4px]" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-6">
      <span
        className="font-bold text-[#1a1a1d] select-none leading-none"
        style={{ fontSize: "clamp(5rem, 15vw, 10rem)", fontVariantNumeric: "tabular-nums" }}
        aria-hidden="true"
      >
        0
      </span>
      <div className="flex flex-col items-center gap-2 -mt-4">
        <p className="text-[#f4f4f5] text-lg font-semibold">No creators found.</p>
        <p className="text-[#6b6b74] text-sm">Adjust your filters or clear the search.</p>
      </div>
      <button
        onClick={onReset}
        className="px-5 py-2.5 rounded-[4px] bg-[#00c8d4] text-[#0a0a0b] text-sm font-semibold
          transition-all duration-[120ms] hover:brightness-110 active:translate-y-px active:brightness-90
          focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
      >
        Clear filters
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Discover() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "">("");
  const [selectedFollowerRange, setSelectedFollowerRange] = useState<number | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // ── Fetch creators ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await supabase
          .from("creators")
          .select("*")
          .order("created_at", { ascending: false });

        if (sbError) throw sbError;

        const mapped: Creator[] = (data ?? []).map((row: any) => ({
          id: row.id,
          profile_slug: row.profile_slug ?? row.id,
          display_name: row.display_name ?? "",
          bio: row.bio ?? undefined,
          location_city: row.location_city ?? undefined,
          location_region: row.location_region ?? undefined,
          niche_tags: row.niche_tags ?? [],
          primary_platforms: row.primary_platforms ?? ["instagram"],
          follower_count_total: row.follower_count_total ?? 0,
          rate_min_usd: row.rate_min_usd ?? undefined,
          rate_max_usd: row.rate_max_usd ?? undefined,
          avatar_url: row.avatar_url ?? undefined,
          portfolio_links: row.portfolio_links ?? []
        }));

        setCreators(mapped);
      } catch (err: any) {
        setError("Couldn't load creators. Try refreshing.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...creators];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.display_name.toLowerCase().includes(q) ||
          c.bio?.toLowerCase().includes(q) ||
          c.location_city?.toLowerCase().includes(q) ||
          c.location_region?.toLowerCase().includes(q) ||
          c.niche_tags.some((n) => n.toLowerCase().includes(q))
      );
    }

    if (selectedNiches.length > 0) {
      result = result.filter((c) =>
        selectedNiches.every((n) =>
          c.niche_tags.map((x) => x.toLowerCase()).includes(n.toLowerCase())
        )
      );
    }

    if (selectedPlatform) {
      result = result.filter((c) => c.primary_platforms.includes(selectedPlatform as Platform));
    }

    if (selectedFollowerRange !== null) {
      const range = FOLLOWER_RANGES[selectedFollowerRange];
      result = result.filter(
        (c) => c.follower_count_total >= range.min && c.follower_count_total <= range.max
      );
    }

    if (availableOnly) {
      // availability field removed from schema; keep toggle as no-op
    }

    switch (sortBy) {
      case "followers_desc":
        result.sort((a, b) => b.follower_count_total - a.follower_count_total);
        break;
      case "followers_asc":
        result.sort((a, b) => a.follower_count_total - b.follower_count_total);
        break;
      case "rate_asc":
        result.sort((a, b) => (a.rate_min_usd ?? 9999) - (b.rate_min_usd ?? 9999));
        break;
      case "rate_desc":
        result.sort((a, b) => (b.rate_max_usd ?? 0) - (a.rate_max_usd ?? 0));
        break;
    }

    return result;
  }, [creators, search, selectedNiches, selectedPlatform, selectedFollowerRange, availableOnly, sortBy]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function toggleNiche(niche: string) {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  function resetAllFilters() {
    setSearch("");
    setSelectedNiches([]);
    setSelectedPlatform("");
    setSelectedFollowerRange(null);
    setAvailableOnly(false);
    setSortBy("relevance");
  }

  const hasActiveFilters =
    search.trim() ||
    selectedNiches.length > 0 ||
    selectedPlatform ||
    selectedFollowerRange !== null ||
    availableOnly;

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    selectedNiches.length,
    selectedPlatform ? 1 : 0,
    selectedFollowerRange !== null ? 1 : 0,
    availableOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5]">

      {/* ── Page header ── */}
      <div className="border-b border-[#2a2a2f]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 md:py-14">
          <span
            className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-3"
            style={{ fontSize: "11px", letterSpacing: "0.1em" }}
          >
            Creator marketplace
          </span>
          <h1
            className="font-bold text-[#f4f4f5] leading-none tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Find creators.
          </h1>
          <p className="mt-3 text-[#a8a8b0] text-base max-w-lg">
            {loading
              ? "Loading creators..."
              : `${creators.length} creator${creators.length !== 1 ? "s" : ""} on the platform. Filter by niche, platform, or budget.`}
          </p>
        </div>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-0 z-30 bg-[#0a0a0b] border-b border-[#2a2a2f]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">

          {/* Row 1: search + controls */}
          <div className="flex items-center gap-3 py-4">

            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b74] pointer-events-none"
              />
              <input
                type="search"
                placeholder="Search creators, niches, locations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-9 pr-4 bg-[#121214] border border-[#2a2a2f] rounded-[4px]
                  text-[#f4f4f5] text-sm placeholder:text-[#6b6b74]
                  focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-0
                  focus-visible:border-[#00c8d4] transition-colors duration-[120ms]"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={[
                "flex items-center gap-2 h-11 px-4 rounded-[4px] border text-sm font-medium",
                "transition-all duration-[120ms]",
                showFilters
                  ? "border-[#00c8d4] text-[#00c8d4] bg-[#00c8d4]/5"
                  : "border-[#2a2a2f] text-[#a8a8b0] hover:border-[#3a3a42] hover:text-[#f4f4f5]",
                "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
              ].join(" ")}
              aria-pressed={showFilters}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#cc2d8f] text-white font-mono"
                  style={{ fontSize: "10px" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 h-11 px-4 rounded-[4px] border border-[#2a2a2f]
                  text-[#a8a8b0] text-sm font-medium hover:border-[#3a3a42] hover:text-[#f4f4f5]
                  transition-all duration-[120ms]
                  focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort"}
                <ChevronDown size={13} className={sortOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a1d] border border-[#2a2a2f] rounded-[4px] z-50 overflow-hidden shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={[
                        "w-full text-left px-4 py-2.5 text-sm transition-colors duration-[100ms]",
                        sortBy === opt.value
                          ? "text-[#00c8d4] bg-[#00c8d4]/5"
                          : "text-[#a8a8b0] hover:text-[#f4f4f5] hover:bg-[#242428]",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear all — only when filters active */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 h-11 px-3 text-[#6b6b74] text-sm
                  hover:text-[#ff5a5a] transition-colors duration-[120ms]
                  focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
                aria-label="Clear all filters"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>

          {/* Row 2: expanded filters panel */}
          {showFilters && (
            <div className="pb-5 flex flex-col gap-5 border-t border-[#1a1a1d] pt-5">

              {/* Niche chips */}
              <div>
                <span
                  className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-2.5"
                  style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  Niche
                </span>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((niche) => {
                    const active = selectedNiches.includes(niche);
                    return (
                      <button
                        key={niche}
                        onClick={() => toggleNiche(niche)}
                        className={[
                          "px-3 py-1.5 rounded-[2px] border uppercase text-xs font-medium tracking-wider",
                          "transition-all duration-[120ms]",
                          active
                            ? "border-[#00c8d4] text-[#00c8d4] bg-[#00c8d4]/8"
                            : "border-[#2a2a2f] text-[#a8a8b0] hover:border-[#3a3a42] hover:text-[#f4f4f5]",
                          "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
                        ].join(" ")}
                        aria-pressed={active}
                        style={{ letterSpacing: "0.06em" }}
                      >
                        {niche}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-8">
                {/* Platform filter */}
                <div>
                  <span
                    className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-2.5"
                    style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                  >
                    Platform
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const active = selectedPlatform === p.value;
                      return (
                        <button
                          key={p.value}
                          onClick={() => setSelectedPlatform(active ? "" : p.value)}
                          className={[
                            "px-3 py-1.5 rounded-[2px] border uppercase text-xs font-medium tracking-wider",
                            "transition-all duration-[120ms]",
                            active
                              ? "border-[#00c8d4] text-[#00c8d4] bg-[#00c8d4]/8"
                              : "border-[#2a2a2f] text-[#a8a8b0] hover:border-[#3a3a42] hover:text-[#f4f4f5]",
                            "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
                          ].join(" ")}
                          aria-pressed={active}
                          style={{ letterSpacing: "0.06em" }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Follower range */}
                <div>
                  <span
                    className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-2.5"
                    style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                  >
                    Followers
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {FOLLOWER_RANGES.map((range, i) => {
                      const active = selectedFollowerRange === i;
                      return (
                        <button
                          key={range.label}
                          onClick={() => setSelectedFollowerRange(active ? null : i)}
                          className={[
                            "px-3 py-1.5 rounded-[2px] border uppercase text-xs font-medium tracking-wider",
                            "transition-all duration-[120ms]",
                            active
                              ? "border-[#00c8d4] text-[#00c8d4] bg-[#00c8d4]/8"
                              : "border-[#2a2a2f] text-[#a8a8b0] hover:border-[#3a3a42] hover:text-[#f4f4f5]",
                            "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
                          ].join(" ")}
                          aria-pressed={active}
                          style={{ letterSpacing: "0.06em" }}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available only toggle */}
                <div>
                  <span
                    className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-2.5"
                    style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                  >
                    Availability
                  </span>
                  <button
                    onClick={() => setAvailableOnly((v) => !v)}
                    className={[
                      "px-3 py-1.5 rounded-[2px] border uppercase text-xs font-medium tracking-wider",
                      "transition-all duration-[120ms]",
                      availableOnly
                        ? "border-[#cc2d8f] text-[#cc2d8f] bg-[#cc2d8f]/8"
                        : "border-[#2a2a2f] text-[#a8a8b0] hover:border-[#3a3a42] hover:text-[#f4f4f5]",
                      "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
                    ].join(" ")}
                    aria-pressed={availableOnly}
                    style={{ letterSpacing: "0.06em" }}
                  >
                    Available now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">

        {/* Result count */}
        {!loading && creators.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#6b6b74] text-sm">
              {filtered.length === creators.length
                ? `${creators.length} creator${creators.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${creators.length} creator${creators.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        )}

        {error && (
          <div className="col-span-full py-12 text-center">
            <p className="text-[#ff5a5a] text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-[#a8a8b0] text-sm underline underline-offset-2 hover:text-[#f4f4f5]"
            >
              Refresh
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.length === 0
            ? <EmptyState onReset={resetAllFilters} />
            : filtered.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
        </div>
      </main>

      {/* Close sort dropdown on outside click */}
      {sortOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSortOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
