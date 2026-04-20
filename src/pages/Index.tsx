import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ── Minimal icon set (inline SVG, no dep) ──────────────────────────────────
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1l1.5 4h4l-3.3 2.4 1.3 4L7 9 3.5 11.4l1.3-4L1.5 5h4z" fill="currentColor" opacity="0.9"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Static data ─────────────────────────────────────────────────────────────
const NICHES = ["Fitness", "Food", "Fashion", "Beauty", "Lifestyle", "Wellness", "Tech", "Travel"];

const CREATORS = [
  { handle: "@kayla.moves", niche: "Fitness", location: "Chicago, IL", followers: "18.4K", rate: "$200–400", avatar: "KM", verified: true },
  { handle: "@tastewithomar", niche: "Food", location: "Austin, TX", followers: "31.2K", rate: "$300–600", avatar: "TO", verified: true },
  { handle: "@styled.by.ren", niche: "Fashion", location: "New York, NY", followers: "9.8K", rate: "$150–300", avatar: "SR", verified: false },
  { handle: "@glowwithpriya", niche: "Beauty", location: "Los Angeles, CA", followers: "44.1K", rate: "$400–800", avatar: "GP", verified: true },
  { handle: "@weeknights.with.lu", niche: "Lifestyle", location: "Chicago, IL", followers: "12.7K", rate: "$180–350", avatar: "WL", verified: false },
  { handle: "@fitwithdre", niche: "Fitness", location: "Atlanta, GA", followers: "27.3K", rate: "$250–500", avatar: "FD", verified: true },
];

const STATS = [
  { value: "2,400+", label: "Creators" },
  { value: "$180", label: "Avg. booking" },
  { value: "10 min", label: "To first match" },
  { value: "94%", label: "Completion rate" },
];

const HOW_IT_WORKS_SPONSOR = [
  { n: "01", title: "Post what you need", body: "Niche, location, budget, timeline. No agency. No sales call." },
  { n: "02", title: "Browse matched creators", body: "Filter by platform, follower range, rate, and availability in real time." },
  { n: "03", title: "Send a booking request", body: "Your brief goes directly to the creator. They accept or pass — usually within 24 hours." },
  { n: "04", title: "Campaign complete", body: "You review deliverables. We collect a 10% success fee. No upfront cost." },
];

const HOW_IT_WORKS_CREATOR = [
  { n: "01", title: "Build your profile", body: "Add your niche, rate, platforms, and portfolio in under 10 minutes." },
  { n: "02", title: "Get found", body: "Sponsors search for you. No cold pitching." },
  { n: "03", title: "Accept or decline", body: "You control every deal. See the brief and budget before you commit." },
  { n: "04", title: "Get paid", body: "Free forever for creators. No cut taken from your rate." },
];

// ── Animated counter hook ────────────────────────────────────────────────────
function useInView(ref: React.RefObject<Element>, threshold = 0.2) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

