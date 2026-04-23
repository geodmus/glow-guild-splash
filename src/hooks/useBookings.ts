// src/hooks/useBookings.ts — REPLACES the previous version
// Fix: creators.id and sponsors.id ARE the auth user id. No separate user_id column.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "cancelled";

export type BookingRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  status: BookingStatus;
  campaign_title: string;
  campaign_brief: string;
  deliverable: string;
  budget_offer_usd: number;
  timeline_start: string | null;
  timeline_end: string | null;
  sponsor_id: string;
  creator_id: string;

  // Joined counterparty fields
  creator_display_name: string | null;
  creator_slug: string | null;
  creator_avatar_url: string | null;
  sponsor_company_name: string | null;
  sponsor_logo_url: string | null;
};

type Role = "creator" | "sponsor";

type UseBookingsResult = {
  bookings: BookingRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, nextStatus: BookingStatus) => Promise<boolean>;
};

export function useBookings(role: Role): UseBookingsResult {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setError("Not signed in.");
        setBookings([]);
        setLoading(false);
        return;
      }

      const uid = authData.user.id;

      // Check that the caller has completed their role-specific profile.
      // creators.id and sponsors.id are both the auth user id per schema.
      const roleTable = role === "creator" ? "creators" : "sponsors";
      const { data: roleRow } = await supabase
        .from(roleTable)
        .select("id")
        .eq("id", uid)
        .maybeSingle();

      if (!roleRow) {
        setError(
          role === "creator"
            ? "Complete your creator profile first."
            : "Complete your sponsor profile first."
        );
        setBookings([]);
        setLoading(false);
        return;
      }

      const filterColumn = role === "creator" ? "creator_id" : "sponsor_id";

      const { data, error: fetchError } = await supabase
        .from("booking_requests")
        .select(
          `
            id,
            created_at,
            updated_at,
            status,
            campaign_title,
            campaign_brief,
            deliverable,
            budget_offer_usd,
            timeline_start,
            timeline_end,
            sponsor_id,
            creator_id,
            creators:creator_id (display_name, profile_slug, avatar_url),
            sponsors:sponsor_id (company_name, logo_url)
          `
        )
        .eq(filterColumn, uid)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setBookings([]);
        setLoading(false);
        return;
      }

      const normalized: BookingRecord[] = (data ?? []).map((row: any) => ({
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
      }));

      setBookings(normalized);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = useCallback(
    async (id: string, nextStatus: BookingStatus) => {
      const updates: Record<string, any> = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };
      if (nextStatus === "accepted") updates.accepted_at = new Date().toISOString();
      if (nextStatus === "completed") updates.completed_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("booking_requests")
        .update(updates)
        .eq("id", id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b))
      );
      return true;
    },
    []
  );

  return { bookings, loading, error, refetch: fetchBookings, updateStatus };
}
