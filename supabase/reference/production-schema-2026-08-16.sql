-- ============================================================================
-- VOYOME PRODUCTION SCHEMA REFERENCE — READ-ONLY EVIDENCE SNAPSHOT
-- ============================================================================
-- Captured: 2026-08-16, as part of D7 (schema/RLS visibility audit).
--
-- THIS IS NOT A MIGRATION. Do not run this file against any database.
-- It is a point-in-time, read-only reference of what is ACTUALLY deployed
-- to the production Supabase project (ref: czxtgoxfcqplddxknmjg / "GoVoyage"),
-- captured via targeted read-only SQL introspection (information_schema /
-- pg_catalog / pg_policies) through `supabase db query --linked`, because
-- `supabase db dump` could not run in this environment (no Docker).
--
-- Scope: public schema (tables, columns, constraints, RLS policies,
-- SECURITY DEFINER functions, grants) + storage.objects policies and
-- storage.buckets config relevant to the journal-images bucket (for D2).
-- No table data, no user records, no auth.users content, no secrets were
-- captured or are present in this file.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES + ROW LEVEL SECURITY STATUS (public schema)
-- ----------------------------------------------------------------------------
-- bookings                     rls_enabled=true  rls_forced=false
-- expense_participants         rls_enabled=true  rls_forced=false
-- expenses                     rls_enabled=true  rls_forced=false
-- journal_entries              rls_enabled=true  rls_forced=false
-- packing_items                rls_enabled=true  rls_forced=false
-- packing_list_items           rls_enabled=true  rls_forced=false
-- packing_lists                rls_enabled=true  rls_forced=false
-- packing_profiles             rls_enabled=true  rls_forced=false
-- personal_packing_items       rls_enabled=true  rls_forced=false
-- profiles                     rls_enabled=true  rls_forced=false
-- trip_activity_log            rls_enabled=true  rls_forced=false
-- trip_collaborators           rls_enabled=true  rls_forced=false
-- trip_invites                 rls_enabled=true  rls_forced=false
-- trip_members                 rls_enabled=true  rls_forced=false
-- trip_ownership_transfers     rls_enabled=true  rls_forced=false
-- trips                        rls_enabled=true  rls_forced=false

