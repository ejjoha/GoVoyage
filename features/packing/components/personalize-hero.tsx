import BackButton from "@/components/ui/back-button";

type Props = {
    href: string;
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    isLeaving?: boolean;
};

export default function PersonalizeHero({
    href,
    title,
    description,
    imageSrc,
    imageAlt,
    isLeaving = false,
}: Props) {
    return (
        <section className="relative mb-0">
            <div className="relative overflow-hidden rounded-b-[2.75rem] bg-neutral-200 shadow-[0_18px_45px_rgba(70,55,35,0.10)]">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="h-[20rem] w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/10" />

                <div className="absolute left-4 top-4 z-20">
                    <BackButton
                        href={href}
                        ariaLabel="Go back"
                    />
                </div>
            </div>

            {isLeaving && (
                <div className="pointer-events-none absolute inset-0 rounded-b-[2.75rem] bg-white/10" />
            )}
        </section>
    );
}