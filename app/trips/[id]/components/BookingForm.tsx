"use client";

import type { BookingType } from "../types";
import {
  getTitlePlaceholder,
  getLocationLabel,
  getLocationPlaceholder,
  getStartLabel,
  getEndLabel,
  getConfirmationLabel,
} from "../utils";

type BookingFormProps = {
  bookingFormRef: React.RefObject<HTMLFormElement | null>;
  editingBookingId: number | null;
  newTitle: string;
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  newType: BookingType;
  setNewType: React.Dispatch<React.SetStateAction<BookingType>>;
  newStartTime: string;
  setNewStartTime: React.Dispatch<React.SetStateAction<string>>;
  newEndTime: string;
  setNewEndTime: React.Dispatch<React.SetStateAction<string>>;
  newLocation: string;
  setNewLocation: React.Dispatch<React.SetStateAction<string>>;
  newConfirmation: string;
  setNewConfirmation: React.Dispatch<React.SetStateAction<string>>;
  newNotes: string;
  setNewNotes: React.Dispatch<React.SetStateAction<string>>;
  newAirline: string;
  setNewAirline: React.Dispatch<React.SetStateAction<string>>;
  newFlightNumber: string;
  setNewFlightNumber: React.Dispatch<React.SetStateAction<string>>;
  newDeparture: string;
  setNewDeparture: React.Dispatch<React.SetStateAction<string>>;
  newArrival: string;
  setNewArrival: React.Dispatch<React.SetStateAction<string>>;
  newHotelName: string;
  setNewHotelName: React.Dispatch<React.SetStateAction<string>>;
  newAddress: string;
  setNewAddress: React.Dispatch<React.SetStateAction<string>>;
  newOrigin: string;
  setNewOrigin: React.Dispatch<React.SetStateAction<string>>;
  newDestinationPoint: string;
  setNewDestinationPoint: React.Dispatch<React.SetStateAction<string>>;
  bookingFormError: string;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

function SectionCard({
  title,
  tone = "neutral",
  children,
}: {
  title: string;
  tone?: "neutral" | "flight" | "hotel" | "dining" | "activity";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "flight"
      ? "border-[#5FA8FF]/30 bg-[#5FA8FF]/8"
      : tone === "hotel"
        ? "border-[#F4B266]/30 bg-[#F4B266]/8"
        : tone === "dining"
          ? "border-[#E97A73]/30 bg-[#E97A73]/8"
          : tone === "activity"
            ? "border-[#58C7B2]/30 bg-[#58C7B2]/8"
            : "border-stone-200 bg-stone-50";
  return (
    <div className={`rounded-[1.5rem] border p-4 sm:p-5 ${toneClass}`}>
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400";
const dateInputClass =
  "box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800";

export default function BookingForm({
  bookingFormRef,
  editingBookingId,
  newTitle,
  setNewTitle,
  newType,
  setNewType,
  newStartTime,
  setNewStartTime,
  newEndTime,
  setNewEndTime,
  newLocation,
  setNewLocation,
  newConfirmation,
  setNewConfirmation,
  newNotes,
  setNewNotes,
  newAirline,
  setNewAirline,
  newFlightNumber,
  setNewFlightNumber,
  newDeparture,
  setNewDeparture,
  newArrival,
  setNewArrival,
  newHotelName,
  setNewHotelName,
  newAddress,
  setNewAddress,
  newOrigin,
  setNewOrigin,
  newDestinationPoint,
  setNewDestinationPoint,
  bookingFormError,
  isSaving,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  return (
    <form ref={bookingFormRef} onSubmit={onSubmit} className="space-y-5 pb-2">
      <SectionCard title="Booking type">
        <Field label="Type">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as BookingType)}
            className={dateInputClass}
          >
            <option value="flight">Flight</option>
            <option value="hotel">Hotel</option>
            <option value="activity">Activity</option>
            <option value="transport">Transport</option>
            <option value="dining">Dining</option>
          </select>
        </Field>

        {newType !== "hotel" && (
          <Field label="Title">
            <input
              type="text"
              placeholder={getTitlePlaceholder(newType)}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={inputClass}
            />
          </Field>
        )}
      </SectionCard>

      {newType === "hotel" ? (
        <>
          <SectionCard title="Hotel details" tone="hotel">
            <Field label="Hotel name">
              <input
                type="text"
                placeholder="e.g. The Savoy"
                value={newHotelName}
                onChange={(e) => setNewHotelName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={getStartLabel(newType)}>
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>

              <Field label={getEndLabel(newType)}>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>
            </div>

            <Field label="Address">
              <input
                type="text"
                placeholder="Hotel address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className={inputClass}
              />
            </Field>
          </SectionCard>

          <SectionCard title="Extra details">
            <Field label={getConfirmationLabel(newType)}>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </SectionCard>
        </>
      ) : newType === "flight" ? (
        <>
          <SectionCard title="Flight timing">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Departure">
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>

              <Field label="Arrival">
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Flight details" tone="flight">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Departure airport">
                <input
                  type="text"
                  placeholder="e.g. OSL"
                  value={newDeparture}
                  onChange={(e) => setNewDeparture(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Arrival airport">
                <input
                  type="text"
                  placeholder="e.g. LHR"
                  value={newArrival}
                  onChange={(e) => setNewArrival(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Airline">
                <input
                  type="text"
                  placeholder="e.g. Norwegian"
                  value={newAirline}
                  onChange={(e) => setNewAirline(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Flight number">
                <input
                  type="text"
                  placeholder="e.g. DY123"
                  value={newFlightNumber}
                  onChange={(e) => setNewFlightNumber(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Extra details">
            <Field label={getConfirmationLabel(newType)}>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </SectionCard>
        </>
      ) : newType === "transport" ? (
        <>
          <SectionCard title="Transport details" tone="activity">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Origin">
                <input
                  type="text"
                  placeholder="e.g. Oslo Central Station"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Destination">
                <input
                  type="text"
                  placeholder="e.g. Stockholm Central Station"
                  value={newDestinationPoint}
                  onChange={(e) => setNewDestinationPoint(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={getStartLabel(newType)}>
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>

              <Field label={getEndLabel(newType)}>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Extra details">
            <Field label={getConfirmationLabel(newType)}>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </SectionCard>
        </>
      ) : newType === "dining" ? (
        <>
          <SectionCard title="Reservation details" tone="dining">
            <Field label="Restaurant">
              <input
                type="text"
                placeholder="e.g. Bar Cañete"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Reservation date and time">
              <input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className={dateInputClass}
              />
            </Field>

            <Field label="Address">
              <input
                type="text"
                placeholder="e.g. Via Roma 12"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Reservation code">
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </SectionCard>
        </>
      ) : (
        <>
          <SectionCard title="Timing">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={getStartLabel(newType)}>
                <input
                  type="datetime-local"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>

              <Field label={getEndLabel(newType)}>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className={dateInputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Details">
            <Field label={getLocationLabel(newType)}>
              <input
                type="text"
                placeholder={getLocationPlaceholder(newType)}
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label={getConfirmationLabel(newType)}>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </SectionCard>
        </>
      )}

      {bookingFormError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookingFormError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          aria-disabled={isSaving}
          className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-rose-500"
        >
          {isSaving
            ? "Saving…"
            : editingBookingId
              ? "Save changes"
              : "Save booking"}
        </button>
      </div>
    </form>
  );
}