// src/components/BookingRequestDialog.tsx

import { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronDown, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Creator } from "@/components/CreatorCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliverableType = "post" | "reel" | "story" | "video" | "thread" | "other";

interface BookingFormState {
  deliverable_type: DeliverableType | "";
  budget_offer: string;
  timeline: string;
  campaign_brief: string;
}

const DELIVERABLE_OPTIONS: { value: DeliverableType; label: string; description: string }[] = [
  { value: "post",   label: "Post",   description: "Static image or carousel" },
  { value: "reel",   label: "Reel",   description: "Short-form vertical video" },
  { value: "story",  label: "Story",  description: "24-hour ephemeral content" },
  { value: "video",  label: "Video",  description: "Long-form YouTube or TikTok" },
  { value: "thread", label: "Thread", description: "Multi-post written thread" },
  { value: "other",  label: "Other",  description: "Describe in the brief" },
];

const TIMELINE_OPTIONS = [
  "Within 1 week",
  "1–2 weeks",
  "2–4 weeks",
  "1–2 months",
  "Flexible",
];

// ─── Field components ─────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block uppercase text-[#6b6b74] font-medium tracking-widest"
      style={{ fontSize: "10px", letterSpacing: "0.1em" }}
    >
      {children}
      {required && (
        <span className="text-[#cc2d8f] ml-1" aria-hidden="true">*</span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[#ff5a5a] mt-1" style={{ fontSize: "11px" }} role="alert">
      {message}
    </p>
  );
}

// ─── Select dropdown ──────────────────────────────────────────────────────────

function SelectField({
  id,
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-full h-11 flex items-center justify-between px-3 rounded-[4px] border",
          "bg-[#121214] text-sm transition-colors duration-[120ms]",
          error
            ? "border-[#ff5a5a] focus-visible:outline-[#ff5a5a]"
            : open
            ? "border-[#00c8d4]"
            : "border-[#2a2a2f] hover:border-[#3a3a42]",
          selected ? "text-[#f4f4f5]" : "text-[#6b6b74]",
          "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-0",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label ?? placeholder}
        <ChevronDown
          size={14}
          className={[
            "text-[#6b6b74] transition-transform duration-[120ms]",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1a1a1d] border border-[#2a2a2f]
            rounded-[4px] overflow-hidden shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)]"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={[
                "flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer",
                "transition-colors duration-[100ms]",
                value === opt.value
                  ? "text-[#00c8d4] bg-[#00c8d4]/5"
                  : "text-[#a8a8b0] hover:text-[#f4f4f5] hover:bg-[#242428]",
              ].join(" ")}
            >
              {opt.label}
              {value === opt.value && <Check size={13} className="text-[#00c8d4]" />}
            </li>
          ))}
        </ul>
      )}
      <FieldError message={error} />
    </div>
  );
}

// ─── Deliverable picker ───────────────────────────────────────────────────────

