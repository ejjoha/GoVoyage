"use client";

import { useRouter } from "next/navigation";

export default function InvitePage() {
    const router = useRouter();

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-rose-500">GoVoyage</p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-900">
                    You’re invited
                </h1>

                <p className="mt-3 text-sm leading-6 text-stone-500">
                    Someone invited you to join a trip on GoVoyage. Sign in or create an
                    account using the invited email address to access the trip.
                </p>

                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="mt-6 w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                    Continue to sign in
                </button>
            </div>
        </main>
    );
}