"use client";

import Link from "next/link";

type ExpenseHeroProps = {
    title: string;
    eyebrow?: string;
    imageUrl?: string | null;
    backHref: string;
    travellerCount: number;
    expenseCount: number;
    totalLabel: string;
};

export default function ExpenseHero({
    title,
    eyebrow,
    imageUrl,
    backHref,
    travellerCount,
    expenseCount,
    totalLabel,
}: ExpenseHeroProps) {
    return (
        <section className="relative mb-24">
            <div className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2.75rem] bg-neutral-200">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={eyebrow || title}
                        className="h-[20rem] w-full object-cover"
                    />
                ) : (
                    <div className="h-[22rem] w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/35" />

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.18) 60%, transparent 80%)",
                    }}
                />

                <div className="absolute left-3 top-3 right-3 z-30 flex justify-between">
                    <Link
                        href={backHref}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition active:scale-95"
                        aria-label="Back"
                    >
                        <img
                            src="/icons/arrow-left.svg"
                            alt=""
                            className="h-5 w-5 opacity-80"
                        />
                    </Link>

                    <div />
                </div>

                <div className="absolute inset-x-0 top-16 px-8 text-center text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">
                        Destination
                    </p>

                    <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.06em]">
                        {eyebrow || title}
                    </h1>

                    {eyebrow && (
                        <p className="mt-3 text-sm font-semibold text-white/90">
                            {title}
                        </p>
                    )}
                </div>
            </div>

            <div className="absolute inset-x-0 -bottom-20 px-1">
                <div className="rounded-[1.5rem] bg-white px-5 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
                    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
                        <MoneyBagIcon />

                        <div className="min-w-0">
                            <h2 className="font-serif text-1xl font-semibold leading-[0.95] tracking-[-0.06em] text-neutral-950">
                                Shared trip expenses
                            </h2>

                            <p className="mt-2 text-[12px] leading-5 text-neutral-500">
                                Track spending together and settle balances in seconds.
                            </p>
                        </div>
                    </div>

                    <div className="mt-1 border-t border-neutral-100 pt-2">
                        <div className="grid grid-cols-3 gap-0 text-center">
                            <ExpenseStat
                                icon="👥"
                                value={String(travellerCount)}
                                label={travellerCount === 1 ? "Traveller" : "Travellers"}
                            />

                            <ExpenseStat
                                icon="🧾"
                                value={String(expenseCount)}
                                label={expenseCount === 1 ? "Expense" : "Expenses"}
                            />

                            <ExpenseStat
                                icon="💳"
                                value={totalLabel}
                                label="Total spent"
                                isLast
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ExpenseStat({
    icon,
    value,
    label,
    isLast = false,
}: {
    icon: string;
    value: string;
    label: string;
    isLast?: boolean;
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center ${isLast ? "" : "border-r border-neutral-100"
                }`}
        >
            <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg">
                    {icon}
                </span>

                <span className="text-lg font-bold text-neutral-950">
                    {value}
                </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-neutral-400">
                {label}
            </p>
        </div>
    );
}

function MoneyBagIcon() {
    return (
        <div className="flex h-18 w-18 items-center justify-center">
            <img
                src="/images/money-bag.png"
                alt=""
                className="h-28 w-28 object-contain"
            />
        </div>
    );
}