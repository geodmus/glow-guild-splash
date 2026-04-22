// src/pages/CreatorProfile.tsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  ExternalLink,
  Instagram,
  Youtube,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Creator, type Platform } from "@/components/CreatorCard";
import { BookingRequestDialog } from "@/components/BookingRequestDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatRate(min?: number, max?: number): string {
  if (!min && !max) return "Rate on request";
  if (min && max) return `$${min} – $${max}`;
  if (min) return `From $${min}`;
  if (max) return `Up to $${max}`;
  return "Rate on request";
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const PLATFORM_META: Record<Platform, { label: string; icon: React.ReactNode; color: string }> = {
  instagram: {
    label: "Instagram",
    icon: <Instagram size={15} />,
    color: "#E1306C",
  },
  tiktok: {
    label: "TikTok",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.41a8.16 8.16 0 0 0 4.77 1.52V7.48a4.85 4.85 0 0 1-1.01-.79z" />
      </svg>
    ),
    color: "#69C9D0",
  },
  youtube: {
    label: "YouTube",
    icon: <Youtube size={15} />,
    color: "#FF0000",
  },
  twitter: {
    label: "X / Twitter",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "#f4f4f5",
  },
  linkedin: {
    label: "LinkedIn",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "#0A66C2",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] animate-pulse">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">
        <div className="h-4 w-24 bg-[#1a1a1d] rounded mb-12" />
        <div className="flex flex-col md:flex-row gap-10">
          <div className="shrink-0 flex flex-col items-center md:items-start gap-4 w-full md:w-72">
            <div className="w-24 h-24 rounded-full bg-[#1a1a1d]" />
            <div className="h-6 w-40 bg-[#242428] rounded" />
            <div className="h-4 w-28 bg-[#1a1a1d] rounded" />
            <div className="h-px w-full bg-[#1a1a1d] my-2" />
            <div className="h-4 w-32 bg-[#1a1a1d] rounded" />
            <div className="h-4 w-24 bg-[#1a1a1d] rounded" />
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-4 w-full bg-[#1a1a1d] rounded" />
            <div className="h-4 w-4/5 bg-[#1a1a1d] rounded" />
            <div className="h-4 w-3/5 bg-[#1a1a1d] rounded" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-[#121214] rounded-[4px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat block ───────────────────────────────────────────────────────────────

function StatBlock({
  eyebrow,
  value,
  icon,
}: {
  eyebrow: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-[#121214] border border-[#2a2a2f] rounded-[4px] p-5">
      <span
        className="uppercase text-[#6b6b74] font-medium tracking-widest flex items-center gap-1.5"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        {icon}
        {eyebrow}
      </span>
      <span className="font-mono text-[#f4f4f5] font-semibold text-xl leading-tight">
        {value}
      </span>
    </div>
  );
}

// ─── Portfolio embed ──────────────────────────────────────────────────────────

function PortfolioEmbed({ url }: { url: string }) {
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isInstagram = url.includes("instagram.com");
  const isTikTok = url.includes("tiktok.com");

  let embedUrl = url;
  if (isYouTube) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
  }

  if (isYouTube) {
    return (
      <div className="relative w-full aspect-video bg-[#121214] border border-[#2a2a2f] rounded-[4px] overflow-hidden">
        <iframe
          src={embedUrl}
          title="Portfolio video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }

  // Instagram / TikTok — link card fallback (oEmbed requires server-side)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-[#121214] border border-[#2a2a2f] rounded-[4px]
        hover:border-[#3a3a42] hover:bg-[#1a1a1d] transition-all duration-[120ms] group
        focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
    >
      <span className="text-[#6b6b74]">
        {isInstagram ? <Instagram size={18} /> : isTikTok ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.41a8.16 8.16 0 0 0 4.77 1.52V7.48a4.85 4.85 0 0 1-1.01-.79z" />
          </svg>
        ) : <ExternalLink size={18} />}
      </span>
      <span className="text-[#a8a8b0] text-sm truncate flex-1 group-hover:text-[#f4f4f5] transition-colors">
        {url}
      </span>
      <ExternalLink size={13} className="text-[#3a3a42] group-hover:text-[#00c8d4] transition-colors shrink-0" />
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreatorProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchCreator() {
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const mapped: Creator = {
        id: data.id,
        slug: data.slug ?? data.id,
        handle: data.handle ?? "",
        display_name: data.display_name ?? data.handle ?? "Unknown",
        avatar_url: data.avatar_url ?? undefined,
        bio: data.bio ?? undefined,
        location: data.location ?? undefined,
        niches: data.niches ?? [],
        primary_platform: (data.primary_platform as Platform) ?? "instagram",
        follower_count: data.follower_count ?? 0,
        engagement_rate: data.engagement_rate ?? undefined,
        rate_min: data.rate_min ?? undefined,
        rate_max: data.rate_max ?? undefined,
        is_available: data.is_available ?? false,
      };

      setCreator(mapped);
      setPortfolioUrls(data.portfolio_urls ?? []);
      setLoading(false);
    }

    fetchCreator();
  }, [slug]);

  if (loading) return <ProfileSkeleton />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 text-center px-6">
        <span
          className="font-bold text-[#1a1a1d] leading-none select-none"
          style={{ fontSize: "clamp(5rem, 20vw, 12rem)" }}
          aria-hidden="true"
        >
          404
        </span>
        <p className="text-[#f4f4f5] text-lg font-semibold -mt-4">Creator not found.</p>
        <p className="text-[#6b6b74] text-sm">This profile doesn't exist or was removed.</p>
        <Link
          to="/discover"
          className="mt-2 px-5 py-2.5 bg-[#00c8d4] text-[#0a0a0b] text-sm font-semibold rounded-[4px]
            hover:brightness-110 transition-all duration-[120ms]
            focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
        >
          Back to discovery
        </Link>
      </div>
    );
  }

  if (!creator) return null;

  const platform = PLATFORM_META[creator.primary_platform];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* Back link */}
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 text-[#6b6b74] text-sm hover:text-[#f4f4f5]
            transition-colors duration-[120ms] mb-10
            focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2 rounded-[2px]"
        >
          <ArrowLeft size={14} />
          All creators
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* ── LEFT COLUMN: identity ── */}
          <aside className="shrink-0 w-full lg:w-72 flex flex-col gap-6">

            {/* Avatar + name block */}
            <div className="flex flex-col gap-4">
              <div className="relative w-fit">
                <Avatar className="h-20 w-20 border border-[#2a2a2f] rounded-full
                  shadow-[0_0_0_1px_rgba(0,200,212,0.15)]">
                  {creator.avatar_url && (
                    <AvatarImage src={creator.avatar_url} alt={creator.display_name} />
                  )}
                  <AvatarFallback className="bg-[#1a1a1d] text-[#a8a8b0] font-mono text-base">
                    {getInitials(creator.display_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Availability dot */}
                {creator.is_available && (
                  <span
                    className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#cc2d8f] border-2 border-[#0a0a0b]"
                    style={{ boxShadow: "0 0 8px 2px rgba(204,45,143,0.5)" }}
                    aria-label="Available for bookings"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#f4f4f5] leading-tight tracking-tight">
                  {creator.display_name}
                </h1>
                <span className="text-[#6b6b74] text-sm">@{creator.handle}</span>

                {creator.location && (
                  <span className="flex items-center gap-1.5 text-[#a8a8b0] text-sm mt-1">
                    <MapPin size={12} className="text-[#6b6b74]" />
                    {creator.location}
                  </span>
                )}
              </div>

              {/* Availability badge */}
              {creator.is_available && (
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#cc2d8f] shrink-0"
                    style={{ boxShadow: "0 0 6px 1px rgba(204,45,143,0.6)" }}
                    aria-hidden="true"
                  />
                  <span
                    className="uppercase text-[#cc2d8f] font-medium tracking-widest"
                    style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                  >
                    Available for bookings
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2a2a2f]" />

            {/* Platform */}
            <div className="flex flex-col gap-1.5">
              <span
                className="uppercase text-[#6b6b74] font-medium tracking-widest"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                Primary platform
              </span>
              <span
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: platform.color }}
              >
                {platform.icon}
                {platform.label}
              </span>
            </div>

            {/* Niches */}
            {creator.niches.length > 0 && (
              <div className="flex flex-col gap-2">
                <span
                  className="uppercase text-[#6b6b74] font-medium tracking-widest"
                  style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  Niches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {creator.niches.map((niche) => (
                    <span
                      key={niche}
                      className="px-2 py-1 rounded-[2px] border border-[#2a2a2f] text-[#a8a8b0] uppercase font-medium tracking-wider"
                      style={{ fontSize: "10px", letterSpacing: "0.06em" }}
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-[#2a2a2f]" />

            {/* Rate */}
            <div className="flex flex-col gap-1.5">
              <span
                className="uppercase text-[#6b6b74] font-medium tracking-widest"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                Rate range
              </span>
              <span className="font-mono text-[#f4f4f5] font-semibold text-base">
                {formatRate(creator.rate_min, creator.rate_max)}
              </span>
              <span className="text-[#6b6b74] text-xs">Per deliverable. Final rate agreed in booking.</span>
            </div>

            {/* CTA — sticky on mobile, inline on desktop */}
            <div className="hidden lg:flex flex-col gap-3 mt-2">
              <BookingCTA creator={creator} onOpen={() => setDialogOpen(true)} />
            </div>
          </aside>

          {/* ── RIGHT COLUMN: detail ── */}
          <main className="flex-1 flex flex-col gap-8 min-w-0">

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBlock
                eyebrow="Followers"
                value={formatFollowers(creator.follower_count)}
                icon={<Users size={10} />}
              />
              {creator.engagement_rate != null && (
                <StatBlock
                  eyebrow="Engagement"
                  value={`${creator.engagement_rate.toFixed(1)}%`}
                  icon={<TrendingUp size={10} />}
                />
              )}
              <StatBlock
                eyebrow="Platform"
                value={platform.label}
                icon={platform.icon}
              />
            </div>

            {/* Bio */}
            {creator.bio && (
              <section>
                <span
                  className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-3"
                  style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  About
                </span>
                <p className="text-[#a8a8b0] text-base leading-relaxed">
                  {creator.bio}
                </p>
              </section>
            )}

            {/* Portfolio */}
            {portfolioUrls.length > 0 && (
              <section>
                <span
                  className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-4"
                  style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  Portfolio
                </span>
                <div className="flex flex-col gap-3">
                  {portfolioUrls.map((url, i) => (
                    <PortfolioEmbed key={i} url={url} />
                  ))}
                </div>
              </section>
            )}

            {/* Deliverable types note */}
            <section className="bg-[#121214] border border-[#2a2a2f] rounded-[4px] p-5">
              <span
                className="block uppercase text-[#6b6b74] font-medium tracking-widest mb-3"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                How to work together
              </span>
              <p className="text-[#a8a8b0] text-sm leading-relaxed">
                Send a booking request with your campaign brief, deliverable type, budget, and timeline.{" "}
                {creator.display_name} will respond within 48 hours. Rates shown are starting ranges — final
                pricing is agreed in the booking thread.
              </p>
            </section>
          </main>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#0a0a0b] border-t border-[#2a2a2f]">
<BookingCTA creator={creator} onOpen={() => setDialogOpen(true)} fullWidth />

        </div>
        {/* Spacer so content isn't hidden behind sticky mobile CTA */}
        <div className="lg:hidden h-24" aria-hidden="true" />
              <BookingRequestDialog
        creator={creator}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
      </div>
    </div>
  );
}

// ─── Booking CTA ──────────────────────────────────────────────────────────────
// Isolated so it can be used in both the sidebar and the mobile sticky bar.
// BookingRequestDialog wires up in the next file — for now opens a placeholder.

function BookingCTA({
  creator,
  onOpen,
  fullWidth = false,
}: {
  creator: Creator;
  onOpen: () => void;
  fullWidth?: boolean;
}) {

  if (!creator.is_available) {
    return (
      <div
        className={[
          "flex items-center justify-center gap-2 h-11 rounded-[4px] border border-[#2a2a2f]",
          "text-[#6b6b74] text-sm font-medium cursor-not-allowed",
          fullWidth ? "w-full" : "",
        ].join(" ")}
      >
        Not taking bookings
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      data-booking-trigger={creator.id}
      className={[
        "flex items-center justify-center gap-2 h-11 rounded-[4px]",
        "bg-[#00c8d4] text-[#0a0a0b] text-sm font-semibold",
        "transition-all duration-[120ms]",
        "hover:brightness-110 active:translate-y-px active:brightness-90",
        "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
        fullWidth ? "w-full" : "w-full",
      ].join(" ")}
      aria-label={`Request booking with ${creator.display_name}`}
    >
      <Calendar size={15} />
      Request booking
    </button>
  );
}
