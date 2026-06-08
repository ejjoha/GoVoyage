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
      <section className="relative mb-13">
        <div className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2.75rem] bg-neutral-200 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-[20rem] w-full object-cover scale-[1.01]"
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
            {backHref ? (
              <Link
                href={backHref}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-[0_10px_25px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95"
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

            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                aria-label="Edit trip"
                className="flex h-11 items-center justify-center rounded-full bg-white/95 px-4 text-sm font-bold text-neutral-900 shadow-[0_10px_25px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95"
              >
                Edit Trip
              </button>
            ) : (
              <div />
            )}
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

            {subtitle && (
              <p className="mt-1 text-sm text-white/85">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className="absolute inset-x-0 -bottom-10 px-1">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/95 px-5 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.13)] backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-0">
                {stats.map((stat, index) => {
                  const content = (
                    <div
                      className={`flex flex-col items-center justify-center text-center transition active:scale-95 ${index !== 2 ? "border-r border-neutral-100" : ""
                        }`}
                    >
                      <StatIcon index={index} value={stat.value} />

                      <p className="mt-2 text-lg font-bold text-neutral-950">
                        {stat.value}
                      </p>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        {stat.label}
                      </p>
                    </div>
                  );

                  return stat.onClick ? (
                    <button
                      key={stat.label || stat.value}
                      type="button"
                      onClick={stat.onClick}
                      aria-label={stat.ariaLabel || `${stat.label}: ${stat.value}`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div key={stat.label || stat.value}>{content}</div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {toolsOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <button
            type="button"
            aria-label="Close trip tools"
            className="absolute inset-0"
            onClick={() => setToolsOpen(false)}
          />

          <div className="relative mx-auto w-full max-w-3xl rounded-t-[2rem] bg-[#faf7ef] p-5 shadow-2xl">
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-950">
                      Smart Pack List
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Climate-based packing suggestions.
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
                    <img
                      src="/icons/chevron-right.svg"
                      alt=""
                      className="h-6 w-6"
                    />
                  </span>
                </div>
              </Link>

              <Link
                href={tripId ? `/trips/${tripId}/journal` : "#"}
                className="block rounded-3xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-neutral-950">
                      Travel Journal
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Capture memories, hidden gems and moments from your trip.
                    </p>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm">
                    <img
                      src="/icons/chevron-right.svg"
                      alt=""
                      className="h-6 w-6"
                    />
                  </span>
                </div>
              </Link>

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

function StatIcon({
  index,
  value,
}: {
  index: number;
  value: string;
}) {
  return (
    <div className="flex h-9 w-14 items-center justify-center">
      {index === 0 && <TravellerIcon count={Number(value)} />}

      {index === 1 && (
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          className="text-emerald-600"
        >
          <rect x="6" y="8" width="20" height="18" rx="5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M10 5v6M22 5v6M7 14h18M12.5 20l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {index === 2 && (
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          className="-ml-0.5 text-amber-400"
        >
          <path d="M23.5 20.5A11 11 0 0 1 11.5 8.5 10 10 0 1 0 23.5 20.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}

function TravellerIcon({ count }: { count: number }) {
  const people = Math.min(Math.max(count || 1, 1), 4);
  const spacing = 7;
  const personWidth = 18;
  const totalWidth = personWidth + (people - 1) * spacing;
  const startX = (48 - totalWidth) / 2;

  return (
    <div className="relative h-8 w-12 text-emerald-600">
      {Array.from({ length: people }).map((_, index) => {
        const isFront = index === 0;

        return (
          <div
            key={index}
            className="absolute top-1"
            style={{
              left: `${startX + index * spacing}px`,
              zIndex: people - index,
              opacity: isFront ? 1 : 0.7,
            }}
          >
            <div className="mx-auto h-2 w-2 rounded-full border-2 border-current bg-white" />
            <div className="mt-0.5 h-2.5 w-[16px] rounded-t-full border-2 border-b-0 border-current bg-white" />
          </div>
        );
      })}
    </div>
  );
}