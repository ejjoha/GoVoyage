import Link from "next/link";

type BackButtonProps = {
    href: string;
    ariaLabel?: string;
};

export default function BackButton({
    href,
    ariaLabel = "Back",
}: BackButtonProps) {
    return (
        <Link
            href={href}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-[0_10px_25px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95"
            aria-label={ariaLabel}
        >
            <img
                src="/icons/arrow-left.svg"
                alt=""
                className="h-5 w-5 opacity-80"
            />
        </Link>
    );
}
