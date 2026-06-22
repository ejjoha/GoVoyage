type ItinerarySyncStatusProps = {
    label: string;
    syncStatus: string;
    onRefresh: () => void | Promise<void>;
};

export function ItinerarySyncStatus({
    label,
    syncStatus,
    onRefresh,
}: ItinerarySyncStatusProps) {
    if (!label) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{label}</span>

            {syncStatus === "conflict" && (
                <button
                    type="button"
                    onClick={onRefresh}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                    Refresh itinerary
                </button>
            )}
        </div>
    );
}
