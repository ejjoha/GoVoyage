export type SuccessToastData = {
    title: string;
    subtitle: string;
};

type SuccessToastProps = {
    toast: SuccessToastData | null;
};

export function SuccessToast({ toast }: SuccessToastProps) {
    if (!toast) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[2px] pointer-events-none">
            <div className="toast-in pointer-events-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl shadow-sm">
                    ✓
                </div>

                <p className="text-lg font-semibold tracking-[-0.02em] text-stone-900">
                    {toast.title}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                    {toast.subtitle}
                </p>
            </div>
        </div>
    );
}