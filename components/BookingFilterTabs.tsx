import type { BookingFilter } from "@/app/trips/[id]/types";

type BookingFilterTabsProps = {
    filters: BookingFilter[];
    activeFilter: BookingFilter;
    onChange: (filter: BookingFilter) => void;
};

function getFilterText(filter: BookingFilter) {
    if (filter === "all") return "All";
    if (filter === "flight") return "Flights";
    if (filter === "hotel") return "Hotels";
    return "Plans";
}

export function BookingFilterTabs({
    filters,
    activeFilter,
    onChange,
}: BookingFilterTabsProps) {
    return (
        <div className="mb-3 w-full min-w-0 overflow-hidden">
            <div className="grid w-full min-w-0 grid-cols-4 gap-2 overflow-hidden rounded-[1rem] border border-stone-200 bg-white/10 p-2 backdrop-blur-sm">
                {filters.map((filter) => {
                    const isActive = activeFilter === filter;

                    return (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => onChange(filter)}
                            aria-label={getFilterText(filter)}
                            className={`flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                                    : "bg-transparent text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                                }`}
                        >
                            <span>{getFilterText(filter)}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}