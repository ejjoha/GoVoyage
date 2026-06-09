"use client";

type Props = {
    onAddTripRecommendations: () => void;
    onAddCategories: () => void;
};

export default function PackingNextActions({
    onAddTripRecommendations,
    onAddCategories,
}: Props) {
    return (
        <section className="mt-5 rounded-[1.5rem] bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-neutral-400">
                What&apos;s next?
            </p>

            <div className="mt-3 grid gap-2">
                <button
                    type="button"
                    onClick={onAddTripRecommendations}
                    className="rounded-2xl bg-neutral-950 px-4 py-4 text-left text-sm font-bold text-white transition active:scale-[0.98]"
                >
                    ✨ Add trip recommendations
                </button>

                <button
                    type="button"
                    onClick={onAddCategories}
                    className="rounded-2xl bg-neutral-100 px-4 py-4 text-left text-sm font-bold text-neutral-700 transition active:scale-[0.98]"
                >
                    📦 Add categories
                </button>
            </div>
        </section>
    );
}