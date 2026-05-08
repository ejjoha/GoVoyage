import BookingForm from "./BookingForm";
import type { BookingType } from "../types";

type Props = {
    show: boolean;
    onClose: () => void;
    editingBookingId: number | null;
    bookingFormRef: React.RefObject<HTMLFormElement | null>;

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
};

export default function BookingFormModal({
    show,
    onClose,
    editingBookingId,
    bookingFormRef,
    onSubmit,
    ...formProps
}: Props) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 pt-14 backdrop-blur-[2px] sm:items-center sm:p-6">
            <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-xl font-semibold text-stone-900">
                            {editingBookingId ? "Edit booking" : "Add booking"}
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                            Add the details and keep your itinerary up to date.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-5 sm:px-6">
                    <BookingForm
                        bookingFormRef={bookingFormRef}
                        editingBookingId={editingBookingId}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        {...formProps}
                    />
                </div>
            </div>
        </div>
    );
}