function DeliverablePicker({
  value,
  onChange,
  error,
}: {
  value: DeliverableType | "";
  onChange: (v: DeliverableType) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
        {DELIVERABLE_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "flex flex-col gap-0.5 p-3 rounded-[4px] border text-left",
                "transition-all duration-[120ms]",
                active
                  ? "border-[#00c8d4] bg-[#00c8d4]/5 text-[#00c8d4]"
                  : "border-[#2a2a2f] bg-[#121214] text-[#a8a8b0] hover:border-[#3a3a42] hover:text-[#f4f4f5]",
                "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
              ].join(" ")}
              aria-pressed={active}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span
                className={active ? "text-[#00c8d4]/70" : "text-[#6b6b74]"}
                style={{ fontSize: "11px" }}
              >
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessView({
  creatorName,
  onClose,
}: {
  creatorName: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-full border border-[#3ad29f]"
        style={{ boxShadow: "0 0 20px -4px rgba(58,210,159,0.4)" }}
      >
        <Check size={22} className="text-[#3ad29f]" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[#f4f4f5] text-lg font-semibold">
          Sent to {creatorName}.
        </p>
        <p className="text-[#6b6b74] text-sm max-w-xs">
          They'll respond within 48 hours. Check your dashboard for updates.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-2 px-6 py-2.5 bg-[#00c8d4] text-[#0a0a0b] text-sm font-semibold rounded-[4px]
          hover:brightness-110 transition-all duration-[120ms] active:translate-y-px active:brightness-90
          focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
      >
        Done
      </button>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface BookingRequestDialogProps {
  creator: Creator;
  open: boolean;
  onClose: () => void;
}

export function BookingRequestDialog({
  creator,
  open,
  onClose,
}: BookingRequestDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<BookingFormState>({
    deliverable_type: "",
    budget_offer: "",
    timeline: "",
    campaign_brief: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ── Focus trap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    firstFocusRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // ── Reset on open ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setForm({ deliverable_type: "", budget_offer: "", timeline: "", campaign_brief: "" });
      setErrors({});
      setSubmitted(false);
      setServerError(null);
    }
  }, [open]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.deliverable_type) next.deliverable_type = "Select a deliverable type.";
    if (!form.budget_offer.trim()) {
      next.budget_offer = "Enter a budget offer.";
    } else if (isNaN(Number(form.budget_offer.replace(/[$,]/g, "")))) {
      next.budget_offer = "Enter a valid number.";
    }
    if (!form.timeline) next.timeline = "Select a timeline.";
    if (!form.campaign_brief.trim()) {
      next.campaign_brief = "Add a campaign brief.";
    } else if (form.campaign_brief.trim().length < 20) {
      next.campaign_brief = "Brief must be at least 20 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to send a booking request.");

      const budgetNum = Number(form.budget_offer.replace(/[$,]/g, ""));

      const { error } = await supabase.from("booking_requests").insert({
        creator_id: creator.id,
        sponsor_id: user.id,
        deliverable_type: form.deliverable_type,
        budget_offer: budgetNum,
        timeline: form.timeline,
        campaign_brief: form.campaign_brief.trim(),
        status: "pending",
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setServerError(err?.message ?? "Didn't send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Request booking with ${creator.display_name}`}
        ref={dialogRef}
        className="fixed z-50 inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        <div
          className="relative w-full sm:max-w-lg bg-[#1a1a1d] border border-[#2a2a2f]
            rounded-t-[10px] sm:rounded-[6px] overflow-hidden
            shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9)]
            max-h-[92dvh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-[#2a2a2f] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span
                className="uppercase text-[#6b6b74] font-medium tracking-widest"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                Booking request
              </span>
              <h2 className="text-[#f4f4f5] text-lg font-bold leading-tight tracking-tight">
                {creator.display_name}
              </h2>
              <span className="text-[#6b6b74] text-sm">@{creator.handle}</span>
            </div>
            <button
              ref={firstFocusRef}
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-[#2a2a2f]
                text-[#6b6b74] hover:text-[#f4f4f5] hover:border-[#3a3a42]
                transition-all duration-[120ms]
                focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2"
              aria-label="Close dialog"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-6">
            {submitted ? (
              <SuccessView
                creatorName={creator.display_name}
                onClose={onClose}
              />
            ) : (
              <div className="flex flex-col gap-6">

                {/* Deliverable type */}
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="deliverable_type" required>
                    Deliverable type
                  </FieldLabel>
                  <DeliverablePicker
                    value={form.deliverable_type}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, deliverable_type: v }));
                      setErrors((e) => ({ ...e, deliverable_type: undefined }));
                    }}
                    error={errors.deliverable_type}
                  />
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="budget_offer" required>
                    Budget offer (USD)
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b74] text-sm pointer-events-none">
                      $
                    </span>
                    <input
                      id="budget_offer"
                      type="text"
                      inputMode="numeric"
                      placeholder="500"
                      value={form.budget_offer}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, budget_offer: e.target.value }));
                        setErrors((er) => ({ ...er, budget_offer: undefined }));
                      }}
                      className={[
                        "w-full h-11 pl-7 pr-3 bg-[#121214] border rounded-[4px]",
                        "text-[#f4f4f5] text-sm placeholder:text-[#6b6b74]",
                        "transition-colors duration-[120ms]",
                        errors.budget_offer
                          ? "border-[#ff5a5a] focus-visible:outline-[#ff5a5a]"
                          : "border-[#2a2a2f] focus-visible:border-[#00c8d4]",
                        "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-0",
                      ].join(" ")}
                    />
                  </div>
                  <FieldError message={errors.budget_offer} />
                  {creator.rate_min && (
                    <p className="text-[#6b6b74]" style={{ fontSize: "11px" }}>
                      This creator's range starts at ${creator.rate_min}.
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="timeline" required>
                    Timeline
                  </FieldLabel>
                  <SelectField
                    id="timeline"
                    value={form.timeline}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, timeline: v }));
                      setErrors((e) => ({ ...e, timeline: undefined }));
                    }}
                    placeholder="Select a timeline"
                    options={TIMELINE_OPTIONS.map((t) => ({ value: t, label: t }))}
                    error={errors.timeline}
                  />
                </div>

                {/* Campaign brief */}
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="campaign_brief" required>
                    Campaign brief
                  </FieldLabel>
                  <textarea
                    id="campaign_brief"
                    rows={5}
                    placeholder="Describe your brand, campaign goals, key messages, and any creative direction. The more context, the better the response."
                    value={form.campaign_brief}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, campaign_brief: e.target.value }));
                      setErrors((er) => ({ ...er, campaign_brief: undefined }));
                    }}
                    className={[
                      "w-full resize-y px-3 py-3 bg-[#121214] border rounded-[4px]",
                      "text-[#f4f4f5] text-sm placeholder:text-[#6b6b74] leading-relaxed",
                      "transition-colors duration-[120ms] min-h-[120px]",
                      errors.campaign_brief
                        ? "border-[#ff5a5a] focus-visible:outline-[#ff5a5a]"
                        : "border-[#2a2a2f] focus-visible:border-[#00c8d4]",
                      "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-0",
                    ].join(" ")}
                  />
                  <div className="flex items-start justify-between">
                    <FieldError message={errors.campaign_brief} />
                    <span
                      className={[
                        "ml-auto font-mono",
                        form.campaign_brief.length < 20 ? "text-[#6b6b74]" : "text-[#3ad29f]",
                      ].join(" ")}
                      style={{ fontSize: "11px" }}
                    >
                      {form.campaign_brief.length} chars
                    </span>
                  </div>
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="px-4 py-3 bg-[#ff5a5a]/8 border border-[#ff5a5a]/30 rounded-[4px]">
                    <p className="text-[#ff5a5a] text-sm">{serverError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="px-6 py-5 border-t border-[#2a2a2f] shrink-0 flex items-center justify-between gap-4">
              <p className="text-[#6b6b74] text-xs leading-snug max-w-[200px]">
                No payment now. Rate confirmed in the booking thread.
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={[
                  "flex items-center gap-2 px-6 h-11 rounded-[4px]",
                  "bg-[#00c8d4] text-[#0a0a0b] text-sm font-semibold shrink-0",
                  "transition-all duration-[120ms]",
                  "hover:brightness-110 active:translate-y-px active:brightness-90",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0",
                  "focus-visible:outline-2 focus-visible:outline-[#00c8d4] focus-visible:outline-offset-2",
                ].join(" ")}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Calendar size={14} />
                    Send request
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BookingRequestDialog;
