import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, Clock, Inbox, ShieldCheck, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/Nav";
import { useBookings, type BookingStatus, type BookingRecord } from "@/hooks/useBookings";

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { bookings, loading, error, refetch, updateStatus } = useBookings("creator");

  const { pending, active, resolved } = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "pending");
    const active = bookings.filter((b) => b.status === "accepted" || b.status === "in_progress");
    const resolved = bookings.filter((b) => b.status === "completed" || b.status === "declined" || b.status === "cancelled");
    return { pending, active, resolved };
  }, [bookings]);

  const totalPendingValue = pending.reduce((sum, b) => sum + (b.budget_offer_usd ?? 0), 0);

  const handleAccept = async (id: string) => {
    const ok = await updateStatus(id, "accepted");
    if (ok) refetch();
  };

  const handleDecline = async (id: string) => {
    const ok = await updateStatus(id, "declined");
    if (ok) refetch();
  };

  return (
    <div className="min-h-screen bg-gg-ink text-gg-text">
      <Nav />

      <header className="border-b border-gg-line bg-gg-ink">
        <div className="container py-10 md:py-14">
          <div className="eyebrow mb-3">Creator dashboard</div>
          <h1 className="font-display text-gg-3xl md:text-gg-4xl tracking-gg-tight font-medium mb-4">Your bookings.</h1>
          <p className="text-gg-base text-gg-text-2 max-w-[56ch]">
            {loading ? "Loading your inbox…" : pending.length > 0 ? `${pending.length} ${pending.length === 1 ? "request needs" : "requests need"} your response. $${totalPendingValue.toLocaleString()} on the table.` : "No new requests right now. Completed work appears below."}
          </p>
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
            <span className="font-mono text-gg-xs uppercase tracking-gg-wider text-gg-cyan">Every sponsor vetted</span>
            <span>by Glow Guild before they reach you</span>
          </div>
        </div>
      </div>

      <main className="container py-10 md:py-14 space-y-14">
        {error && <div className="border border-gg-error/40 bg-gg-error/5 rounded-gg-md p-4 text-gg-sm text-gg-text">{error}</div>}

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 border border-gg-line bg-gg-ink-2 rounded-gg-md animate-pulse" />)}</div>
        ) : bookings.length === 0 && !error ? (
          <div className="border border-gg-line rounded-gg-lg bg-gg-ink-2 py-20 px-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gg-ink-3 border border-gg-line mb-5"><Inbox className="h-5 w-5 text-gg-text-3" /></div>
            <div className="eyebrow mb-3">No requests yet</div>
            <p className="text-gg-base text-gg-text-2 mb-6 max-w-[40ch] mx-auto">Your public profile is your front door. Share it with sponsors you've been talking to, or let the marketplace surface you.</p>
            <Link to="/creator/dashboard"><Button variant="outline" className="bg-transparent border-gg-line-2 text-gg-text hover:bg-gg-ink-3 rounded-gg-md">Edit my profile</Button></Link>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="eyebrow text-gg-magenta mb-1">Action needed</div>
                    <h2 className="font-display text-gg-2xl tracking-gg-tight font-medium">{pending.length} pending {pending.length === 1 ? "request" : "requests"}.</h2>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {pending.map((b) => (
                    <PendingCard key={b.id} booking={b} onAccept={() => handleAccept(b.id)} onDecline={() => handleDecline(b.id)} />
                  ))}
                </div>
              </section>
            )}

            {active.length > 0 && (
              <section>
                <div className="eyebrow mb-4">In progress</div>
                <h2 className="font-display text-gg-xl tracking-gg-tight font-medium mb-6">Active campaigns.</h2>
                <div className="space-y-3">
                  {active.map((b) => (
                    <ListRow key={b.id} booking={b} perspective="creator" />
                  ))}
                </div>
              </section>
            )}

            {resolved.length > 0 && (
              <section>
                <div className="eyebrow mb-4">Archive</div>
                <h2 className="font-display text-gg-xl tracking-gg-tight font-medium mb-6">Completed and past requests.</h2>
                <div className="space-y-3">
                  {resolved.map((b) => (
                    <ListRow key={b.id} booking={b} perspective="creator" />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function PendingCard({ booking, onAccept, onDecline }: { booking: BookingRecord; onAccept: () => void; onDecline: () => void; }) {
  const sponsorName = booking.sponsor_company_name ?? "A sponsor";
  const sponsorInitials = sponsorName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hoursSince = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60));

  return (
    <div className="relative border border-gg-line-2 bg-gg-ink-2 rounded-gg-lg p-6 md:p-7 hover:border-gg-cyan/50 transition-colors">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-full bg-gg-ink-3 border border-gg-line flex items-center justify-center font-mono text-gg-xs text-gg-text-2 shrink-0 overflow-hidden">
          {booking.sponsor_logo_url ? <img src={booking.sponsor_logo_url} alt={sponsorName} className="w-full h-full object-cover" /> : sponsorInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-gg-base font-medium text-gg-text truncate">{sponsorName}</div>
          <div className="font-mono text-[10px] uppercase tracking-gg-wider text-gg-text-3 mt-0.5 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {hoursSince < 1 ? "just now" : hoursSince < 24 ? `${hoursSince}h ago` : `${Math.floor(hoursSince / 24)}d ago`}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="eyebrow mb-2">Campaign</div>
        <h3 className="font-display text-gg-lg font-medium text-gg-text mb-2">{booking.campaign_title}</h3>
        <p className="text-gg-sm text-gg-text-2 line-clamp-3 leading-snug">{booking.campaign_brief}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gg-line mb-5">
        <div><div className="eyebrow mb-1.5">Offer</div><div className="text-gg-cyan font-display text-gg-lg font-medium">${booking.budget_offer_usd.toLocaleString()}</div></div>
        <div><div className="eyebrow mb-1.5">Deliverable</div><div className="font-display text-gg-lg font-medium">{formatDeliverable(booking.deliverable)}</div></div>
        <div><div className="eyebrow mb-1.5">Timeline</div><div className="font-display text-gg-lg font-medium">{formatTimeline(booking.timeline_start, booking.timeline_end)}</div></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onAccept} className="flex-1 bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium"><Check className="mr-2 h-4 w-4" />Accept</Button>
        <Button variant="outline" onClick={onDecline} className="flex-1 bg-transparent border-gg-line-2 text-gg-text-2 hover:bg-gg-ink-3 hover:text-gg-text rounded-gg-md"><X className="mr-2 h-4 w-4" />Decline</Button>
        <Link to={`/bookings/${booking.id}`} className="sm:w-auto"><Button variant="ghost" className="w-full sm:w-auto text-gg-text-2 hover:text-gg-text hover:bg-transparent">Details <ArrowUpRight className="ml-1 h-4 w-4" /></Button></Link>
      </div>
    </div>
  );
}

export function ListRow({ booking, perspective }: { booking: BookingRecord; perspective: "creator" | "sponsor"; }) {
  const counterparty = perspective === "creator" ? booking.sponsor_company_name ?? "Sponsor" : booking.creator_display_name ?? "Creator";
  return (
    <Link to={`/bookings/${booking.id}`} className="flex items-center gap-4 border border-gg-line bg-gg-ink-2 hover:bg-gg-ink-3 hover:border-gg-line-2 rounded-gg-md px-5 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-gg-cyan focus-visible:outline-offset-2">
      <StatusDot status={booking.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display text-gg-sm font-medium text-gg-text truncate">{booking.campaign_title}</span>
          <StatusBadge status={booking.status} />
        </div>
        <div className="text-gg-xs text-gg-text-2 truncate">{counterparty} · {formatDeliverable(booking.deliverable)}</div>
      </div>
      <div className="font-mono text-gg-sm text-gg-text tabular-nums shrink-0">${booking.budget_offer_usd.toLocaleString()}</div>
      <ArrowUpRight className="h-4 w-4 text-gg-text-3 shrink-0" />
    </Link>
  );
}

export function StatusDot({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, string> = { pending: "bg-gg-magenta", accepted: "bg-gg-cyan", in_progress: "bg-gg-cyan", completed: "bg-gg-success", declined: "bg-gg-text-3", cancelled: "bg-gg-text-3" };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${map[status]}`} aria-label={status} />;
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const labels: Record<BookingStatus, string> = { pending: "pending", accepted: "accepted", in_progress: "active", completed: "completed", declined: "declined", cancelled: "cancelled" };
  const classes: Record<BookingStatus, string> = {
    pending: "text-gg-magenta border-gg-magenta/40 bg-gg-magenta/5",
    accepted: "text-gg-cyan border-gg-cyan/40 bg-gg-cyan/5",
    in_progress: "text-gg-cyan border-gg-cyan/40 bg-gg-cyan/5",
    completed: "text-gg-success border-gg-success/40 bg-gg-success/5",
    declined: "text-gg-text-3 border-gg-line bg-gg-ink",
    cancelled: "text-gg-text-3 border-gg-line bg-gg-ink",
  };
  return <span className={`inline-flex items-center rounded-gg-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-gg-wider ${classes[status]}`}>{labels[status]}</span>;
}

export function formatDeliverable(d: string): string {
  const map: Record<string, string> = { post: "Feed post", reel: "Reel", story: "Story set", video: "Long-form video", ugc_asset: "UGC asset", bundle: "Multi-deliverable" };
  return map[d] ?? d;
}

export function formatTimeline(start: string | null, end: string | null): string {
  if (!start && !end) return "Flexible";
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `from ${fmt(start)}`;
  return `by ${fmt(end!)}`;
}