-- ----------------------------------------------------------------------------
-- 2. COLUMNS PER TABLE
-- ----------------------------------------------------------------------------
--
-- TABLE: bookings
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   type                       text                         NOT NULL
--   title                      text                         NOT NULL
--   start_time                 timestamp without time zone  NOT NULL
--   end_time                   timestamp without time zone  nullable
--   location                   text                         nullable
--   confirmation_code          text                         nullable
--   notes                      text                         nullable
--   airline                    text                         nullable
--   flight_number              text                         nullable
--   departure_airport          text                         nullable
--   arrival_airport            text                         nullable
--   hotel_name                 text                         nullable
--   address                    text                         nullable
--   origin                     text                         nullable
--   destination                text                         nullable
--   created_at                 timestamp with time zone     NOT NULL default now()
--   updated_at                 timestamp with time zone     NOT NULL default now()
--   updated_by                 uuid                         nullable
--   deleted_at                 timestamp with time zone     nullable
--   deleted_by                 uuid                         nullable
--
-- TABLE: expense_participants
--   id                         bigint                       NOT NULL
--   expense_id                 bigint                       NOT NULL
--   member_id                  bigint                       NOT NULL
--   created_at                 timestamp with time zone     nullable default now()
--
-- TABLE: expenses
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   title                      text                         NOT NULL
--   amount                     numeric                      NOT NULL
--   currency                   text                         NOT NULL
--   expense_date               date                         NOT NULL
--   paid_by_member_id          bigint                       NOT NULL
--   created_at                 timestamp with time zone     nullable default now()
--
-- TABLE: journal_entries
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   created_by                 uuid                         NOT NULL default auth.uid()
--   title                      text                         NOT NULL
--   body                       text                         NOT NULL
--   mood                       text                         nullable
--   image_url                  text                         nullable
--   visibility                 text                         NOT NULL default 'private'::text
--   created_at                 timestamp with time zone     NOT NULL default now()
--   updated_at                 timestamp with time zone     NOT NULL default now()
--   image_position_y           integer                      nullable default 50
--
-- TABLE: packing_items
--   id                         uuid                         NOT NULL default gen_random_uuid()
--   packing_profile_id         uuid                         NOT NULL
--   item_key                   text                         NOT NULL
--   template_key               text                         nullable
--   name                       text                         NOT NULL
--   category                   text                         NOT NULL
--   quantity                   integer                      NOT NULL default 1
--   packed                     boolean                      NOT NULL default false
--   hidden                     boolean                      NOT NULL default false
--   protected                  boolean                      NOT NULL default false
--   source                     text                         NOT NULL
--   packed_by                  uuid                         nullable
--   assigned_to_user_id        uuid                         nullable
--   assigned_to_member_id      bigint                       nullable
--   created_by                 uuid                         nullable
--   updated_by                 uuid                         nullable
--   created_at                 timestamp with time zone     nullable default now()
--   updated_at                 timestamp with time zone     nullable default now()
--
-- TABLE: packing_list_items
--   id                         uuid                         NOT NULL default gen_random_uuid()
--   packing_list_id            uuid                         NOT NULL
--   name                       text                         NOT NULL
--   category                   text                         NOT NULL
--   quantity                   integer                      NOT NULL default 1
--   packed                     boolean                      NOT NULL default false
--   packed_at                  timestamp with time zone     nullable
--   packed_by                  uuid                         nullable
--   responsible_member_id      bigint                       nullable
--   source                     text                         NOT NULL default 'custom'::text
--   notes                      text                         nullable
--   protected                  boolean                      NOT NULL default false
--   hidden                     boolean                      NOT NULL default false
--   sort_order                 integer                      NOT NULL default 0
--   added_by                   uuid                         nullable
--   created_at                 timestamp with time zone     NOT NULL default now()
--   updated_at                 timestamp with time zone     NOT NULL default now()
--
-- TABLE: packing_lists
--   id                         uuid                         NOT NULL default gen_random_uuid()
--   trip_id                    bigint                       NOT NULL
--   member_id                  bigint                       nullable
--   title                      text                         NOT NULL
--   type                       text                         NOT NULL
--   emoji                      text                         nullable
--   color                      text                         nullable
--   created_by                 uuid                         nullable
--   archived                   boolean                      NOT NULL default false
--   sort_order                 integer                      NOT NULL default 0
--   created_at                 timestamp with time zone     NOT NULL default now()
--   updated_at                 timestamp with time zone     NOT NULL default now()
--   kids_age_group             text                         nullable
--
-- TABLE: packing_profiles
--   id                         uuid                         NOT NULL default gen_random_uuid()
--   trip_id                    bigint                       NOT NULL
--   member_id                  bigint                       nullable
--   owner_user_id              uuid                         nullable
--   created_by                 uuid                         nullable
--   name                       text                         NOT NULL
--   type                       text                         NOT NULL
--   visibility                 text                         NOT NULL default 'private'::text
--   selected_climates          ARRAY                        nullable default '{}'::text[]
--   selected_environments      ARRAY                        nullable default '{}'::text[]
--   selected_trip_styles       ARRAY                        nullable default '{}'::text[]
--   archived                   boolean                      nullable default false
--   created_at                 timestamp with time zone     nullable default now()
--   updated_at                 timestamp with time zone     nullable default now()
--
-- TABLE: personal_packing_items
--   id                         uuid                         NOT NULL default gen_random_uuid()
--   user_id                    uuid                         NOT NULL
--   name                       text                         NOT NULL
--   category                   text                         NOT NULL
--   quantity                   integer                      NOT NULL default 1
--   created_at                 timestamp with time zone     NOT NULL default now()
--
-- TABLE: profiles
--   user_id                    uuid                         NOT NULL
--   display_name               text                         NOT NULL
--   created_at                 timestamp with time zone     NOT NULL default now()
--   email                      text                         nullable
--
-- TABLE: trip_activity_log
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   actor_user_id              uuid                         nullable
--   event_type                 text                         NOT NULL
--   target_type                text                         nullable
--   target_id                  bigint                       nullable
--   metadata                   jsonb                        NOT NULL default '{}'::jsonb
--   created_at                 timestamp with time zone     NOT NULL default now()
--
-- TABLE: trip_collaborators
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   user_id                    uuid                         NOT NULL
--   role                       text                         NOT NULL default 'editor'::text
--   created_at                 timestamp with time zone     nullable default now()
--   active                     boolean                      NOT NULL default true
--   removed_at                 timestamp with time zone     nullable
--
-- TABLE: trip_invites
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   email                      text                         NOT NULL
--   role                       text                         NOT NULL default 'editor'::text
--   accepted_at                timestamp with time zone     nullable
--   created_at                 timestamp with time zone     nullable default now()
--   name                       text                         nullable
--   status                     text                         NOT NULL default 'pending'::text
--   inviter_user_id            uuid                         nullable
--   inviter_name               text                         nullable
--
-- TABLE: trip_members
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   name                       text                         NOT NULL
--   created_at                 timestamp with time zone     nullable default now()
--   user_id                    uuid                         nullable
--   active                     boolean                      NOT NULL default true
--   archived_at                timestamp with time zone     nullable
--
-- TABLE: trip_ownership_transfers
--   id                         bigint                       NOT NULL
--   trip_id                    bigint                       NOT NULL
--   previous_owner_user_id     uuid                         NOT NULL
--   new_owner_user_id          uuid                         NOT NULL
--   actor_user_id              uuid                         NOT NULL
--   reason                     text                         nullable
--   created_at                 timestamp with time zone     NOT NULL default now()
--
-- TABLE: trips
--   id                         bigint                       NOT NULL
--   title                      text                         NOT NULL
--   destination                text                         NOT NULL
--   start_date                 date                         NOT NULL
--   end_date                   date                         NOT NULL
--   image_url                  text                         nullable
--   currencies                 ARRAY                        nullable default ARRAY['NOK'::text, 'EUR'::text, 'USD'::text]
--   user_id                    uuid                         NOT NULL

