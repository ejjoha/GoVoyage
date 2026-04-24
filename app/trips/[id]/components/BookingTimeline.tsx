"use client";

import { useRef } from "react";
import type { Booking } from "../types";
import {
  getBookingIcon,
  getAccentBarClass,
  getBadgeClass,
  getExpandedPanelClass,
  getDetailsHeading,
  formatDateTime,
  getBookingSummary,
  formatDayLabel,
  isTodayLabel,
  getDayBookingCount,
} from "../utils";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="grid w-full grid-cols-[96px_minmax(0,1fr)] gap-3 border-b border-stone-200/80 py-2">
      <span className="min-w-0 text-stone-500">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-stone-800">
        {value}
      </span>
    </div>
  );
}

type GroupedBookings = Record<
  string,
  {
    Morning: Booking[];
    Afternoon: Booking[];
    Evening: Booking[];
    Unscheduled: Booking[];
  }
>;

type BookingTimelineProps = {
  groupedBookings: GroupedBookings;
  expandedId: number | null;
  setExpandedId: React.Dispatch<React.SetStateAction<number | null>>;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: number) => void;
};

function TimelineBucket({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-stone-200" />
        <h3 className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          {title}
        </h3>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function BookingTimeline({
  groupedBookings,
  expandedId,
  setExpandedId,
  onEditBooking,
  onDeleteBooking,
}: BookingTimelineProps) {
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  function handleToggleBooking(bookingId: number, isExpanded: boolean) {
    if (isExpanded) {
      setExpandedId(null);
      return;
    }

    setExpandedId(bookingId);

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const row = rowRefs.current[bookingId];
        if (!row) return;

        const offset = 90;
        const top =
          row.getBoundingClientRect().top + window.scrollY - offset;

        window.setTimeout(() => {
          const distance = Math.abs(window.scrollY - top);

          if (distance < 8) {
            window.scrollTo({
              top: window.scrollY - 40,
              behavior: "auto",
            });

            window.setTimeout(() => {
              window.scrollTo({
                top,
                behavior: "smooth",
              });
            }, 30);

            return;
          }

          window.scrollTo({
            top,
            behavior: "smooth",
          });
        }, 100);
      }, 120);
    });
  }

  return (
    <div className="w-full space-y-6">
      {Object.entries(groupedBookings).map(([date, items]) => {
        const bookingCount = getDayBookingCount(items);

        return (
          <section
            key={date}
            className="rounded-[2rem] border border-stone-200/70 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                {formatDayLabel(date)}
              </div>

              <div className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm">
                {bookingCount} {bookingCount === 1 ? "plan" : "plans"}
              </div>

              {isTodayLabel(date) && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                  Today
                </span>
              )}
            </div>

            <div className="space-y-5">
              {Object.entries(items).map(([bucket, bucketBookings]) => {
                if (bucketBookings.length === 0) return null;

                return (
                  <TimelineBucket key={bucket} title={bucket}>
                    {bucketBookings.map((booking) => {
                      const isExpanded = expandedId === booking.id;

                      return (
                        <div
                          key={booking.id}
                          ref={(element) => {
                            rowRefs.current[booking.id] = element;
                          }}
                          className="grid w-full min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3"
                        >
                          <div className="relative flex h-full justify-center">
                            <div className="absolute bottom-0 top-0 w-px bg-gradient-to-b from-stone-300 to-stone-400/60" />
                            <div className="relative z-10 mt-5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-stone-300 bg-white shadow-sm">
                              {getBookingIcon(booking.type)}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleBooking(booking.id, isExpanded)
                              }
                              className="mb-2 w-full min-w-0 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] sm:p-5"
                            >
                              <div
                                className={`mb-4 h-1.5 rounded-full ${getAccentBarClass(
                                  booking.type
                                )}`}
                              />

                              <div className="flex w-full min-w-0 items-center justify-between gap-3">
                                <span
                                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${getBadgeClass(
                                    booking.type
                                  )}`}
                                >
                                  {booking.type}
                                </span>

                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"
                                    }`}
                                >
                                  ⌄
                                </span>
                              </div>

                              <h2 className="mt-3 break-words text-base font-semibold leading-snug text-stone-900 sm:text-lg">
                                {booking.type === "hotel"
                                  ? booking.hotel_name || booking.title
                                  : booking.title}
                              </h2>

                              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                                <p className="text-sm font-medium text-stone-500">
                                  {formatDateTime(booking.start_time)}
                                  {booking.end_time
                                    ? ` – ${formatDateTime(booking.end_time)}`
                                    : ""}
                                </p>

                                <span className="hidden text-stone-300 sm:inline">
                                  •
                                </span>

                                <p className="min-w-0 break-words text-sm text-stone-600">
                                  {getBookingSummary(booking)}
                                </p>
                              </div>
                            </button>

                            <div
                              className={`grid transition-all duration-300 ease-in-out ${isExpanded
                                ? "mt-3 grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <div
                                  className={`w-full min-w-0 rounded-[1.5rem] p-4 text-sm text-stone-700 ${getExpandedPanelClass(
                                    booking.type
                                  )}`}
                                >
                                  <div className="mb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                      {getDetailsHeading(booking.type)}
                                    </h3>
                                  </div>

                                  <div className="space-y-1">
                                    {booking.type === "flight" && (
                                      <div className="space-y-4">
                                        <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-white/70 p-4 shadow-sm">
                                          <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Departure
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {booking.departure_airport || "—"}
                                              </p>
                                              <p className="text-sm text-stone-500">
                                                {formatDateTime(booking.start_time)}
                                              </p>
                                            </div>

                                            <div className="flex flex-col items-center">
                                              <span className="text-xl">✈️</span>
                                              <div className="mt-1 h-px w-12 bg-blue-200" />
                                            </div>

                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Arrival
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {booking.arrival_airport || "—"}
                                              </p>
                                              <p className="text-sm text-stone-500">
                                                {formatDateTime(booking.end_time)}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-100 via-transparent to-blue-100 opacity-50" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Airline
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                              {booking.airline || "—"}
                                            </p>
                                          </div>

                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Flight number
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                              {booking.flight_number || "—"}
                                            </p>
                                          </div>

                                          <div className="col-span-2 rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Booking reference
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                              {booking.confirmation_code || "—"}
                                            </p>
                                          </div>
                                        </div>

                                        {booking.notes && (
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Notes
                                            </p>
                                            <p className="mt-1 text-sm text-stone-700">
                                              {booking.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {booking.type === "hotel" && (
                                      <div className="space-y-4">
                                        <div className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-white/70 p-4 shadow-sm">
                                          <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Hotel
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {booking.hotel_name ||
                                                  booking.title ||
                                                  "—"}
                                              </p>
                                            </div>

                                            <div className="flex flex-col items-center">
                                              <span className="text-xl">🏨</span>
                                              <div className="mt-1 h-px w-12 bg-orange-200" />
                                            </div>

                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Check-in
                                              </p>
                                              <p className="mt-1 text-sm font-medium text-stone-900">
                                                {formatDateTime(booking.start_time)}
                                              </p>
                                            </div>

                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Check-out
                                              </p>
                                              <p className="mt-1 text-sm font-medium text-stone-900">
                                                {formatDateTime(booking.end_time)}
                                              </p>
                                            </div>

                                            {booking.address && (
                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Address
                                                </p>
                                                <p className="mt-1 text-sm text-stone-600">
                                                  {booking.address}
                                                </p>
                                              </div>
                                            )}
                                          </div>

                                          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-orange-100 via-transparent to-orange-100 opacity-40" />
                                        </div>

                                        {booking.confirmation_code && (
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Confirmation code
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                              {booking.confirmation_code}
                                            </p>
                                          </div>
                                        )}

                                        {booking.notes && (
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Notes
                                            </p>
                                            <p className="mt-1 text-sm text-stone-700">
                                              {booking.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {booking.type === "transport" && (
                                      <div className="space-y-4">
                                        <div className="relative overflow-hidden rounded-2xl border border-violet-200/70 bg-white/70 p-4 shadow-sm">
                                          <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Origin
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {booking.origin || "—"}
                                              </p>
                                              <p className="text-sm text-stone-500">
                                                {formatDateTime(booking.start_time)}
                                              </p>
                                            </div>

                                            <div className="flex flex-col items-center">
                                              <span className="text-xl">
                                                {booking.title
                                                  .toLowerCase()
                                                  .includes("bus")
                                                  ? "🚌"
                                                  : "🚆"}
                                              </span>
                                              <div className="mt-1 h-px w-12 bg-violet-200" />
                                            </div>

                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Destination
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {booking.destination || "—"}
                                              </p>
                                              <p className="text-sm text-stone-500">
                                                {formatDateTime(booking.end_time)}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-violet-100 via-transparent to-violet-100 opacity-50" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Ticket / booking code
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                              {booking.confirmation_code || "—"}
                                            </p>
                                          </div>
                                        </div>

                                        {booking.notes && (
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Notes
                                            </p>
                                            <p className="mt-1 text-sm text-stone-700">
                                              {booking.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {booking.type === "dining" && (
                                      <div className="space-y-4">
                                        <div className="relative overflow-hidden rounded-2xl border border-rose-200/70 bg-white/70 p-4 shadow-sm">
                                          <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Reservation
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {booking.title}
                                              </p>
                                            </div>

                                            <div className="flex flex-col items-center">
                                              <span className="text-xl">🍽️</span>
                                              <div className="mt-1 h-px w-12 bg-rose-200" />
                                            </div>

                                            <div className="w-full">
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                Time
                                              </p>
                                              <p className="mt-1 text-base font-semibold text-stone-900">
                                                {formatDateTime(booking.start_time)}
                                              </p>
                                            </div>

                                            {booking.address && (
                                              <div className="w-full">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                  Address
                                                </p>
                                                <p className="mt-1 text-sm text-stone-600">
                                                  {booking.address}
                                                </p>
                                              </div>
                                            )}
                                          </div>

                                          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-rose-100 via-transparent to-rose-100 opacity-40" />
                                        </div>

                                        {booking.confirmation_code && (
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Reservation code
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                              {booking.confirmation_code}
                                            </p>
                                          </div>
                                        )}

                                        {booking.notes && (
                                          <div className="rounded-2xl bg-white/60 p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                                              Notes
                                            </p>
                                            <p className="mt-1 text-sm text-stone-700">
                                              {booking.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {booking.type === "activity" && (
                                      <>
                                        <DetailRow
                                          label="Schedule"
                                          value={
                                            booking.end_time
                                              ? `${formatDateTime(
                                                booking.start_time
                                              )} – ${formatDateTime(
                                                booking.end_time
                                              )}`
                                              : formatDateTime(booking.start_time)
                                          }
                                        />
                                        <DetailRow
                                          label="Location"
                                          value={booking.location}
                                        />
                                        <DetailRow
                                          label="Confirmation"
                                          value={booking.confirmation_code}
                                        />
                                        <DetailRow
                                          label="Notes"
                                          value={booking.notes}
                                        />
                                      </>
                                    )}
                                  </div>

                                  <div className="mt-5 flex items-center justify-between border-t border-white/40 pt-4">
                                    <button
                                      type="button"
                                      onClick={() => onDeleteBooking(booking.id)}
                                      aria-label="Delete booking"
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm transition hover:bg-white active:scale-95"
                                    >
                                      <img src="/icons/delete.svg" alt="" className="h-5 w-5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onEditBooking(booking)}
                                      aria-label="Edit booking"
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm transition hover:bg-white active:scale-95"
                                    >
                                      <img src="/icons/edit.svg" alt="" className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TimelineBucket>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}