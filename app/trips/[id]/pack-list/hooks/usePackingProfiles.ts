"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type PackingProfile = {
    id: string;
    trip_id: number;
    member_id: number | null;
    owner_user_id: string | null;
    created_by: string | null;
    name: string;
    type: "personal" | "shared" | "child" | "group";
    visibility: "private" | "shared" | "collaborative";
    archived: boolean;
};

export function usePackingProfiles(tripId: number) {
    const [profiles, setProfiles] = useState<PackingProfile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function loadProfiles() {
            if (!tripId) return;

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data: personalProfile } = await supabase
                .from("packing_profiles")
                .select("*")
                .eq("trip_id", tripId)
                .eq("owner_user_id", user.id)
                .eq("type", "personal")
                .maybeSingle();

            if (!personalProfile) {
                await supabase.from("packing_profiles").insert({
                    trip_id: tripId,
                    name: "My Packing List",
                    type: "personal",
                    visibility: "private",
                    owner_user_id: user.id,
                    created_by: user.id,
                });
            }

            const { data: sharedProfile } = await supabase
                .from("packing_profiles")
                .select("*")
                .eq("trip_id", tripId)
                .eq("type", "shared")
                .maybeSingle();

            if (!sharedProfile) {
                await supabase.from("packing_profiles").insert({
                    trip_id: tripId,
                    name: "Shared Family",
                    type: "shared",
                    visibility: "collaborative",
                    owner_user_id: null,
                    created_by: user.id,
                });
            }

            const { data: refreshedProfiles, error } = await supabase
                .from("packing_profiles")
                .select("*")
                .eq("trip_id", tripId)
                .eq("archived", false)
                .order("created_at", { ascending: true });

            if (error) {
                console.error(error);
                return;
            }

            const cleanProfiles = refreshedProfiles || [];

            setProfiles(cleanProfiles);
            const savedProfileId = localStorage.getItem(`activePackingProfile:${tripId}`);

            const savedProfileStillExists = cleanProfiles.some(
                (profile) => profile.id === savedProfileId
            );

            setActiveProfileId(
                savedProfileStillExists
                    ? savedProfileId
                    : cleanProfiles[0]?.id || null
            );
            setLoaded(true);
        }

        loadProfiles();
    }, [tripId]);

    function chooseProfile(profileId: string) {
        localStorage.setItem(`activePackingProfile:${tripId}`, profileId);
        setActiveProfileId(profileId);
    }

    return {
        profiles,
        activeProfileId,
        setActiveProfileId: chooseProfile,
        loaded,
    };
}