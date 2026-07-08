"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: "https://www.voyome.com/reset-password",
      }
    );

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("If an account exists for that email, a reset link has been sent.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold text-rose-500">Voyome</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-900">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Enter your email and we’ll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleResetRequest}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {isLoading ? "Sending..." : "Send reset link"}
          </button>

          <Link
            href="/login"
            className="block w-full rounded-2xl bg-stone-100 px-5 py-3 text-center text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
          >
            Back to sign in
          </Link>
        </form>
      </div>
    </main>
  );
}
