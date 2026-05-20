"use client";

import Link from "next/link";
import { useState } from "react";

type TripStat = {
  label: string;
  value: string;
  onClick?: () => void;
  ariaLabel?: string;
};

type TripHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  imageUrl?: string;
  onEdit?: () => void;
  backHref?: string;
  stats?: TripStat[];
  tripId?: string | number;
};

export default function TripHero({
  title,
  subtitle,
  eyebrow,
  imageUrl,
  onEdit,
  backHref,
  stats = [],
  tripId,
}: TripHeroProps) {
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <>
      <div className="relative mb-5 w-full overflow-hidden rounded-[2rem] shadow-md">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-[300px] w-full object-cover sm:h-[360px]"
          />
        ) : (
          <div className="h-[300px] w-full bg-gradient-to-br from-rose-100 via-rose-200 to-pink-300 sm:h-[360px]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 right-3 z-30 flex justify-between">
          {backHref ? (
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
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            aria-label="Open trip tools"
            className="flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-neutral-900 shadow-md transition active:scale-95"
          >
            Tools
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-white/20 bg-white/15 p-3 backdrop-blur-md shadow-[0_10px_34px_rgba(0,0,0,0.22)]">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit trip"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center transition active:scale-95"
            >
              <img
                src="/icons/insideedit.svg"
                alt=""
                className="h-5 w-5 opacity-90"
              />
            </button>
          )}

          {eyebrow && <p className="text-sm text-white/80">{eyebrow}</p>}

          <h1 className="pr-10 text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h1>

          {subtitle && <p className="mt-1 text-sm text-white/90">{subtitle}</p>}

          {stats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.map((stat) =>
                stat.onClick ? (
                  <button
                    key={stat.label || stat.value}
                    type="button"
                    onClick={stat.onClick}
                    aria-label={stat.ariaLabel || `${stat.label}: ${stat.value}`}
                    className="cursor-pointer rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
                  >
                    <span className="font-semibold">{stat.value}</span>
                    {stat.label && <> {stat.label}</>}
                  </button>
                ) : (
                  <div
                    key={stat.label || stat.value}
                    className="rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm"
                  >
                    <span className="font-semibold">{stat.value}</span>
                    {stat.label && <> {stat.label}</>}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {toolsOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <button
            type="button"
            aria-label="Close trip tools"
            className="absolute inset-0"
            onClick={() => setToolsOpen(false)}
          />

          <div className="relative w-full rounded-t-[2rem] bg-[#faf7ef] p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300" />

            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                  Trip tools
                </p>
                <h2 className="mt-1 text-2xl font-bold text-neutral-950">
                  Helpful for this journey
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setToolsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <Link
                href={tripId ? `/trips/${tripId}/pack-list` : "#"}
                className="block rounded-3xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-950">
                      Smart Pack List
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Climate-based packing suggestions.
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-600 text-xl text-white">
                    →
                  </span>
                </div>
              </Link>

              <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-950">
                  Trip Notes
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Notebook for tips, memories and reminders.
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Coming soon
                </p>
              </div>

              <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-950">
                  Important Info
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Emergency numbers, embassy info and local details.
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}