-- ----------------------------------------------------------------------------
-- 3. CONSTRAINTS (PRIMARY KEY / FOREIGN KEY / UNIQUE / CHECK)
-- ----------------------------------------------------------------------------
-- NOT NULL checks (named 2200_..._not_null) are Postgres-generated and
-- omitted below for brevity; only named/business constraints are listed.
--
-- TABLE: bookings
--   [CHECK      ] bookings_valid_time_range
--   [CHECK      ] bookings_type_check
--   [FOREIGN KEY] bookings_trip_id_fkey (trip_id) -> trips.id
--   [FOREIGN KEY] bookings_updated_by_fkey (updated_by)
--   [FOREIGN KEY] bookings_deleted_by_fkey (deleted_by)
--   [PRIMARY KEY] bookings_pkey (id)
--
-- TABLE: expense_participants
--   [FOREIGN KEY] expense_participants_member_id_fkey (member_id) -> trip_members.id
--   [FOREIGN KEY] expense_participants_expense_id_fkey (expense_id) -> expenses.id
--   [PRIMARY KEY] expense_participants_pkey (id)
--   [UNIQUE     ] expense_participants_expense_id_member_id_key (expense_id)
--   [UNIQUE     ] expense_participants_expense_id_member_id_key (member_id)
--
-- TABLE: expenses
--   [CHECK      ] expenses_amount_positive
--   [CHECK      ] expenses_currency_not_empty
--   [CHECK      ] expenses_title_not_empty
--   [FOREIGN KEY] expenses_trip_id_fkey (trip_id) -> trips.id
--   [FOREIGN KEY] expenses_paid_by_member_id_fkey (paid_by_member_id) -> trip_members.id
--   [PRIMARY KEY] expenses_pkey (id)
--
-- TABLE: journal_entries
--   [CHECK      ] journal_entries_visibility_check
--   [FOREIGN KEY] journal_entries_trip_id_fkey (trip_id) -> trips.id
--   [PRIMARY KEY] journal_entries_pkey (id)
--
-- TABLE: packing_items
--   [CHECK      ] packing_items_source_check
--   [FOREIGN KEY] packing_items_assigned_to_member_id_fkey (assigned_to_member_id) -> trip_members.id
--   [FOREIGN KEY] packing_items_packing_profile_id_fkey (packing_profile_id) -> packing_profiles.id
--   [PRIMARY KEY] packing_items_pkey (id)
--
-- TABLE: packing_list_items
--   [CHECK      ] packing_list_items_source_check
--   [FOREIGN KEY] packing_list_items_packed_by_fkey (packed_by)
--   [FOREIGN KEY] packing_list_items_packing_list_id_fkey (packing_list_id) -> packing_lists.id
--   [FOREIGN KEY] packing_list_items_responsible_member_id_fkey (responsible_member_id) -> trip_members.id
--   [FOREIGN KEY] packing_list_items_added_by_fkey (added_by)
--   [PRIMARY KEY] packing_list_items_pkey (id)
--
-- TABLE: packing_lists
--   [CHECK      ] packing_lists_type_check
--   [CHECK      ] packing_lists_kids_age_group_check
--   [FOREIGN KEY] packing_lists_member_id_fkey (member_id) -> trip_members.id
--   [FOREIGN KEY] packing_lists_created_by_fkey (created_by)
--   [FOREIGN KEY] packing_lists_trip_id_fkey (trip_id) -> trips.id
--   [PRIMARY KEY] packing_lists_pkey (id)
--
-- TABLE: packing_profiles
--   [CHECK      ] packing_profiles_visibility_check
--   [CHECK      ] packing_profiles_type_check
--   [FOREIGN KEY] packing_profiles_member_id_fkey (member_id) -> trip_members.id
--   [FOREIGN KEY] packing_profiles_trip_id_fkey (trip_id) -> trips.id
--   [PRIMARY KEY] packing_profiles_pkey (id)
--
-- TABLE: personal_packing_items
--   [PRIMARY KEY] personal_packing_items_pkey (id)
--   [UNIQUE     ] personal_packing_items_unique_item (name)
--   [UNIQUE     ] personal_packing_items_unique_item (category)
--   [UNIQUE     ] personal_packing_items_unique_item (user_id)
--
-- TABLE: profiles
--   [FOREIGN KEY] profiles_user_id_fkey (user_id)
--   [PRIMARY KEY] profiles_pkey (user_id)
--
-- TABLE: trip_activity_log
--   [FOREIGN KEY] trip_activity_log_actor_user_id_fkey (actor_user_id)
--   [FOREIGN KEY] trip_activity_log_trip_id_fkey (trip_id) -> trips.id
--   [PRIMARY KEY] trip_activity_log_pkey (id)
--
-- TABLE: trip_collaborators
--   [CHECK      ] trip_collaborators_role_check
--   [FOREIGN KEY] trip_collaborators_user_id_fkey (user_id)
--   [FOREIGN KEY] trip_collaborators_trip_id_fkey (trip_id) -> trips.id
--   [PRIMARY KEY] trip_collaborators_pkey (id)
--   [UNIQUE     ] trip_collaborators_trip_id_user_id_key (user_id)
--   [UNIQUE     ] trip_collaborators_trip_id_user_id_key (trip_id)
--
-- TABLE: trip_invites
--   [CHECK      ] trip_invites_role_check
--   [CHECK      ] trip_invites_status_check
--   [FOREIGN KEY] trip_invites_inviter_user_id_fkey (inviter_user_id)
--   [FOREIGN KEY] trip_invites_trip_id_fkey (trip_id) -> trips.id
--   [PRIMARY KEY] trip_invites_pkey (id)
--
-- TABLE: trip_members
--   [FOREIGN KEY] trip_members_trip_id_fkey (trip_id) -> trips.id
--   [FOREIGN KEY] trip_members_user_id_fkey (user_id)
--   [PRIMARY KEY] trip_members_pkey (id)
--
-- TABLE: trip_ownership_transfers
--   [FOREIGN KEY] trip_ownership_transfers_new_owner_user_id_fkey (new_owner_user_id)
--   [FOREIGN KEY] trip_ownership_transfers_previous_owner_user_id_fkey (previous_owner_user_id)
--   [FOREIGN KEY] trip_ownership_transfers_trip_id_fkey (trip_id) -> trips.id
--   [FOREIGN KEY] trip_ownership_transfers_actor_user_id_fkey (actor_user_id)
--   [PRIMARY KEY] trip_ownership_transfers_pkey (id)
--
-- TABLE: trips
--   [CHECK      ] valid_date_range
--   [FOREIGN KEY] trips_user_id_fkey (user_id)
--   [PRIMARY KEY] trips_pkey (id)

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY POLICIES — public schema
-- ----------------------------------------------------------------------------
--
-- TABLE: bookings
--   POLICY "Trip collaborators can add bookings" [INSERT] roles={authenticated}
--     WITH CHECK: user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can delete bookings" [DELETE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can read bookings" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can update bookings" [UPDATE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--     WITH CHECK: user_can_access_trip(trip_id)
--
-- TABLE: expense_participants
--   POLICY "Trip collaborators can add expense participants" [INSERT] roles={authenticated}
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM expenses
  WHERE ((expenses.id = expense_participants.expense_id) AND user_can_access_trip(expenses.trip_id))))
