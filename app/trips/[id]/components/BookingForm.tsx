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
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

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
  onSubmit,
  onCancel,
}: BookingFormProps) {
  return (
    <form
      ref={bookingFormRef}
      onSubmit={onSubmit}
      className="mb-6 space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-rose-600">
            {editingBookingId ? "Editing booking" : "New booking"}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Add the key details for this part of your trip.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-sm text-stone-500 underline"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700">
            Booking type
          </label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as BookingType)}
            className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
          >
            <option value="flight">Flight</option>
            <option value="hotel">Hotel</option>
            <option value="activity">Activity</option>
            <option value="transport">Transport</option>
            <option value="dining">Dining</option>
          </select>
        </div>

        {newType !== "hotel" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Title</label>
            <input
              type="text"
              placeholder={getTitlePlaceholder(newType)}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
            />
          </div>
        )}
      </div>

      {newType === "hotel" ? (
        <>
          <div className="space-y-4 rounded-2xl bg-orange-50/60 p-4">
            <h3 className="text-sm font-semibold text-stone-700">
              Hotel details
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Hotel name
              </label>
              <input
                type="text"
                placeholder="e.g. The Savoy"
                value={newHotelName}
                onChange={(e) => setNewHotelName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getStartLabel(newType)}
              </label>
              <input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getEndLabel(newType)}
              </label>
              <input
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Address
              </label>
              <input
                type="text"
                placeholder="Hotel address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getConfirmationLabel(newType)}
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Notes
              </label>
              <input
                type="text"
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>
        </>
      ) : newType === "flight" ? (
        <>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Departure
              </label>
              <input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Arrival
              </label>
              <input
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-blue-50/60 p-4">
            <h3 className="text-sm font-semibold text-stone-700">
              Flight details
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Departure airport
              </label>
              <input
                type="text"
                placeholder="e.g. OSL"
                value={newDeparture}
                onChange={(e) => setNewDeparture(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Arrival airport
              </label>
              <input
                type="text"
                placeholder="e.g. LHR"
                value={newArrival}
                onChange={(e) => setNewArrival(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Airline
              </label>
              <input
                type="text"
                placeholder="e.g. Norwegian"
                value={newAirline}
                onChange={(e) => setNewAirline(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Flight number
              </label>
              <input
                type="text"
                placeholder="e.g. DY123"
                value={newFlightNumber}
                onChange={(e) => setNewFlightNumber(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getConfirmationLabel(newType)}
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Notes
              </label>
              <input
                type="text"
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>
        </>
      ) : newType === "transport" ? (
        <>
          <div className="space-y-4 rounded-2xl bg-violet-50/70 p-4">
            <h3 className="text-sm font-semibold text-stone-700">
              Transport details
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Origin
              </label>
              <input
                type="text"
                placeholder="e.g. Oslo Central Station"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Stockholm Central Station"
                value={newDestinationPoint}
                onChange={(e) => setNewDestinationPoint(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getStartLabel(newType)}
              </label>
              <input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getEndLabel(newType)}
              </label>
              <input
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getConfirmationLabel(newType)}
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Notes
              </label>
              <input
                type="text"
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>
        </>
      ) : newType === "dining" ? (
        <>
          <div className="space-y-4 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4">
            <h3 className="text-sm font-semibold text-stone-700">
              Reservation details
            </h3>

            <div className="rounded-2xl border border-rose-200/70 bg-white/80 p-4 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-full">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Restaurant
                  </p>
                  <p className="mt-1 text-base font-semibold text-stone-900">
                    {newTitle || "Your reservation"}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xl">🍽️</span>
                  <div className="mt-1 h-px w-12 bg-rose-200" />
                </div>

                <div className="w-full space-y-1.5 text-left">
                  <label className="text-sm font-medium text-stone-700">
                    Reservation date and time
                  </label>
                  <input
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Address
              </label>
              <input
                type="text"
                placeholder="e.g. Via Roma 12"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Reservation code
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Notes
              </label>
              <input
                type="text"
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4 rounded-2xl bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-700">Timing</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getStartLabel(newType)}
              </label>
              <input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getEndLabel(newType)}
              </label>
              <input
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="box-border min-w-0 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-3 text-sm text-stone-800"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getLocationLabel(newType)}
              </label>
              <input
                type="text"
                placeholder={getLocationPlaceholder(newType)}
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                {getConfirmationLabel(newType)}
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={newConfirmation}
                onChange={(e) => setNewConfirmation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">
                Notes
              </label>
              <input
                type="text"
                placeholder="Anything important to remember?"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>
        </>
      )}

      <div className="sticky bottom-0 left-0 right-0 z-10 -mx-4 border-t border-stone-200 bg-white/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          type="submit"
          className="w-full rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-rose-600 hover:shadow-lg active:scale-[0.97]"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">✓</span>
            {editingBookingId ? "Update booking" : "Save booking"}
          </span>
        </button>
      </div>
    </form>
  );
}