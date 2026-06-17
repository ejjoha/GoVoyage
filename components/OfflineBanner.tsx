"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!hasMounted || isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[100] px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-2 text-center text-sm font-medium text-amber-800 shadow-lg backdrop-blur-sm">
        You’re offline. You can view cached content, but changes require an internet connection.
      </div>
    </div>
  );
}