--   POLICY "Trip collaborators can delete expense participants" [DELETE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM expenses
  WHERE ((expenses.id = expense_participants.expense_id) AND user_can_access_trip(expenses.trip_id))))
--   POLICY "Trip collaborators can read expense participants" [SELECT] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM expenses
  WHERE ((expenses.id = expense_participants.expense_id) AND user_can_access_trip(expenses.trip_id))))
--   POLICY "Trip collaborators can update expense participants" [UPDATE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM expenses
  WHERE ((expenses.id = expense_participants.expense_id) AND user_can_access_trip(expenses.trip_id))))
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM expenses
  WHERE ((expenses.id = expense_participants.expense_id) AND user_can_access_trip(expenses.trip_id))))
--
-- TABLE: expenses
--   POLICY "Trip collaborators can add expenses" [INSERT] roles={authenticated}
--     WITH CHECK: user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can delete expenses" [DELETE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can read expenses" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can update expenses" [UPDATE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--     WITH CHECK: user_can_access_trip(trip_id)
--
-- TABLE: journal_entries
--   POLICY "Journal entries can be created by trip users" [INSERT] roles={public}
--     WITH CHECK: ((created_by = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = journal_entries.trip_id) AND (trips.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM trip_collaborators
  WHERE ((trip_collaborators.trip_id = journal_entries.trip_id) AND (trip_collaborators.user_id = auth.uid()))))))
--   POLICY "Journal entries can be deleted by creator" [DELETE] roles={public}
--     USING:      (created_by = auth.uid())
--   POLICY "Journal entries can be updated by creator" [UPDATE] roles={public}
--     USING:      (created_by = auth.uid())
--     WITH CHECK: (created_by = auth.uid())
--   POLICY "Journal entries can be viewed by allowed users" [SELECT] roles={public}
--     USING:      ((created_by = auth.uid()) OR ((visibility = 'trip'::text) AND (EXISTS ( SELECT 1
   FROM trip_collaborators
  WHERE ((trip_collaborators.trip_id = journal_entries.trip_id) AND (trip_collaborators.user_id = auth.uid()))))))
--
-- TABLE: packing_items
--   POLICY "Users can create packing items for accessible trips" [INSERT] roles={authenticated}
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM packing_profiles profile
  WHERE ((profile.id = packing_items.packing_profile_id) AND user_can_access_trip(profile.trip_id))))
--   POLICY "Users can delete packing items for accessible trips" [DELETE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM packing_profiles profile
  WHERE ((profile.id = packing_items.packing_profile_id) AND user_can_access_trip(profile.trip_id))))
--   POLICY "Users can read packing items for accessible trips" [SELECT] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM packing_profiles profile
  WHERE ((profile.id = packing_items.packing_profile_id) AND user_can_access_trip(profile.trip_id))))
--   POLICY "Users can update packing items for accessible trips" [UPDATE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM packing_profiles profile
  WHERE ((profile.id = packing_items.packing_profile_id) AND user_can_access_trip(profile.trip_id))))
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM packing_profiles profile
  WHERE ((profile.id = packing_items.packing_profile_id) AND user_can_access_trip(profile.trip_id))))
--
-- TABLE: packing_list_items
--   POLICY "Trip users can create packing items" [INSERT] roles={authenticated}
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM packing_lists
  WHERE ((packing_lists.id = packing_list_items.packing_list_id) AND user_can_access_trip(packing_lists.trip_id))))
--   POLICY "Trip users can delete packing items" [DELETE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM packing_lists
  WHERE ((packing_lists.id = packing_list_items.packing_list_id) AND user_can_access_trip(packing_lists.trip_id))))
--   POLICY "Trip users can read packing items" [SELECT] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM packing_lists
  WHERE ((packing_lists.id = packing_list_items.packing_list_id) AND user_can_access_trip(packing_lists.trip_id))))
--   POLICY "Trip users can update packing items" [UPDATE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM packing_lists
  WHERE ((packing_lists.id = packing_list_items.packing_list_id) AND user_can_access_trip(packing_lists.trip_id))))
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM packing_lists
  WHERE ((packing_lists.id = packing_list_items.packing_list_id) AND user_can_access_trip(packing_lists.trip_id))))
