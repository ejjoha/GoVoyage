"use client";

import type { Booking } from "../types";
import {
  getBookingIcon,
  getAccentBarClass,
  getBadgeClass,
  getExpandedPanelClass,
  getDetailsHeading,
  formatDateTime,
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

export default function BookingTimeline({
  groupedBookings,
  expandedId,
  setExpandedId,
  onEditBooking,
  onDeleteBooking,
}: BookingTimelineProps) {
  return (
    <div className="w-full space-y-4">
      {Object.entries(groupedBookings).map(([date, items]) => (
        <div key={date} className="w-full min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="inline-block rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
              {date === "No date"
                ? "No date"
                : new Date(date).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
            </div>

            {new Date(date).toDateString() === new Date().toDateString() && (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
              Today
            </span>
            )}
          </div>

          <div className="w-full space-y-4">
            {Object.entries(items).map(([bucket, bucketBookings]) => {
              if (bucketBookings.length === 0) return null;

              return (
                <div key={bucket} className="w-full min-w-0">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {bucket}
                  </h3>

                  <div className="w-full space-y-3">
                    {bucketBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="grid w-full min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
                      >
                        <div className="relative flex h-full justify-center">
                          <div className="absolute bottom-0 top-0 w-px bg-gradient-to-b from-stone-300 to-stone-400/60" />
                          <div className="relative z-10 mt-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-400 bg-white shadow-sm">
                            {getBookingIcon(booking.type)}
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            setExpandedId(
                              expandedId === booking.id ? null : booking.id
                            );
                          }}
                          className="mb-2 w-full min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-md sm:p-5"
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
                              className={`flex h-6 w-6 items-center justify-center text-stone-400 transition-transform duration-300 ${
                                expandedId === booking.id
                                  ? "rotate-180"
                                  : "rotate-0"
                              }`}
                            >
                              ⌄
                            </span>
                          </div>

                          <h2 className="mt-3 break-words text-base font-semibold leading-snug text-stone-800 sm:text-lg">
                            {booking.type === "hotel"
                              ? booking.hotel_name || booking.title
                              : booking.title}
                          </h2>

                          <p className="mt-2 text-sm font-medium text-stone-500 sm:text-base">
                            {formatDateTime(booking.start_time)}
                            {booking.end_time
                              ? ` – ${formatDateTime(booking.end_time)}`
                              : ""}
                          </p>

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              expandedId === booking.id
                                ? "mt-4 grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <div
                                className={`w-full min-w-0 rounded-2xl p-4 text-sm text-stone-700 ${getExpandedPanelClass(
                                  booking.type
                                )}`}
                              >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                    {getDetailsHeading(booking.type)}
                                  </h3>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditBooking(booking);
                                      }}
                                      aria-label="Edit booking"
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-600 shadow-sm transition hover:bg-white hover:text-stone-900"
                                    >
                                      ✏️
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteBooking(booking.id);
                                      }}
                                      aria-label="Delete booking"
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-red-400 shadow-sm transition hover:bg-white hover:text-red-600"
                                    >
                                      🗑️
                                    </button>
                                  </div>
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
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 whitespace-nowrap overflow-hidden text-ellipsis">
                                            Airline
                                          </p>
                                          <p className="mt-1 text-sm font-semibold text-stone-800">
                                            {booking.airline || "—"}
                                          </p>
                                        </div>

                                        <div className="rounded-2xl bg-white/60 p-3">
                                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 whitespace-nowrap overflow-hidden text-ellipsis">
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
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}