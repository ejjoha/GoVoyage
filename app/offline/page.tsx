export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <p className="text-4xl">🧳</p>
        <h1 className="mt-4 text-2xl font-bold text-stone-950">
          You're offline
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Open a trip packing list while online once, then it can be used offline from cache.
        </p>
      </div>
    </main>
  );
}