--
-- TABLE: packing_lists
--   POLICY "Trip users can create packing lists" [INSERT] roles={authenticated}
--     WITH CHECK: user_can_access_trip(trip_id)
--   POLICY "Trip users can delete packing lists" [DELETE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip users can read packing lists" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip users can update packing lists" [UPDATE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--     WITH CHECK: user_can_access_trip(trip_id)
--
-- TABLE: packing_profiles
--   POLICY "Users can create packing profiles for accessible trips" [INSERT] roles={authenticated}
--     WITH CHECK: (user_can_access_trip(trip_id) AND ((owner_user_id IS NULL) OR (owner_user_id = auth.uid())) AND ((created_by IS NULL) OR (created_by = auth.uid())))
--   POLICY "Users can delete packing profiles for accessible trips" [DELETE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Users can read packing profiles for accessible trips" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Users can update packing profiles for accessible trips" [UPDATE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--     WITH CHECK: user_can_access_trip(trip_id)
--
-- TABLE: personal_packing_items
--   POLICY "Users can delete their own personal packing items" [DELETE] roles={authenticated}
--     USING:      (auth.uid() = user_id)
--   POLICY "Users can insert their own personal packing items" [INSERT] roles={authenticated}
--     WITH CHECK: (auth.uid() = user_id)
--   POLICY "Users can read their own personal packing items" [SELECT] roles={public}
--     USING:      (auth.uid() = user_id)
--   POLICY "Users can update their own personal packing items" [UPDATE] roles={authenticated}
--     USING:      (auth.uid() = user_id)
--     WITH CHECK: (auth.uid() = user_id)
--
-- TABLE: profiles
--   POLICY "Users can insert their own profile" [INSERT] roles={public}
--     WITH CHECK: (auth.uid() = user_id)
--   POLICY "Users can update their own profile" [UPDATE] roles={public}
--     USING:      (auth.uid() = user_id)
--   POLICY "Users can view their own profile" [SELECT] roles={public}
--     USING:      (auth.uid() = user_id)
--
-- TABLE: trip_activity_log
--   POLICY "Users can create activity logs for accessible trips" [INSERT] roles={authenticated}
--     WITH CHECK: (user_can_access_trip(trip_id) AND ((actor_user_id IS NULL) OR (actor_user_id = auth.uid())))
--   POLICY "Users can read activity logs for accessible trips" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--
-- TABLE: trip_collaborators
--   POLICY "Collaborators can remove themselves" [DELETE] roles={authenticated}
--     USING:      (user_id = auth.uid())
--   POLICY "Trip owners can add collaborators" [INSERT] roles={public}
--     WITH CHECK: (EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_collaborators.trip_id) AND (trips.user_id = auth.uid()))))
--   POLICY "Trip owners can remove collaborators" [DELETE] roles={public}
--     USING:      (EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_collaborators.trip_id) AND (trips.user_id = auth.uid()))))
--   POLICY "Users can read collaborators for accessible trips" [SELECT] roles={public}
--     USING:      user_can_access_trip(trip_id)
--
-- TABLE: trip_invites
--   POLICY "Invited users can accept their own invites" [UPDATE] roles={authenticated}
--     USING:      (lower(email) = lower((auth.jwt() ->> 'email'::text)))
--     WITH CHECK: (lower(email) = lower((auth.jwt() ->> 'email'::text)))
--   POLICY "Trip owners and editors can create invites" [INSERT] roles={authenticated}
--     WITH CHECK: ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_invites.trip_id) AND (trips.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM trip_collaborators
  WHERE ((trip_collaborators.trip_id = trip_invites.trip_id) AND (trip_collaborators.user_id = auth.uid()) AND (trip_collaborators.role = 'editor'::text)))))
--   POLICY "Trip owners and editors can update invites" [UPDATE] roles={public}
--     USING:      ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_invites.trip_id) AND (trips.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM trip_collaborators
  WHERE ((trip_collaborators.trip_id = trip_invites.trip_id) AND (trip_collaborators.user_id = auth.uid()) AND (trip_collaborators.role = 'editor'::text)))))
--     WITH CHECK: ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_invites.trip_id) AND (trips.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM trip_collaborators
  WHERE ((trip_collaborators.trip_id = trip_invites.trip_id) AND (trip_collaborators.user_id = auth.uid()) AND (trip_collaborators.role = 'editor'::text)))))
--   POLICY "Trip owners can delete invites" [DELETE] roles={authenticated}
--     USING:      (EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_invites.trip_id) AND (trips.user_id = auth.uid()))))
--   POLICY "Trip owners can read invites" [SELECT] roles={authenticated}
--     USING:      ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_invites.trip_id) AND (trips.user_id = auth.uid())))) OR (lower(email) = lower((auth.jwt() ->> 'email'::text))))
--
-- TABLE: trip_members
--   POLICY "Trip collaborators can add trip members" [INSERT] roles={authenticated}
--     WITH CHECK: user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can delete trip members" [DELETE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can read trip members" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--   POLICY "Trip collaborators can update trip members" [UPDATE] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--     WITH CHECK: user_can_access_trip(trip_id)
--
-- TABLE: trip_ownership_transfers
--   POLICY "Users can read ownership transfers for accessible trips" [SELECT] roles={authenticated}
--     USING:      user_can_access_trip(trip_id)
--
-- TABLE: trips
--   POLICY "Trip collaborators can update trips" [UPDATE] roles={authenticated}
--     USING:      user_can_access_trip(id)
--     WITH CHECK: user_can_access_trip(id)
--   POLICY "Users can create their own trips" [INSERT] roles={public}
--     WITH CHECK: (auth.uid() = user_id)
--   POLICY "Users can delete their own trips" [DELETE] roles={authenticated}
--     USING:      (user_id = auth.uid())
--   POLICY "Users can view accessible trips" [SELECT] roles={public}
--     USING:      user_can_access_trip(id)

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY POLICIES — storage schema (journal-images related)
-- ----------------------------------------------------------------------------
-- TABLE: storage.objects
--   POLICY "Authenticated journal image uploads 1hjo0y6_0" [INSERT] roles={authenticated}
--     WITH CHECK: (bucket_id = 'journal-images'::text)

-- ----------------------------------------------------------------------------
-- 6. STORAGE BUCKETS (config only, no object data)
-- ----------------------------------------------------------------------------
-- id=journal-images  public=true  file_size_limit=null  allowed_mime_types=null

