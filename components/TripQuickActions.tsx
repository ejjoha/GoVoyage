import Link from "next/link";

type TripQuickActionsProps = {
    tripId: number;
    onAddBooking: () => void;
};

export function TripQuickActions({
    tripId,
    onAddBooking,
}: TripQuickActionsProps) {
    return (
        <section className="mb-2 -mx-2 overflow-x-auto px-4 scrollbar-hide">
            <div className="flex gap-2 pb-1">
                <button
                    type="button"
                    onClick={onAddBooking}
                    className="flex min-w-[105px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white px- py-3 text-center shadow-sm transition active:scale-[0.97]"
                >
                    <span className="flex items-center gap">
                        <span className="text-[14px] font-semibold text-stone-950">
                            Add booking
                        </span>
                    </span>
                </button>

                <Link
                    href={`/trips/${tripId}/packing`}
                    className="flex min-w-[105px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white px- py-3 text-center shadow-sm transition active:scale-[0.97]"
                >
                    <span className="flex items-center">
                        <span className="text-[14px] font-semibold text-stone-950">
                            Pack List
                        </span>
                    </span>
                </Link>

                <Link
                    href={`/trips/${tripId}/cost-sharing`}
                    className="flex min-w-[105px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white px- py-3 text-center shadow-sm transition active:scale-[0.97]"
                >
                    <span className="flex items-center">
                        <span className="text-[14px] font-semibold text-stone-950">
                            Expenses
                        </span>
                    </span>
                </Link>
            </div>
        </section>
    );
}