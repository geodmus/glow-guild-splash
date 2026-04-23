import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, Send, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";
import { BookingStatus, BookingRecord } from "@/hooks/useBookings";
import { StatusBadge, formatDeliverable, formatTimeline } from "@/pages/CreatorDashboard";

type Message = {
  id: string;
  booking_request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type Perspective = "creator" | "sponsor" | null;

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [perspective, setPerspective] = useState<Perspective>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composeValue, setComposeValue] = useState("");
  const [sending, setSending] = useState(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const loadBooking = useCallback(async () => {
    if (!id) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      navigate("/auth");
      return;
    }
    const uid = authData.user.id;
    setCurrentUserId(uid);

    const { data, error: fetchError } = await supabase
      .from("booking_requests")
      .select(
        `id, created_at, updated_at, status, campaign_title, campaign_brief, deliverable, budget_offer_usd, timeline_start, timeline_end, sponsor_id, creator_id, creators:creator_id(display_name, profile_slug, avatar_url), sponsors:sponsor_id(company_name, logo_url)`
      )
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !data) {
      setError("Booking not found or you don't have access.");
      setLoading(false);
      return;
    }

    const row = data as any;
    setBooking({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      status: row.status,
      campaign_title: row.campaign_title,
      campaign_brief: row.campaign_brief,
      deliverable: row.deliverable,
      budget_offer_usd: row.budget_offer_usd,
      timeline_start: row.timeline_start,
      timeline_end: row.timeline_end,
      sponsor_id: row.sponsor_id,
      creator_id: row.creator_id,
      creator_display_name: row.creators?.display_name ?? null,
      creator_slug: row.creators?.profile_slug ?? null,
      creator_avatar_url: row.creators?.avatar_url ?? null,
      sponsor_company_name: row.sponsors?.company_name ?? null,
      sponsor_logo_url: row.sponsors?.logo_url ?? null,
    });

    if (row.creator_id === uid) {
      setPerspective("creator");
    } else if (row.sponsor_id === uid) {
      setPerspective("sponsor");
    } else {
      setError("You don't have access to this booking.");
    }

    setLoading(false);
  }, [id, navigate]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("messages")
      .select("id, booking_request_id, sender_id, body, created_at, read_at")
      .eq("booking_request_id", id)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (!id) return;

    loadMessages();

    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `booking_request_id=eq.${id}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "booking_requests", filter: `id=eq.${id}` },
        () => {
          loadBooking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadMessages, loadBooking]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const updateStatus = async (next: BookingStatus) => {
    if (!booking) return;
    const updates: Record<string, any> = { status: next, updated_at: new Date().toISOString() };
    if (next === "accepted") updates.accepted_at = new Date().toISOString();
    if (next === "completed") updates.completed_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("booking_requests")
      .update(updates)
      .eq("id", booking.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setBooking({ ...booking, status: next });
  };

  const sendMessage = async () => {
    if (!booking || !currentUserId || !composeValue.trim()) return;
    setSending(true);
    const body = composeValue.trim();
    setComposeValue("");

    const { error: insertError } = await supabase.from("messages").insert({
      booking_request_id: booking.id,
      sender_id: currentUserId,
      body,
    });

    if (insertError) {
      setError(insertError.message);
      setComposeValue(body);
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gg-ink text-gg-text">
        <Nav />
        <div className="container py-20">
          <div className="h-8 w-1/3 bg-gg-ink-2 rounded-gg-sm animate-pulse mb-4" />
          <div className="h-32 bg-gg-ink-2 rounded-gg-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gg-ink text-gg-text">
        <Nav />
        <div className="container py-20 text-center">
          <div className="eyebrow mb-3">404</div>
          <h1 className="font-display text-gg-3xl tracking-gg-tight font-medium mb-4">{error ?? "Booking not found."}</h1>
          <Button onClick={() => navigate(-1)} variant="outline" className="bg-transparent border-gg-line-2 text-gg-text hover:bg-gg-ink-3 rounded-gg-md">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const counterparty = perspective === "creator" ? booking.sponsor_company_name ?? "Sponsor" : booking.creator_display_name ?? "Creator";

  return (
    <div className="min-h-screen bg-gg-ink text-gg-text">
      <Nav />

      <div className="container pt-6">
        <Link to={perspective === "creator" ? "/creator/dashboard" : "/sponsor/dashboard"}>
          <Button variant="ghost" size="sm" className="text-gg-text-2 hover:text-gg-text hover:bg-transparent -ml-3">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>

      <header className="container pt-4 pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="eyebrow mb-2 flex items-center gap-2">
              <span>Campaign</span>
              <StatusBadge status={booking.status} />
            </div>
            <h1 className="font-display text-gg-2xl md:text-gg-3xl tracking-gg-tight font-medium">{booking.campaign_title}</h1>
            <p className="text-gg-sm text-gg-text-2 mt-2">
              {perspective === "creator" ? "From" : "With"} <span className="text-gg-text">{counterparty}</span> · {timeAgoString(booking.created_at)}
            </p>
          </div>

          <ActionButtons status={booking.status} perspective={perspective} onUpdate={updateStatus} />
        </div>

        <StatusStepper status={booking.status} />
      </header>

      <main className="container pb-20 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-8">
          <div className="border border-gg-line bg-gg-ink-2 rounded-gg-lg p-6 md:p-8">
            <div className="eyebrow mb-4">Campaign brief</div>
            <p className="text-gg-base text-gg-text leading-relaxed whitespace-pre-line">{booking.campaign_brief}</p>
          </div>

          <div className="border border-gg-line bg-gg-ink-2 rounded-gg-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-gg-line">
              <Detail label="Offer" value={`$${booking.budget_offer_usd.toLocaleString()}`} accent />
              <Detail label="Deliverable" value={formatDeliverable(booking.deliverable)} />
              <Detail label="Timeline" value={formatTimeline(booking.timeline_start, booking.timeline_end)} />
            </div>
          </div>

          <div className="border border-gg-cyan/30 bg-gg-cyan/5 rounded-gg-lg p-5">
            <div className="flex items-start gap-3">
              <Wallet className="h-5 w-5 text-gg-cyan shrink-0 mt-0.5" />
              <div>
                <div className="eyebrow text-gg-cyan mb-1">Instant payout guarantee</div>
                <p className="text-gg-sm text-gg-text-2">
                  {perspective === "creator" ? "You'll be paid within 24 hours of the sponsor verifying your delivery. No 60-day invoice cycles, no chasing." : "Funds release to the creator within 24 hours of you verifying the deliverable. Holds in escrow until you approve."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-gg-line bg-gg-ink-2 rounded-gg-lg flex flex-col h-[600px] lg:sticky lg:top-[96px]">
          <div className="px-5 py-4 border-b border-gg-line flex items-center justify-between">
            <div>
              <div className="eyebrow">Thread</div>
              <div className="font-display text-gg-sm font-medium text-gg-text">{counterparty}</div>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-gg-wider text-gg-text-3">{messages.length} {messages.length === 1 ? "message" : "messages"}</div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gg-sm text-gg-text-3 py-10">No messages yet. Say hi.</div>
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} message={m} isMine={m.sender_id === currentUserId} />
              ))
            )}
            <div ref={threadEndRef} />
          </div>

          <div className="border-t border-gg-line p-3">
            <div className="flex gap-2">
              <textarea
                value={composeValue}
                onChange={(e) => setComposeValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                placeholder="Message…"
                className="flex-1 bg-gg-ink border border-gg-line rounded-gg-md px-3 py-2 text-gg-sm text-gg-text placeholder:text-gg-text-3 focus:border-gg-cyan focus:outline-none focus:ring-1 focus:ring-gg-cyan resize-none"
              />
              <Button onClick={sendMessage} disabled={!composeValue.trim() || sending} className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium self-stretch px-3 disabled:opacity-40" aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-gg-wider text-gg-text-3 mt-1.5 px-1">Enter to send · Shift+Enter for newline</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function ActionButtons({ status, perspective, onUpdate }: { status: BookingStatus; perspective: Perspective; onUpdate: (s: BookingStatus) => void; }) {
  if (perspective === "creator") {
    if (status === "pending") {
      return (
        <div className="flex gap-2">
          <Button onClick={() => onUpdate("accepted")} className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium">
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => onUpdate("declined")} className="bg-transparent border-gg-line-2 text-gg-text-2 hover:bg-gg-ink-3 hover:text-gg-text rounded-gg-md">
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>
      );
    }
    if (status === "accepted") {
      return (
        <Button onClick={() => onUpdate("in_progress")} className="bg-gg-cyan text-gg-ink hover:bg-gg-cyan/90 rounded-gg-md font-medium">
          Mark as in progress
        </Button>
      );
    }
    if (status === "in_progress") {
      return (
        <Button onClick={() => onUpdate("completed")} className="bg-gg-success text-gg-ink hover:bg-gg-success/90 rounded-gg-md font-medium">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as delivered
        </Button>
      );
    }
  }

  if (perspective === "sponsor") {
    if (status === "pending") {
      return (
        <Button variant="outline" onClick={() => onUpdate("cancelled")} className="bg-transparent border-gg-line-2 text-gg-text-2 hover:bg-gg-ink-3 hover:text-gg-text rounded-gg-md">
          Cancel request
        </Button>
      );
    }
    if (status === "in_progress") {
      return (
        <Button onClick={() => onUpdate("completed")} className="bg-gg-success text-gg-ink hover:bg-gg-success/90 rounded-gg-md font-medium">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Confirm complete
        </Button>
      );
    }
  }

  return null;
}

function StatusStepper({ status }: { status: BookingStatus }) {
  const steps: { key: BookingStatus; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "in_progress", label: "In progress" },
    { key: "completed", label: "Completed" },
  ];

  const order = ["pending", "accepted", "in_progress", "completed"];
  const currentIdx = status === "declined" || status === "cancelled" ? -1 : order.indexOf(status);

  if (status === "declined" || status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-gg-sm text-gg-text-3">
        <span className="inline-block w-2 h-2 rounded-full bg-gg-text-3" />
        This request was {status}.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-3 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-1 md:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  isCurrent ? "bg-gg-magenta border-gg-magenta" : isDone ? "bg-gg-cyan border-gg-cyan" : "bg-gg-ink border-gg-line"
                }`}
              >
                {isDone && <Check className="h-3 w-3 text-gg-ink" />}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-gg-ink" />}
              </div>
              <span
                className={`font-mono text-[10px] uppercase tracking-gg-wider whitespace-nowrap ${
                  isCurrent ? "text-gg-magenta" : isDone ? "text-gg-cyan" : "text-gg-text-3"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`h-px w-4 md:w-8 ${isDone ? "bg-gg-cyan" : "bg-gg-line"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: boolean; }) {
  return (
    <div className="px-6 py-5">
      <div className="eyebrow mb-1.5">{label}</div>
      <div className={`font-display text-gg-lg font-medium tracking-gg-tight tabular-nums ${accent ? "text-gg-cyan" : "text-gg-text"}`}>
        {value}
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean; }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-gg-md px-3.5 py-2.5 text-gg-sm leading-snug ${
          isMine ? "bg-gg-cyan text-gg-ink" : "bg-gg-ink border border-gg-line text-gg-text"
        }`}
      >
        <div className="whitespace-pre-line">{message.body}</div>
        <div className={`font-mono text-[9px] uppercase tracking-gg-wider mt-1 ${isMine ? "text-gg-ink/60" : "text-gg-text-3"}`}>
          {new Date(message.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function timeAgoString(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