-- ----------------------------------------------------------------------------
-- 7. SECURITY DEFINER / SECURITY INVOKER FUNCTIONS (public schema)
-- ----------------------------------------------------------------------------
-- accept_trip_invite(invite_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- archive_trip_member(member_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- can_access_trip(target_trip_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- can_invite_to_trip(target_trip_id bigint, target_email text)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- create_trip_with_owner(p_title text, p_destination text, p_start_date date, p_end_date date, p_image_url text, p_currencies text[])  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- debug_auth_uid()  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- decline_trip_invite(invite_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- leave_trip(target_trip_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- remove_trip_collaborator(target_trip_id bigint, target_user_id uuid)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- repair_collaborator_members()  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- revoke_trip_invite(invite_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- transfer_trip_ownership(p_trip_id bigint, p_new_owner_user_id uuid, p_transfer_reason text)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- user_can_access_trip(target_trip_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]
-- user_has_trip_invite(target_trip_id bigint)  [SECURITY DEFINER]  owner=postgres  config=["search_path=public"]

-- ----------------------------------------------------------------------------
-- 8. EXECUTE GRANTS on public-schema functions
-- ----------------------------------------------------------------------------
-- accept_trip_invite             grantees: authenticated, postgres, service_role
-- archive_trip_member            grantees: authenticated, postgres, service_role
-- can_access_trip                grantees: authenticated, postgres, service_role
-- can_invite_to_trip             grantees: authenticated, postgres, service_role
-- create_trip_with_owner         grantees: authenticated, postgres, service_role
-- debug_auth_uid                 grantees: postgres, service_role
-- decline_trip_invite            grantees: authenticated, postgres, service_role
-- leave_trip                     grantees: authenticated, postgres, service_role
-- remove_trip_collaborator       grantees: authenticated, postgres, service_role
-- repair_collaborator_members    grantees: postgres, service_role
-- revoke_trip_invite             grantees: authenticated, postgres, service_role
-- transfer_trip_ownership        grantees: authenticated, postgres, service_role
-- user_can_access_trip           grantees: authenticated, postgres, service_role
-- user_has_trip_invite           grantees: authenticated, postgres, service_role

-- ----------------------------------------------------------------------------
-- 9. FULL DEFINITIONS OF SECURITY DEFINER FUNCTIONS
-- ----------------------------------------------------------------------------
-- Verbatim pg_get_functiondef() output. Provided as CREATE OR REPLACE
-- statements for readability only — DO NOT execute this file.

CREATE OR REPLACE FUNCTION public.accept_trip_invite(invite_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_trip_id bigint;
  target_role text;
  target_name text;
  target_email text;
  existing_member_id bigint;
begin
  select trip_id, role, name, email
  into target_trip_id, target_role, target_name, target_email
  from public.trip_invites
  where id = invite_id
    and lower(email) = lower(auth.jwt() ->> 'email')
    and status = 'pending';

  if target_trip_id is null then
    raise exception 'Invite not found or is not pending.';
  end if;

  insert into public.trip_collaborators (trip_id, user_id, role, active, removed_at)
  values (target_trip_id, auth.uid(), target_role, true, null)
  on conflict (trip_id, user_id) do update
  set
    role = excluded.role,
    active = true,
    removed_at = null;

  select id
  into existing_member_id
  from public.trip_members
  where trip_id = target_trip_id
    and user_id = auth.uid()
  limit 1;

  if existing_member_id is null then
    insert into public.trip_members (trip_id, user_id, name, active)
    select
      target_trip_id,
      auth.uid(),
      coalesce(p.display_name, nullif(trim(target_name), ''), target_email, 'Traveller'),
      true
    from public.profiles p
    where p.user_id = auth.uid();

    if not found then
      insert into public.trip_members (trip_id, user_id, name, active)
      values (
        target_trip_id,
        auth.uid(),
        coalesce(nullif(trim(target_name), ''), target_email, 'Traveller'),
        true
      );
    end if;
  else
    update public.trip_members
    set active = true,
        archived_at = null
    where id = existing_member_id;
  end if;

  update public.trip_invites
  set accepted_at = now(),
      status = 'accepted'
  where id = invite_id
    and status = 'pending';

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id,
    metadata
  )
  values (
    target_trip_id,
    auth.uid(),
    'invite_accepted',
    'trip_invite',
    invite_id,
    jsonb_build_object('role', target_role)
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.archive_trip_member(member_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_trip_id bigint;
  target_user_id uuid;
  owner_user_id uuid;
begin
  select tm.trip_id, tm.user_id, t.user_id
  into target_trip_id, target_user_id, owner_user_id
  from public.trip_members tm
  join public.trips t
    on t.id = tm.trip_id
  where tm.id = member_id
    and tm.active = true;

  if target_trip_id is null then
    raise exception 'Traveller not found or already archived.';
  end if;

  if target_user_id = owner_user_id then
    raise exception 'Trip owner cannot be archived.';
  end if;

  if not (
    exists (
      select 1
      from public.trips
      where id = target_trip_id
        and user_id = auth.uid()
    )
    or exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = auth.uid()
        and role = 'editor'
    )
  ) then
    raise exception 'You do not have permission to archive this traveller.';
  end if;

  update public.trip_members
  set
    active = false,
    archived_at = now()
  where id = member_id
    and active = true;

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id
  )
  values (
    target_trip_id,
    auth.uid(),
    'traveller_archived',
    'trip_member',
    member_id
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.can_access_trip(target_trip_id bigint)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.trips
    where id = target_trip_id
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from public.trip_collaborators
    where trip_id = target_trip_id
      and user_id = auth.uid()
  );
$function$

CREATE OR REPLACE FUNCTION public.can_invite_to_trip(target_trip_id bigint, target_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  normalized_email text := lower(target_email);
  existing_user_id uuid;
begin
  if exists (
    select 1
    from public.trip_invites
    where trip_id = target_trip_id
      and lower(email) = normalized_email
      and status = 'pending'
  ) then
    return 'already_invited';
  end if;

  select user_id
  into existing_user_id
  from public.profiles
  where lower(email) = normalized_email
  limit 1;

  if existing_user_id is not null then
    if exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = existing_user_id
        and active = true
    ) then
      return 'already_collaborator';
    end if;
  end if;

  return 'ok';
end;
$function$

CREATE OR REPLACE FUNCTION public.create_trip_with_owner(p_title text, p_destination text, p_start_date date, p_end_date date, p_image_url text DEFAULT NULL::text, p_currencies text[] DEFAULT ARRAY['NOK'::text, 'SEK'::text, 'EUR'::text])
 RETURNS trips
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_user_email text := auth.jwt() ->> 'email';
  v_trip public.trips;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a trip.';
  end if;

  select coalesce(display_name, email, v_user_email, 'Traveller')
  into v_display_name
  from public.profiles
  where user_id = v_user_id;

  insert into public.trips (
    title,
    destination,
    start_date,
    end_date,
    image_url,
    currencies,
    user_id
  )
  values (
    p_title,
    p_destination,
    p_start_date,
    p_end_date,
    nullif(p_image_url, ''),
    coalesce(p_currencies, array['NOK','SEK','EUR']),
    v_user_id
  )
  returning * into v_trip;

  insert into public.trip_members (
    trip_id,
    user_id,
    name,
    active,
    archived_at
  )
  values (
    v_trip.id,
    v_user_id,
    coalesce(v_display_name, v_user_email, 'Traveller'),
    true,
    null
  )
  on conflict (trip_id, user_id)
  where user_id is not null
  do update set
    active = true,
    archived_at = null;

  return v_trip;
end;
$function$

CREATE OR REPLACE FUNCTION public.debug_auth_uid()
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select auth.uid();
$function$

CREATE OR REPLACE FUNCTION public.decline_trip_invite(invite_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_trip_id bigint;
begin
  select trip_id
  into target_trip_id
  from public.trip_invites
  where id = invite_id
    and lower(email) = lower(auth.jwt() ->> 'email')
    and status = 'pending';

  if target_trip_id is null then
    raise exception 'Invite not found or is not pending.';
  end if;

  update public.trip_invites
  set status = 'declined'
  where id = invite_id
    and status = 'pending';

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id
  )
  values (
    target_trip_id,
    auth.uid(),
    'invite_declined',
    'trip_invite',
    invite_id
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.leave_trip(target_trip_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  owner_user_id uuid;
  collaborator_row_id bigint;
begin
  select user_id
  into owner_user_id
  from public.trips
  where id = target_trip_id;

  if owner_user_id is null then
    raise exception 'Trip not found.';
  end if;

  if owner_user_id = auth.uid() then
    raise exception 'Trip owners cannot leave their own trip.';
  end if;

  select id
  into collaborator_row_id
  from public.trip_collaborators
  where trip_id = target_trip_id
    and user_id = auth.uid()
    and active = true;

  if collaborator_row_id is null then
    raise exception 'You are not an active collaborator on this trip.';
  end if;

  update public.trip_collaborators
  set active = false,
      removed_at = now()
  where id = collaborator_row_id;

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id
  )
  values (
    target_trip_id,
    auth.uid(),
    'collaborator_left',
    'trip_collaborator',
    collaborator_row_id
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.remove_trip_collaborator(target_trip_id bigint, target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  owner_user_id uuid;
  collaborator_row_id bigint;
begin
  select user_id
  into owner_user_id
  from public.trips
  where id = target_trip_id;

  if owner_user_id is null then
    raise exception 'Trip not found.';
  end if;

  if target_user_id = owner_user_id then
    raise exception 'Trip owner cannot be removed.';
  end if;

  if not (
    owner_user_id = auth.uid()
    or exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = auth.uid()
        and role = 'editor'
        and active = true
    )
  ) then
    raise exception 'You do not have permission to remove collaborators.';
  end if;

  select id
  into collaborator_row_id
  from public.trip_collaborators
  where trip_id = target_trip_id
    and user_id = target_user_id
    and active = true;

  if collaborator_row_id is null then
    raise exception 'Collaborator not found or already removed.';
  end if;

  update public.trip_collaborators
  set active = false,
      removed_at = now()
  where id = collaborator_row_id;

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id,
    metadata
  )
  values (
    target_trip_id,
    auth.uid(),
    'collaborator_removed',
    'trip_collaborator',
    collaborator_row_id,
    jsonb_build_object('target_user_id', target_user_id)
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.repair_collaborator_members()
 RETURNS TABLE(created_members integer, reactivated_members integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_created_members integer := 0;
  v_reactivated_members integer := 0;
begin
  create temp table repaired_members (
    trip_id bigint,
    member_id bigint,
    user_id uuid,
    repair_action text
  ) on commit drop;

  with created as (
    insert into public.trip_members (trip_id, user_id, name, active, archived_at)
    select
      c.trip_id,
      c.user_id,
      coalesce(p.display_name, p.email, 'Traveller'),
      true,
      null
    from public.trip_collaborators c
    left join public.trip_members m
      on m.trip_id = c.trip_id
     and m.user_id = c.user_id
    left join public.profiles p
      on p.user_id = c.user_id
    where c.active = true
      and m.id is null
    returning trip_id, id as member_id, user_id
  )
  insert into repaired_members (trip_id, member_id, user_id, repair_action)
  select trip_id, member_id, user_id, 'created'
  from created;

  get diagnostics v_created_members = row_count;

  with reactivated as (
    update public.trip_members m
    set
      active = true,
      archived_at = null
    from public.trip_collaborators c
    where c.active = true
      and c.trip_id = m.trip_id
      and c.user_id = m.user_id
      and m.active = false
    returning m.trip_id, m.id as member_id, m.user_id
  )
  insert into repaired_members (trip_id, member_id, user_id, repair_action)
  select trip_id, member_id, user_id, 'reactivated'
  from reactivated;

  get diagnostics v_reactivated_members = row_count;

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id,
    metadata
  )
  select
    rm.trip_id,
    null,
    'traveller_linked_to_user',
    'member',
    rm.member_id,
    jsonb_build_object(
      'user_id', rm.user_id,
      'repair_action', rm.repair_action,
      'source', 'repair_collaborator_members'
    )
  from repaired_members rm;

  return query select v_created_members, v_reactivated_members;
end;
$function$

CREATE OR REPLACE FUNCTION public.revoke_trip_invite(invite_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  target_trip_id bigint;
begin
  select trip_id
  into target_trip_id
  from public.trip_invites
  where id = invite_id
    and status = 'pending';

  if target_trip_id is null then
    raise exception 'Invite not found or is not pending.';
  end if;

  if not (
    exists (
      select 1
      from public.trips
      where id = target_trip_id
        and user_id = auth.uid()
    )
    or exists (
      select 1
      from public.trip_collaborators
      where trip_id = target_trip_id
        and user_id = auth.uid()
        and role = 'editor'
    )
  ) then
    raise exception 'You do not have permission to revoke this invite.';
  end if;

  update public.trip_invites
  set status = 'revoked'
  where id = invite_id
    and status = 'pending';

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id
  )
  values (
    target_trip_id,
    auth.uid(),
    'invite_revoked',
    'trip_invite',
    invite_id
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.transfer_trip_ownership(p_trip_id bigint, p_new_owner_user_id uuid, p_transfer_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_actor_user_id uuid;
  v_previous_owner_user_id uuid;
  v_target_is_active_editor boolean;
begin
  v_actor_user_id := auth.uid();

  if v_actor_user_id is null then
    raise exception 'You must be signed in to transfer ownership.';
  end if;

  select user_id
  into v_previous_owner_user_id
  from public.trips
  where id = p_trip_id
  for update;

  if v_previous_owner_user_id is null then
    raise exception 'Trip not found.';
  end if;

  if v_previous_owner_user_id <> v_actor_user_id then
    raise exception 'Only the current owner can transfer ownership.';
  end if;

  if p_new_owner_user_id = v_previous_owner_user_id then
    raise exception 'This user is already the owner.';
  end if;

  select exists (
    select 1
    from public.trip_collaborators
    where trip_id = p_trip_id
      and user_id = p_new_owner_user_id
      and active = true
      and role = 'editor'
  )
  into v_target_is_active_editor;

  if not v_target_is_active_editor then
    raise exception 'Ownership can only be transferred to an active editor.';
  end if;

  update public.trips
  set user_id = p_new_owner_user_id
  where id = p_trip_id;

  insert into public.trip_members (trip_id, user_id, name, active)
  select p_trip_id, p_new_owner_user_id, coalesce(p.display_name, p.email, 'Owner'), true
  from public.profiles p
  where p.user_id = p_new_owner_user_id
  on conflict do nothing;

  insert into public.trip_members (trip_id, user_id, name, active)
  select p_trip_id, v_previous_owner_user_id, coalesce(p.display_name, p.email, 'Editor'), true
  from public.profiles p
  where p.user_id = v_previous_owner_user_id
  on conflict do nothing;

  insert into public.trip_collaborators (trip_id, user_id, role, active, removed_at)
  values (p_trip_id, v_previous_owner_user_id, 'editor', true, null)
  on conflict do nothing;

  insert into public.trip_ownership_transfers (
    trip_id,
    previous_owner_user_id,
    new_owner_user_id,
    actor_user_id,
    reason
  )
  values (
    p_trip_id,
    v_previous_owner_user_id,
    p_new_owner_user_id,
    v_actor_user_id,
    p_transfer_reason
  );

  insert into public.trip_activity_log (
    trip_id,
    actor_user_id,
    event_type,
    target_type,
    target_id,
    metadata
  )
  values (
    p_trip_id,
    v_actor_user_id,
    'ownership_transferred',
    'ownership',
    p_trip_id,
    jsonb_build_object(
      'previous_owner_user_id', v_previous_owner_user_id,
      'new_owner_user_id', p_new_owner_user_id,
      'reason', p_transfer_reason
    )
  );
end;
$function$

CREATE OR REPLACE FUNCTION public.user_can_access_trip(target_trip_id bigint)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.trips t
    where t.id = target_trip_id
      and t.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.trip_collaborators c
    where c.trip_id = target_trip_id
      and c.user_id = auth.uid()
      and c.active = true
  )
  or exists (
    select 1
    from public.trip_invites i
    where i.trip_id = target_trip_id
      and lower(i.email) = lower(auth.jwt() ->> 'email')
      and i.status in ('pending', 'accepted')
  );
$function$

CREATE OR REPLACE FUNCTION public.user_has_trip_invite(target_trip_id bigint)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.trip_invites
    where trip_id = target_trip_id
      and lower(email) = lower(auth.jwt() ->> 'email')
      and status in ('pending', 'accepted')
  );
$function$

-- ----------------------------------------------------------------------------
-- 10. TABLE-LEVEL GRANTS SUMMARY (anon / authenticated)
-- ----------------------------------------------------------------------------
-- Note: Supabase grants broad table-level privileges (SELECT/INSERT/UPDATE/
-- DELETE/etc.) to both anon and authenticated by default on every table —
-- this is standard Supabase project behavior, not a Voyome-specific
-- misconfiguration. RLS policies (section 4) are the actual enforcement
-- layer; table grants merely gate whether RLS is even evaluated.
-- anon and authenticated both hold full CRUD-level grants on: bookings, expense_participants, expenses, journal_entries, packing_items, packing_list_items, packing_lists, packing_profiles, personal_packing_items, profiles, trip_activity_log, trip_collaborators, trip_invites, trip_members, trip_ownership_transfers, trips
