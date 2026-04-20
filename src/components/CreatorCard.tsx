// src/components/CreatorCard.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Instagram,
  Youtube,
  ExternalLink,
  TrendingUp,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Platform = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin";

export interface Creator {
  id: string;
  slug: string;
  handle: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  niches: string[];
  primary_platform: Platform;
  follower_count: number;
  engagement_rate?: number; // e.g. 4.2 = 4.2%
  rate_min?: number;
  rate_max?: number;
  is_available: boolean;
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

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
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

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CreatorCard({ creator, compact = false }: CreatorCardProps) {
  const [hovered, setHovered] = useState(false);

  const {
    slug,
    handle,
    display_name,
    avatar_url,
    niches,
    primary_platform,
    follower_count,
    engagement_rate,
    rate_min,
    rate_max,
    is_available,
  } = creator;

  return (
    <Link
      to={`/c/${slug}`}
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
        {/* ── Availability dot ── */}
        {is_available && (
          <span
            className="absolute top-4 right-4 flex items-center gap-1.5"
            aria-label="Available for bookings"
          >
            <span
              className="block w-1.5 h-1.5 rounded-full bg-[#cc2d8f]"
              style={{ boxShadow: "0 0 6px 1px rgba(204,45,143,0.6)" }}
            />
            <span className="text-[#a8a8b0] uppercase tracking-widest font-mono"
              style={{ fontSize: "10px", letterSpacing: "0.08em" }}>
              Available
            </span>
          </span>
        )}

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

            {/* Handle */}
            <span
              className="text-[#6b6b74] truncate"
              style={{ fontSize: "12px" }}
            >
              @{handle}
            </span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="flex items-center gap-4 border-t border-b border-[#1a1a1d] py-3">
          {/* Followers */}
          <div className="flex items-center gap-1.5 text-[#a8a8b0]">
            <Users size={13} className="shrink-0 text-[#6b6b74]" />
            <span className="font-mono text-[#f4f4f5] text-sm font-medium">
              {formatFollowers(follower_count)}
            </span>
            <span style={{ fontSize: "11px" }}>followers</span>
          </div>

          {/* Engagement rate */}
          {engagement_rate != null && (
            <>
              <span className="w-px h-3 bg-[#2a2a2f]" aria-hidden="true" />
              <div className="flex items-center gap-1.5 text-[#a8a8b0]">
                <TrendingUp size={13} className="shrink-0 text-[#3ad29f]" />
                <span className="font-mono text-[#f4f4f5] text-sm font-medium">
                  {engagement_rate.toFixed(1)}%
                </span>
                <span style={{ fontSize: "11px" }}>eng.</span>
              </div>
            </>
          )}
        </div>

        {/* ── Niche tags ── */}
        {niches.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Niches">
            {niches.slice(0, compact ? 2 : 4).map((niche) => (
              <span
                key={niche}
                className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-[#2a2a2f] text-[#a8a8b0] uppercase font-medium tracking-wider"
                style={{ fontSize: "10px", letterSpacing: "0.06em" }}
              >
                {niche}
              </span>
            ))}
            {niches.length > (compact ? 2 : 4) && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-[#2a2a2f] text-[#6b6b74] uppercase font-medium tracking-wider"
                style={{ fontSize: "10px", letterSpacing: "0.06em" }}
              >
                +{niches.length - (compact ? 2 : 4)}
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
              {formatRate(rate_min, rate_max)}
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
