import { supabase } from "@/lib/supabase";

export async function logTripActivity({
  tripId,
  actorUserId,
  eventType,
  targetType,
  targetId,
  metadata = {},
}: {
  tripId: number;
  actorUserId?: string | null;
  eventType: string;
  targetType?: string;
  targetId?: number;
  metadata?: Record<string, unknown>;
}) {
  return supabase.from("trip_activity_log").insert({
    trip_id: tripId,
    actor_user_id: actorUserId ?? null,
    event_type: eventType,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata,
  });
}
