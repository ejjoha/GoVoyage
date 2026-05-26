"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setShowScrollTop(window.scrollY > 500);
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    if (!showScrollTop) return null;

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-12 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Scroll to top"
        >
            <img src="/icons/chevron-up-line.svg" alt="" className="h-5 w-5" />
        </button>
    );
}