"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || !password) {
            setMessage("Please enter both email and password.");
            return;
        }
        setIsLoading(true);
        setMessage("Signing in...");

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        console.log("LOGIN ERROR:", error);

        if (error) {
            setIsLoading(false);
            setMessage(error.message);
            return;
        }

        const { error: inviteError } = await supabase.rpc("accept_trip_invites");

        if (inviteError) {
            console.error("Error accepting trip invites:", inviteError);
        }

        localStorage.removeItem("cached-trips");
        setMessage("Signed in. Redirecting...");

        window.location.href = "/";
    }

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        if (!displayName.trim() || !email.trim() || !password) {
            setMessage("Please enter your name, email, and password.");
            return;
        }
        setIsLoading(true);
        setMessage("");

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        if (data.user) {
            const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                    user_id: data.user.id,
                    display_name: displayName.trim(),
                });

            if (profileError) {
                console.error("Error creating profile:", profileError);
            }
        }

        const { error: inviteError } = await supabase.rpc("accept_trip_invites");

        if (inviteError) {
            console.error("Error accepting trip invites:", inviteError);
        }

        localStorage.removeItem("cached-trips");
        setMessage("Account created. Redirecting...");

        window.location.href = "/";
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <p className="text-sm font-semibold text-rose-500">GoVoyage</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-900">
                        {mode === "signIn" ? "Sign in" : "Create account"}
                    </h1>
                    <p className="mt-2 text-sm text-stone-500">
                        {mode === "signIn"
                            ? "Access your trips, itinerary and shared expenses."
                            : "Create your GoVoyage account and start planning."}
                    </p>
                </div>

                <form className="space-y-4">
                    {mode === "signUp" && (
                        <input
                            type="text"
                            placeholder="Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
                    />

                    {message && (
                        <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                            {message}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={mode === "signIn" ? handleSignIn : handleSignUp}
                        disabled={isLoading}
                        className="w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:bg-stone-300"
                    >
                        {isLoading
                            ? "Working..."
                            : mode === "signIn"
                                ? "Sign in"
                                : "Create account"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMessage("");
                            setMode(mode === "signIn" ? "signUp" : "signIn");
                        }}
                        disabled={isLoading}
                        className="w-full rounded-2xl bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 disabled:bg-stone-100"
                    >
                        {mode === "signIn" ? "Create account" : "Already have an account? Sign in"}
                    </button>
                </form>
            </div>
        </main>
    );
}