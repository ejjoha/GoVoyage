"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepareRecoverySession() {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (type === "recovery" && accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage("This reset link is invalid or has expired.");
          setReady(false);
          return;
        }
      }

      setReady(true);
    }

    prepareRecoverySession();
  }, []);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Your password has been updated. You can now sign in.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold text-rose-500">Voyome</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-900">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Choose a new password for your account.
          </p>
        </div>

        {!ready ? (
          <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Validating reset link...
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handlePasswordUpdate}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400"
            />

            {message && (
              <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:bg-stone-300"
            >
              {isLoading ? "Updating..." : "Update password"}
            </button>

            <Link
              href="/login"
              className="block w-full rounded-2xl bg-stone-100 px-5 py-3 text-center text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
