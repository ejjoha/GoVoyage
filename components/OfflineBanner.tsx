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
    <div className="sticky top-0 z-[100] border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800">
      You’re offline. Itinerary changes will be saved on this device and synced when you’re back online.
    </div>
  );
}
