"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "bg-stone-900 text-white hover:bg-stone-800";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div className="w-full max-w-md rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-900">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {description}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}