-- D6/rate-limiting: abuse-control layer for /api/send-trip-invite and
-- /api/send-welcome-email. This sits strictly on top of existing D1/D6
-- authorization (which already determines whether an action is allowed) -
-- it only constrains frequency, and is never itself an authorization check.
--
-- private.rate_limit_buckets is a fixed-window counter table, keyed by an
-- opaque HMAC hash (never a raw email/IP/user id) computed server-side by
-- the calling route before this function ever sees it. The private schema
-- is not exposed via PostgREST, and table/function grants are additionally
-- revoked from anon/authenticated/PUBLIC as defense in depth.
--
-- consume_email_rate_limits(specs) makes one atomic, all-or-nothing
-- decision across every bucket in a single call: if any bucket is already
-- at its limit, none of them are incremented and the longest relevant
-- reset time is returned; only if every bucket passes are all of them
-- incremented, once each. Row-level locking (FOR UPDATE, in a deterministic
-- per-call lock order) makes this safe against concurrent requests that
-- share a bucket, without needing a separate check-then-act round trip.

create schema if not exists private;

create table private.rate_limit_buckets (
    dimension text not null,
    key_hash text not null,
    window_start timestamptz not null,
    count integer not null default 0,
    primary key (dimension, key_hash, window_start)
);

create index rate_limit_buckets_window_start_idx
    on private.rate_limit_buckets (window_start);

revoke all on private.rate_limit_buckets from public, anon, authenticated;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
grant select, insert, update, delete on private.rate_limit_buckets to service_role;

create or replace function public.consume_email_rate_limits(specs jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
    sorted_specs jsonb;
    spec jsonb;
    v_dimension text;
    v_key_hash text;
    v_max_count integer;
    v_window_seconds integer;
    v_window_start timestamptz;
    v_current_count integer;
    v_reset_at timestamptz;
    v_longest_reset timestamptz := null;
    v_blocked boolean := false;
begin
    -- Opportunistic retention sweep - cheap given the indexed column and
    -- the small row count these two low-volume endpoints produce. No
    -- separate scheduled job exists in this project (pg_cron is not
    -- installed), so this piggybacks retention onto every real call
    -- instead of introducing new scheduling infrastructure for it.
    delete from private.rate_limit_buckets
    where window_start < now() - interval '48 hours';

    -- Deterministic lock order across all specs in this single call, so two
    -- concurrent multi-dimension requests that share any bucket can never
    -- deadlock against each other.
    select jsonb_agg(s order by s->>'dimension', s->>'key_hash')
    into sorted_specs
    from jsonb_array_elements(specs) s;

    -- Ensure every relevant bucket row exists, then lock all of them for
    -- the rest of this transaction - nothing else touching these specific
    -- rows can proceed until this call commits.
    for spec in select * from jsonb_array_elements(sorted_specs)
    loop
        v_dimension := spec->>'dimension';
        v_key_hash := spec->>'key_hash';
        v_window_seconds := (spec->>'window_seconds')::integer;
        v_window_start := to_timestamp(
            floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds
        );

        insert into private.rate_limit_buckets (dimension, key_hash, window_start, count)
        values (v_dimension, v_key_hash, v_window_start, 0)
        on conflict (dimension, key_hash, window_start) do nothing;
    end loop;

    for spec in select * from jsonb_array_elements(sorted_specs)
    loop
        v_dimension := spec->>'dimension';
        v_key_hash := spec->>'key_hash';
        v_max_count := (spec->>'max_count')::integer;
        v_window_seconds := (spec->>'window_seconds')::integer;
        v_window_start := to_timestamp(
            floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds
        );

        select count into v_current_count
        from private.rate_limit_buckets
        where dimension = v_dimension
          and key_hash = v_key_hash
          and window_start = v_window_start
        for update;

        v_reset_at := v_window_start + make_interval(secs => v_window_seconds);

        if v_current_count >= v_max_count then
            v_blocked := true;

            if v_longest_reset is null or v_reset_at > v_longest_reset then
                v_longest_reset := v_reset_at;
            end if;
        end if;
    end loop;

    if v_blocked then
        return jsonb_build_object('allowed', false, 'reset_at', v_longest_reset);
    end if;

    for spec in select * from jsonb_array_elements(sorted_specs)
    loop
        v_dimension := spec->>'dimension';
        v_key_hash := spec->>'key_hash';
        v_window_seconds := (spec->>'window_seconds')::integer;
        v_window_start := to_timestamp(
            floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds
        );

        update private.rate_limit_buckets
        set count = count + 1
        where dimension = v_dimension
          and key_hash = v_key_hash
          and window_start = v_window_start;
    end loop;

    return jsonb_build_object('allowed', true);
end;
$$;

revoke all on function public.consume_email_rate_limits(jsonb) from public, anon, authenticated;
grant execute on function public.consume_email_rate_limits(jsonb) to service_role;
