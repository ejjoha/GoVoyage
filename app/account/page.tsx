"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
    const router = useRouter();

    const [userEmail, setUserEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [activeSection, setActiveSection] = useState<
        "profile" | "security" | "preferences" | "packing" | "danger"
    >("profile");

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                router.replace("/login");
                return;
            }

            setUserEmail(user.email || "Unknown user");
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("user_id", user.id)
                .single();

            setDisplayName(profile?.display_name || "");
            setIsLoading(false);
        }

        loadUser();
    }, [router]);

    async function handleSendPasswordReset() {
        setMessage("");

        if (!userEmail) {
            setMessage("Could not find your email address.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
            redirectTo: `${window.location.origin}/login`,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Password reset email sent.");
    }

    async function handleSaveProfile() {
        const trimmedName = displayName.trim();

        if (!trimmedName) {
            setMessage("Please enter your name.");
            return;
        }

        setIsSavingProfile(true);
        setMessage("");

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setIsSavingProfile(false);
            router.replace("/login");
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .upsert({
                user_id: user.id,
                display_name: trimmedName,
            });

        setIsSavingProfile(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Profile saved.");
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace("/login");
    }

    async function handleDeleteAccount() {
        if (deleteConfirmation !== "DELETE") {
            setMessage("Type DELETE to confirm account deletion.");
            return;
        }

        setIsDeletingAccount(true);
        setMessage("");

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            setIsDeletingAccount(false);
            router.replace("/login");
            return;
        }

        const response = await fetch("/api/delete-account", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            setIsDeletingAccount(false);
            setMessage(result.error || "Could not delete account.");
            return;
        }

        await supabase.auth.signOut();
        router.replace("/login");
    }

    if (isLoading) {
        return (
            <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
                <div className="mx-auto w-full max-w-2xl">
                    <div className="rounded-[2rem] border border-stone-200/60 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                        <div className="h-7 w-40 animate-pulse rounded-full bg-stone-200" />
                        <div className="mt-4 h-4 w-64 animate-pulse rounded-full bg-stone-200" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-2xl space-y-5">
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="text-sm font-semibold text-stone-500 transition hover:text-stone-900"
                >
                    ← Back to trips
                </button>

                <section className="rounded-[2rem] border border-stone-200/60 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                    <p className="text-sm font-semibold text-rose-500">Voyome</p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-900">
                        Account
                    </h1>

                    <p className="mt-2 text-sm text-stone-500">
                        Manage your profile, security and app preferences.
                    </p>
                </section>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[
                        { id: "profile", label: "Profile" },
                        { id: "security", label: "Security" },
                        { id: "preferences", label: "Preferences" },
                        { id: "packing", label: "Packing" },
                        { id: "danger", label: "Danger" },
                    ].map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() =>
                                setActiveSection(
                                    section.id as
                                    | "profile"
                                    | "security"
                                    | "preferences"
                                    | "packing"
                                    | "danger"
                                )
                            }
                            className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${activeSection === section.id
                                ? "bg-rose-500 text-white shadow-sm"
                                : "bg-white text-stone-600 hover:bg-stone-100"
                                }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {activeSection === "profile" && (
                    <section className="rounded-[2rem] border border-stone-200/60 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-900">Profile</h2>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-stone-700">
                                    Display name
                                </label>

                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
                                />
                            </div>

                            <div className="rounded-2xl bg-stone-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                                    Signed in as
                                </p>
                                <p className="mt-1 truncate text-sm font-medium text-stone-800">
                                    {userEmail}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:bg-rose-200"
                            >
                                {isSavingProfile ? "Saving..." : "Save profile"}
                            </button>
                        </div>
                    </section>
                )}

                {activeSection === "security" && (
                    <section className="rounded-[2rem] border border-stone-200/60 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-900">Security</h2>

                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            Send yourself a password reset email if you want to change your password.
                        </p>

                        <button
                            type="button"
                            onClick={handleSendPasswordReset}
                            className="mt-4 w-full rounded-2xl bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
                        >
                            Send password reset email
                        </button>
                    </section>
                )}

                {activeSection === "preferences" && (
                    <section className="rounded-[2rem] border border-stone-200/60 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-900">App preferences</h2>

                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            Preferences will live here later, such as default currency, display options
                            and travel planning settings.
                        </p>
                    </section>
                )}

                {activeSection === "packing" && (
                    <section className="rounded-[2rem] border border-stone-200/60 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-900">
                            Packing list defaults
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            Later, you can add items you always want included in future packing lists.
                        </p>
                    </section>
                )}

                {activeSection === "danger" && (
                    <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>

                        <p className="mt-2 text-sm leading-6 text-red-600">
                            Deleting your account is permanent. Your sign-in account will be removed and
                            you will be signed out.
                        </p>

                        <div className="mt-5 rounded-2xl bg-white/70 p-4">
                            <label className="text-sm font-semibold text-red-700">
                                Type DELETE to confirm
                            </label>

                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="DELETE"
                                className="mt-2 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== "DELETE" || isDeletingAccount}
                            className="mt-4 w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400"
                        >
                            {isDeletingAccount ? "Deleting account..." : "Delete account permanently"}
                        </button>
                    </section>
                )}

                {message && (
                    <div className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-medium text-stone-700">
                        {message}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                    Sign out
                </button>
            </div>
        </main>
    );
}