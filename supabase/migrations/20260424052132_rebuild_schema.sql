-- =============================================================================
-- Glow Guild — Full Schema Rebuild
-- Migration: 20260424052132_rebuild_schema.sql
--
-- Purpose: Drop the legacy Lovable-era schema and rebuild to match the
--          current codebase architecture. Safe to run because all tables
--          have 0 rows.
--
-- DO NOT RUN THIS AUTOMATICALLY. Review first, then execute manually
-- in the Supabase SQL Editor.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Remove tables from Realtime publication (must happen before DROP)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.booking_requests;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. DROP existing tables (order respects FK dependencies)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.messages       CASCADE;
DROP TABLE IF EXISTS public.booking_requests CASCADE;
DROP TABLE IF EXISTS public.creators       CASCADE;
DROP TABLE IF EXISTS public.sponsors       CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. DROP existing enums
-- ─────────────────────────────────────────────────────────────────────────────

DROP TYPE IF EXISTS public.booking_status   CASCADE;
DROP TYPE IF EXISTS public.deliverable_type CASCADE;
DROP TYPE IF EXISTS public.social_platform  CASCADE;
DROP TYPE IF EXISTS public.user_role        CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CREATE enums
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE public.user_role AS ENUM ('creator', 'sponsor', 'admin');

CREATE TYPE public.booking_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'in_progress',
  'completed',
  'cancelled'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CREATE tables
-- ─────────────────────────────────────────────────────────────────────────────

-- 4a. profiles — one row per auth user, auto-created by trigger
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.user_role,
  email      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4b. creators — id = auth.uid(), references profiles
CREATE TABLE public.creators (
  id                   uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name         text,
  profile_slug         text UNIQUE,
  tagline              text,
  bio                  text,
  avatar_url           text,
  location_city        text,
  location_region      text,
  location_country     text,
  niche_tags           text[]   DEFAULT '{}',
  primary_platforms    text[]   DEFAULT '{}',
  follower_count_total integer  DEFAULT 0,
  rate_min_usd         integer,
  rate_max_usd         integer,
  portfolio_urls       text[]   DEFAULT '{}',
  is_available         boolean  NOT NULL DEFAULT true,
  is_verified          boolean  NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- 4c. sponsors — id = auth.uid(), references profiles
CREATE TABLE public.sponsors (
  id                       uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name             text NOT NULL,
  website_url              text,
  industry                 text,
  description              text,
  logo_url                 text,
  budget_typical_min_usd   integer,
  budget_typical_max_usd   integer,
  is_verified              boolean NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- 4d. booking_requests
CREATE TABLE public.booking_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id       uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  creator_id       uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  status           public.booking_status NOT NULL DEFAULT 'pending',
  campaign_title   text,
  campaign_brief   text,
  deliverable      text,
  budget_offer_usd integer,
  timeline_start   date,
  timeline_end     date,
  accepted_at      timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 4e. messages
CREATE TABLE public.messages (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  sender_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body               text NOT NULL,
  read_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ENABLE Row Level Security on all tables
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages         ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RLS Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- 6a. profiles: user can read and update their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6b. creators: PUBLIC can SELECT (for /discover and /c/[slug] to work
--     for logged-out visitors); user can INSERT/UPDATE their own row
CREATE POLICY "Anyone can view creator profiles"
  ON public.creators FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert own profile"
  ON public.creators FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Creators can update own profile"
  ON public.creators FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6c. sponsors: user can SELECT/INSERT/UPDATE their own row
CREATE POLICY "Sponsors can view own profile"
  ON public.sponsors FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Sponsors can insert own profile"
  ON public.sponsors FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Sponsors can update own profile"
  ON public.sponsors FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6d. booking_requests:
--     - Sponsors can INSERT where sponsor_id = auth.uid()
--     - Both participants can SELECT their own bookings
--     - Both participants can UPDATE status
CREATE POLICY "Sponsors can create booking requests"
  ON public.booking_requests FOR INSERT
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Participants can view own bookings"
  ON public.booking_requests FOR SELECT
  USING (
    auth.uid() = sponsor_id
    OR auth.uid() = creator_id
  );

CREATE POLICY "Participants can update own bookings"
  ON public.booking_requests FOR UPDATE
  USING (
    auth.uid() = sponsor_id
    OR auth.uid() = creator_id
  )
  WITH CHECK (
    auth.uid() = sponsor_id
    OR auth.uid() = creator_id
  );

-- 6e. messages: participants on the parent booking can SELECT and INSERT
CREATE POLICY "Booking participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.id = messages.booking_request_id
        AND (auth.uid() = br.sponsor_id OR auth.uid() = br.creator_id)
    )
  );

CREATE POLICY "Booking participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.id = messages.booking_request_id
        AND (auth.uid() = br.sponsor_id OR auth.uid() = br.creator_id)
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Realtime — add messages and booking_requests to publication
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Auto-create profiles row on auth.users INSERT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Updated_at auto-touch trigger (reusable)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