// ── Creator card ─────────────────────────────────────────────────────────────
function CreatorCard({ creator, index }: { creator: typeof CREATORS[0]; index: number }) {
  return (
    <div
      className="card-base p-6 flex flex-col gap-4 cursor-pointer group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-medium flex-shrink-0 transition-shadow duration-base"
            style={{
              background: "var(--gg-ink-3)",
              border: "1px solid var(--gg-line-2)",
              color: "var(--gg-cyan)",
            }}
          >
            {creator.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm" style={{ color: "var(--gg-text)" }}>
                {creator.handle}
              </span>
              {creator.verified && (
                <span style={{ color: "var(--gg-cyan)" }}>
                  <IconCheck />
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--gg-text-3)" }}>
              {creator.location}
            </p>
          </div>
        </div>
        {/* Niche tag */}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-sm border flex-shrink-0"
          style={{
            color: "var(--gg-text-2)",
            borderColor: "var(--gg-line)",
            background: "var(--gg-ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          {creator.niche}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--gg-line)" }}>
        <div>
          <p className="eyebrow mb-0.5">Followers</p>
          <p className="text-sm font-medium" style={{ color: "var(--gg-text)" }}>{creator.followers}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow mb-0.5">Rate</p>
          <p className="text-sm font-medium" style={{ color: "var(--gg-text)" }}>{creator.rate}</p>
        </div>
        <div
          className="w-8 h-8 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-base"
          style={{ background: "var(--gg-ink-4)", color: "var(--gg-cyan)" }}
          aria-hidden="true"
        >
          <IconArrow />
        </div>
      </div>
    </div>
  );
}

// ── Step card ────────────────────────────────────────────────────────────────
function StepCard({ step, index }: { step: typeof HOW_IT_WORKS_SPONSOR[0]; index: number }) {
  return (
    <div className="flex gap-5" style={{ animationDelay: `${index * 100}ms` }}>
      <div
        className="font-mono text-xs font-medium flex-shrink-0 mt-1"
        style={{ color: "var(--gg-text-3)", letterSpacing: "0.04em", minWidth: "24px" }}
      >
        {step.n}
      </div>
      <div>
        <h4 className="text-base font-semibold mb-1" style={{ color: "var(--gg-text)", lineHeight: 1.3 }}>
          {step.title}
        </h4>
        <p className="text-sm" style={{ color: "var(--gg-text-2)", lineHeight: 1.6 }}>
          {step.body}
        </p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Index() {
  const [activeTab, setActiveTab] = useState<"sponsor" | "creator">("sponsor");
  const [activeNiche, setActiveNiche] = useState("Fitness");
  const statsRef = useRef<HTMLDivElement>(null);
  const statsVisible = useInView(statsRef as React.RefObject<Element>);

  // Filtered creators
  const filtered = CREATORS.filter(c => c.niche === activeNiche);
  const displayed = filtered.length ? filtered : CREATORS.slice(0, 3);

  return (
    <div className="noise-overlay" style={{ background: "var(--gg-ink)", minHeight: "100vh" }}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10"
        style={{
          height: "72px",
          background: "rgba(10,10,11,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--gg-line)",
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group" aria-label="Glow Guild home">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold"
            style={{ background: "var(--gg-cyan)", color: "var(--gg-text-inv)" }}
          >
            GG
          </div>
          <span className="font-semibold text-sm tracking-wide" style={{ color: "var(--gg-text)", letterSpacing: "0.06em" }}>
            GLOW GUILD
          </span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {["Discover", "For Creators", "Pricing"].map(label => (
            <a
              key={label}
              href="#"
              className="text-sm transition-colors duration-fast"
              style={{ color: "var(--gg-text-2)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gg-text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--gg-text-2)")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="btn btn-ghost btn-sm hidden md:inline-flex"
            style={{ color: "var(--gg-text-2)" }}
          >
            Sign in
          </Link>
          <Link to="/auth" className="btn btn-primary btn-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          minHeight: "100svh",
          padding: "72px 24px 0",
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,200,212,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 60%, rgba(204,45,143,0.05) 0%, transparent 50%),
            var(--gg-ink)
          `,
        }}
      >
        {/* Grid lines decoration */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--gg-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--gg-line) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.3,
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 80%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-8 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <span className="live-dot" aria-hidden="true" />
            <span className="eyebrow-cyan">Creator marketplace — now in beta</span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up"
            style={{
              fontSize: "clamp(3rem, 5vw + 1rem, 7rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "var(--gg-text)",
              animationDelay: "200ms",
            }}
          >
            The marketplace<br />
            <span style={{ color: "var(--gg-cyan)" }}>built for the</span>
            <br />
            <span
              style={{
                WebkitTextStroke: "1px var(--gg-text-3)",
                color: "transparent",
              }}
            >
              long tail.
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="mt-6 mx-auto animate-fade-up"
            style={{
              fontSize: "clamp(1rem, 1.2vw + 0.5rem, 1.25rem)",
              color: "var(--gg-text-2)",
              lineHeight: 1.6,
              maxWidth: "540px",
              animationDelay: "320ms",
            }}
          >
            Sponsors find and book nano and micro creators in under 10 minutes.
            Creators get paid without cold pitching.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 animate-fade-up"
            style={{ animationDelay: "420ms" }}
          >
            <Link to="/auth" className="btn btn-primary btn-lg w-full sm:w-auto">
              Find a creator
              <IconArrow />
            </Link>
            <Link to="/auth" className="btn btn-secondary btn-lg w-full sm:w-auto">
              Join as a creator
            </Link>
          </div>

          {/* Social proof */}
          <div
            className="mt-10 flex items-center justify-center gap-2 animate-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex -space-x-2">
              {["KM", "TO", "GP", "FD"].map((initials, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium border-2"
                  style={{
                    background: "var(--gg-ink-3)",
                    borderColor: "var(--gg-ink)",
                    color: "var(--gg-cyan)",
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: "var(--gg-warn)" }}><IconStar /></span>
              ))}
            </div>
            <span className="text-sm" style={{ color: "var(--gg-text-2)" }}>
              Trusted by 400+ creators
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
          style={{ animationDelay: "900ms" }}
          aria-hidden="true"
        >
          <span className="eyebrow" style={{ fontSize: "10px" }}>Scroll</span>
          <div
            className="w-px h-12"
            style={{
              background: "linear-gradient(to bottom, var(--gg-line-2), transparent)",
            }}
          />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="py-16 px-6"
        style={{ borderTop: "1px solid var(--gg-line)", borderBottom: "1px solid var(--gg-line)" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
              style={{
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.6s var(--gg-ease) ${i * 80}ms, transform 0.6s var(--gg-ease) ${i * 80}ms`,
              }}
            >
              <div
                className="font-display font-bold"
                style={{ fontSize: "clamp(2rem, 3vw + 0.5rem, 3rem)", color: "var(--gg-text)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {stat.value}
              </div>
              <div className="eyebrow mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCOVERY PREVIEW ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Section header */}
          <div className="mb-10">
            <p className="eyebrow mb-3">Creator discovery</p>
            <h2
              style={{
                fontSize: "clamp(2rem, 3vw + 0.5rem, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "var(--gg-text)",
              }}
            >
              Browse by niche.
              <br />
              <span style={{ color: "var(--gg-text-3)" }}>Book in minutes.</span>
            </h2>
          </div>

          {/* Niche filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {NICHES.map(niche => (
              <button
                key={niche}
                onClick={() => setActiveNiche(niche)}
                className="btn btn-sm"
                style={{
                  background: activeNiche === niche ? "var(--gg-cyan)" : "var(--gg-ink-2)",
                  color: activeNiche === niche ? "var(--gg-text-inv)" : "var(--gg-text-2)",
                  borderColor: activeNiche === niche ? "var(--gg-cyan)" : "var(--gg-line)",
                  letterSpacing: "0.02em",
                }}
              >
                {niche}
              </button>
            ))}
          </div>

          {/* Creator grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((creator, i) => (
              <CreatorCard key={creator.handle} creator={creator} index={i} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link to="/discover" className="btn btn-secondary">
              Browse all creators
              <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ borderTop: "1px solid var(--gg-line)", background: "var(--gg-ink-2)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="eyebrow mb-3">How it works</p>
            <h2
              style={{
                fontSize: "clamp(2rem, 3vw + 0.5rem, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "var(--gg-text)",
              }}
            >
              Simple for both sides.
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-10 p-1 rounded-md w-fit" style={{ background: "var(--gg-ink-3)" }}>
            {(["sponsor", "creator"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="btn btn-sm capitalize"
                style={{
                  background: activeTab === tab ? "var(--gg-ink-4)" : "transparent",
                  color: activeTab === tab ? "var(--gg-text)" : "var(--gg-text-2)",
                  border: "none",
                  minHeight: "36px",
                }}
              >
                {tab === "sponsor" ? "For sponsors" : "For creators"}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(activeTab === "sponsor" ? HOW_IT_WORKS_SPONSOR : HOW_IT_WORKS_CREATOR).map((step, i) => (
              <StepCard key={step.n} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING STRIP ────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ borderTop: "1px solid var(--gg-line)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="eyebrow mb-3">Pricing</p>
            <h2
              style={{
                fontSize: "clamp(2rem, 3vw + 0.5rem, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "var(--gg-text)",
              }}
            >
              No upfront cost.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sponsor */}
            <div className="card-base p-8">
              <p className="eyebrow mb-4">For sponsors</p>
              <div
                className="font-bold mb-1"
                style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", color: "var(--gg-text)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                10%
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--gg-text-2)" }}>
                Success fee per completed booking. Zero cost until it works.
              </p>
              <ul className="flex flex-col gap-3">
                {["Unlimited discovery", "Direct creator messaging", "Campaign brief templates", "No contracts required"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--gg-text-2)" }}>
                    <span style={{ color: "var(--gg-success)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="btn btn-primary mt-8 w-full justify-center">
                Start for free
              </Link>
            </div>

            {/* Creator */}
            <div
              className="card-base p-8 relative overflow-hidden"
              style={{ borderColor: "var(--gg-cyan)", boxShadow: "var(--gg-glow-cyan)" }}
            >
              {/* Accent top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "var(--gg-cyan)", opacity: 0.6 }}
                aria-hidden="true"
              />
              <p className="eyebrow-cyan mb-4">For creators</p>
              <div
                className="font-bold mb-1"
                style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", color: "var(--gg-text)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                Free.
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--gg-text-2)" }}>
                Always. We never take a cut of your rate.
              </p>
              <ul className="flex flex-col gap-3">
                {["Public profile + shareable link", "Inbound booking requests", "In-app messaging", "Rate control — yours to set"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--gg-text-2)" }}>
                    <span style={{ color: "var(--gg-cyan)" }}><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="btn btn-secondary mt-8 w-full justify-center">
                Join as a creator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center relative overflow-hidden"
        style={{
          borderTop: "1px solid var(--gg-line)",
          background: `
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,200,212,0.06) 0%, transparent 70%),
            var(--gg-ink-2)
          `,
        }}
      >
        {/* Magenta accent — one per view */}
        <div
          aria-hidden="true"
          className="absolute top-6 right-12 w-2 h-2 rounded-full"
          style={{ background: "var(--gg-magenta)", boxShadow: "0 0 16px 4px rgba(204,45,143,0.3)" }}
        />

        <div className="max-w-2xl mx-auto relative z-10">
          <p className="eyebrow mb-6">Beta — limited spots</p>
          <h2
            style={{
              fontSize: "clamp(2.5rem, 4vw + 0.5rem, 5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              color: "var(--gg-text)",
            }}
          >
            Your next brand deal
            <br />
            <span style={{ color: "var(--gg-cyan)" }}>starts here.</span>
          </h2>
          <p className="mt-4 mb-10 text-base" style={{ color: "var(--gg-text-2)" }}>
            No agency. No cold DMs. No guessing rates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth" className="btn btn-primary btn-lg w-full sm:w-auto">
              Get started free
              <IconArrow />
            </Link>
            <Link to="/discover" className="btn btn-ghost btn-lg w-full sm:w-auto">
              Browse creators first
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6"
        style={{ borderTop: "1px solid var(--gg-line)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold"
              style={{ background: "var(--gg-ink-3)", border: "1px solid var(--gg-line)", color: "var(--gg-cyan)" }}
            >
              GG
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--gg-text-3)", letterSpacing: "0.06em" }}>
              GLOW GUILD
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--gg-text-3)" }}>
            © 2025 Glow Guild · A GeoDMus venture
          </p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Contact"].map(link => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors duration-fast"
                style={{ color: "var(--gg-text-3)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gg-text-2)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--gg-text-3)")}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
