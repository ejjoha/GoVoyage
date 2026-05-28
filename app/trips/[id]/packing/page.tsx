import PackingBoard from "@/features/packing/components/packing-board";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PackingPage({ params }: Props) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-[#f6f1e8]">
            <PackingBoard tripId={Number(id)} />
        </main>
    );
}