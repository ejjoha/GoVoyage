"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator) ||
            process.env.NODE_ENV !== "production"
        ) {
            return;
        }

        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log("Service worker registered:", registration.scope);
            })
            .catch((error) => {
                console.error("Service worker registration failed:", error);
            });
    }, []);

    return null;
}
