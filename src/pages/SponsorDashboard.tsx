import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, Inbox, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/Nav";
import { useBookings } from "@/hooks/useBookings";
import { ListRow } from "@/pages/CreatorDashboard";

export default function SponsorDashboard() {
  const navigate = useNavigate();
  const { bookings, loading, error } = useBookings("sponsor");

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "pending");
    const active = bookings.filter((b) => b.status === "accepted" || b.status === "in_progress");
    const completed = bookings.filter((b) => b.status === "completed");
    const declined = bookings.filter((b) => b.status === "declined" || b.status === "cancelled");

    const committedSpend = [...active, ...completed].reduce((sum, b) => sum + (b.budget_offer_usd ?? 0), 0);
    const pendingSpend = pending.reduce((sum, b) => sum + (b.budget_offer_usd ?? 0), 0);

    return { pending, active, completed, declined, pendingCount: pending.length, activeCount: active.length, completedCount: completed.length, committedSpend, pendingSpend, totalSent: bookings.length };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gg-ink text-gg-text">
      <Nav />

      <header className="border-b border-gg-line bg-gg-ink">
        <div className="container py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Sponsor dashboard</div>
              <h1 className="font-display text-gg-3xl md:text-gg-4xl tracking-gg-tight font-medium mb-4">Your campaigns.</h1>
              <p className="text-gg-base text-gg-text-2 max-w-[56ch]">
                {loading ? "Loading…" : stats.totalSent === 0 ? "You haven't sent any booking requests yet." : `${stats.totalSent} total ${stats.totalSent === 1 ? "request" : "requests"} sent. ${stats.pendingCount} awaiting creator response.`}
              </p>
            </div>
            <Link to="/discover"><Button size="lg" className="h-12 px-6 bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium"><Search className="mr-2 h-4 w-4" />Find creators</Button></Link>
          </div>
        </div>
      </header>

      {!loading && stats.totalSent > 0 && (
        <div className="border-b border-gg-line bg-gg-ink-2">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gg-line">
              <div className="px-5 py-7 md:px-8 md:py-8">
                <div className={`font-display text-gg-2xl md:text-gg-3xl font-medium tracking-gg-tight tabular-nums ${stats.pendingCount > 0 ? "text-gg-magenta" : "text-gg-text"}`}>{stats.pendingCount}</div>
                <div className="eyebrow mt-2">Pending</div>
                {stats.pendingSpend > 0 && <div className="font-mono text-gg-xs text-gg-text-3 mt-1">${stats.pendingSpend.toLocaleString()} offered</div>}
              </div>
              <div className="px-5 py-7 md:px-8 md:py-8">
                <div className={`font-display text-gg-2xl md:text-gg-3xl font-medium tracking-gg-tight tabular-nums ${stats.activeCount > 0 ? "text-gg-cyan" : "text-gg-text"}`}>{stats.activeCount}</div>
                <div className="eyebrow mt-2">Active</div>
              </div>
              <div className="px-5 py-7 md:px-8 md:py-8">
                <div className="font-display text-gg-2xl md:text-gg-3xl font-medium tracking-gg-tight tabular-nums text-gg-text">{stats.completedCount}</div>
                <div className="eyebrow mt-2">Completed</div>
              </div>
              <div className="px-5 py-7 md:px-8 md:py-8">
                <div className="font-display text-gg-2xl md:text-gg-3xl font-medium tracking-gg-tight tabular-nums text-gg-text">${stats.committedSpend.toLocaleString()}</div>
                <div className="eyebrow mt-2">Committed spend</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container py-10 md:py-14 space-y-14">
        {error && <div className="border border-gg-error/40 bg-gg-error/5 rounded-gg-md p-4 text-gg-sm text-gg-text">{error}</div>}

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 border border-gg-line bg-gg-ink-2 rounded-gg-md animate-pulse" />)}</div>
        ) : bookings.length === 0 && !error ? (
          <div className="border border-gg-line rounded-gg-lg bg-gg-ink-2 py-20 px-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gg-ink-3 border border-gg-line mb-5"><TrendingUp className="h-5 w-5 text-gg-text-3" /></div>
            <div className="eyebrow mb-3">Your first campaign</div>
            <p className="text-gg-base text-gg-text-2 mb-6 max-w-[44ch] mx-auto">Find a creator whose audience fits your brand. Send a brief. Most creators respond in under a day.</p>
            <Link to="/discover"><Button className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium"><Search className="mr-2 h-4 w-4" />Browse creators</Button></Link>
          </div>
        ) : (
          <>
            {stats.pending.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div>
                    <div className="eyebrow text-gg-magenta mb-1">Awaiting response</div>
                    <h2 className="font-display text-gg-2xl tracking-gg-tight font-medium">{stats.pendingCount} pending.</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.pending.map((b) => (
                    <ListRow key={b.id} booking={b} perspective="sponsor" />
                  ))}
                </div>
              </section>
            )}

            {stats.active.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div>
                    <div className="eyebrow text-gg-cyan mb-1">Live</div>
                    <h2 className="font-display text-gg-xl tracking-gg-tight font-medium">In progress.</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.active.map((b) => (
                    <ListRow key={b.id} booking={b} perspective="sponsor" />
                  ))}
                </div>
              </section>
            )}

            {stats.completed.length > 0 && (
              <section>
                <div className="eyebrow mb-4">Completed</div>
                <h2 className="font-display text-gg-xl tracking-gg-tight font-medium mb-6">Past campaigns.</h2>
                <div className="space-y-3">
                  {stats.completed.map((b) => (
                    <ListRow key={b.id} booking={b} perspective="sponsor" />
                  ))}
                </div>
              </section>
            )}

            {stats.declined.length > 0 && (
              <section>
                <div className="eyebrow mb-4">Archive</div>
                <h2 className="font-display text-gg-xl tracking-gg-tight font-medium mb-6">Declined or cancelled.</h2>
                <div className="space-y-3">
                  {stats.declined.map((b) => (
                    <ListRow key={b.id} booking={b} perspective="sponsor" />
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
