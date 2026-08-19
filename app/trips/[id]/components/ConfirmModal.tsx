"use client";

import { useRef, useState } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
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
  // This component instance is kept mounted by callers (they render it
  // unconditionally and toggle `open`), so these hooks must run on every
  // render regardless of `open` - hence they're declared before the early
  // return below, not after it.
  const confirmLockRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "bg-stone-900 text-white hover:bg-stone-800";

  async function handleConfirm() {
    if (confirmLockRef.current) {
      return;
    }

    confirmLockRef.current = true;
    setIsConfirming(true);

    try {
      await onConfirm();
    } finally {
      confirmLockRef.current = false;
      setIsConfirming(false);
    }
  }

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
            disabled={isConfirming}
            className="rounded-xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {isConfirming ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}