// src/components/CreatorCard.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Instagram,
  Youtube,
  ExternalLink,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

import type { Platform } from "@/integrations/supabase/types";
export type { Platform };

export interface Creator {
  id: string;
  profile_slug: string;
  display_name: string;
  bio?: string;
  location_city?: string;
  location_region?: string;
  niche_tags: string[];
  primary_platforms: Platform[];
  follower_count_total: number;
  rate_min_usd?: number;
  rate_max_usd?: number;
  avatar_url?: string;
  portfolio_links?: string[];
}

interface CreatorCardProps {
  creator: Creator;
  /** If true, renders a compact version for list views */
  compact?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatRate(min?: number, max?: number): string {
  if (!min && !max) return "Rate on request";
  if (min && max) return `$${min}–$${max}`;
  if (min) return `From $${min}`;
  if (max) return `Up to $${max}`;
  return "Rate on request";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const PLATFORM_ICONS: Partial<Record<Platform, React.ReactNode>> = {
  instagram: <Instagram size={13} />,
  tiktok: (
    // Simple TikTok glyph (no lucide icon)
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.41a8.16 8.16 0 0 0 4.77 1.52V7.48a4.85 4.85 0 0 1-1.01-.79z" />
    </svg>
  ),
  youtube: <Youtube size={13} />,
  twitter: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

const PLATFORM_LABELS: Partial<Record<Platform, string>> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  other: "Other",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CreatorCard({ creator, compact = false }: CreatorCardProps) {
  const [hovered, setHovered] = useState(false);

  const {
    profile_slug,
    display_name,
    avatar_url,
    niche_tags,
    primary_platforms,
    follower_count_total,
    rate_min_usd,
    rate_max_usd,
  } = creator;

  const primary_platform: Platform = primary_platforms?.[0] ?? "instagram";

  return (
    <Link
      to={`/c/${profile_slug}`}
      className="group block focus-visible:outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`View ${display_name}'s profile`}
    >
      <article
        className={[
          // Base card
          "relative flex flex-col",
          "bg-[#121214] border border-[#2a2a2f]",
          "rounded-[4px] overflow-hidden",
          // Hover lift
          "transition-all duration-[220ms]",
          hovered
            ? "-translate-y-0.5 border-[#3a3a42]"
            : "translate-y-0",
          compact ? "p-4 gap-3" : "p-6 gap-4",
        ].join(" ")}
        style={{
          boxShadow: hovered
            ? "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6)"
            : "none",
        }}
      >
        {/* ── Header: avatar + name + platform ── */}
        <div className="flex items-start gap-3">
          <Avatar
            className={[
              "shrink-0 rounded-full border border-[#2a2a2f]",
              "transition-all duration-[220ms]",
              hovered ? "border-[#00c8d4] shadow-[0_0_0_1px_rgba(0,200,212,0.3)]" : "",
              compact ? "h-10 w-10" : "h-12 w-12",
            ].join(" ")}
          >
            {avatar_url && <AvatarImage src={avatar_url} alt={display_name} />}
            <AvatarFallback
              className="bg-[#1a1a1d] text-[#a8a8b0] font-mono text-xs"
            >
              {getInitials(display_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0 pt-0.5">
            {/* Eyebrow: platform */}
            <span
              className="uppercase text-[#6b6b74] font-medium tracking-widest flex items-center gap-1"
              style={{ fontSize: "10px", letterSpacing: "0.08em" }}
            >
              {PLATFORM_ICONS[primary_platform]}
              {PLATFORM_LABELS[primary_platform]}
            </span>

            {/* Display name */}
            <span
              className={[
                "font-bold text-[#f4f4f5] leading-tight truncate",
                "transition-colors duration-[220ms]",
                hovered ? "text-[#00c8d4]" : "",
                compact ? "text-base" : "text-lg",
              ].join(" ")}
            >
              {display_name}
            </span>

          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="flex items-center gap-4 border-t border-b border-[#1a1a1d] py-3">
          {/* Followers */}
          <div className="flex items-center gap-1.5 text-[#a8a8b0]">
            <Users size={13} className="shrink-0 text-[#6b6b74]" />
            <span className="font-mono text-[#f4f4f5] text-sm font-medium">
              {formatFollowers(follower_count_total)}
            </span>
            <span style={{ fontSize: "11px" }}>followers</span>
          </div>
        </div>

        {/* ── Niche tags ── */}
        {niche_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Niches">
            {niche_tags.slice(0, compact ? 2 : 4).map((niche) => (
              <span
                key={niche}
                className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-[#2a2a2f] text-[#a8a8b0] uppercase font-medium tracking-wider"
                style={{ fontSize: "10px", letterSpacing: "0.06em" }}
              >
                {niche}
              </span>
            ))}
            {niche_tags.length > (compact ? 2 : 4) && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-[#2a2a2f] text-[#6b6b74] uppercase font-medium tracking-wider"
                style={{ fontSize: "10px", letterSpacing: "0.06em" }}
              >
                +{niche_tags.length - (compact ? 2 : 4)}
              </span>
            )}
          </div>
        )}

        {/* ── Footer: rate + CTA indicator ── */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <span
              className="uppercase text-[#6b6b74] font-medium tracking-widest"
              style={{ fontSize: "10px", letterSpacing: "0.08em" }}
            >
              Rate range
            </span>
            <span className="text-[#f4f4f5] font-mono text-sm font-semibold">
              {formatRate(rate_min_usd, rate_max_usd)}
            </span>
          </div>

          {/* Arrow caret — appears on hover */}
          <span
            className={[
              "flex items-center justify-center w-7 h-7",
              "rounded-[4px] border",
              "transition-all duration-[220ms]",
              hovered
                ? "border-[#00c8d4] text-[#00c8d4] bg-[#00c8d4]/5"
                : "border-[#2a2a2f] text-[#3a3a42]",
            ].join(" ")}
            aria-hidden="true"
          >
            <ExternalLink size={13} />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default CreatorCard;
