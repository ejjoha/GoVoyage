-- Align invite uniqueness with the invitation lifecycle.
-- Only pending invites should block a new invite.
-- Accepted/declined/revoked/expired invites are historical lifecycle records.

drop index if exists public.trip_invites_active_email_key;

create unique index if not exists trip_invites_pending_email_key
on public.trip_invites (trip_id, lower(email))
where status = 'pending';
