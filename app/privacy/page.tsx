import { appInfo } from "@/lib/appInfo";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-stone-800">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-stone-950">
        Privacy Policy
      </h1>

      <p className="mt-2 text-sm text-stone-500">
        Last updated: {appInfo.lastUpdated}
      </p>

      <section className="mt-8 space-y-5 text-sm leading-6">
        <p>
          {appInfo.name} helps travellers organize trips, itineraries, packing,
          journals, and shared expenses. This Privacy Policy explains what
          information we collect, how we use it, and how you can contact us.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Information we collect
        </h2>

        <p>
          When you use {appInfo.name}, we may collect account information such
          as your email address and authentication identity. We also store the
          travel information you add to the app, including trips, travellers,
          itinerary bookings, expenses, packing data, journal entries, and
          uploaded journal images.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          How we use your information
        </h2>

        <p>
          We use your information to provide the app features, sync your data
          across devices, enable trip collaboration, support account access,
          and improve the reliability and security of the service.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Service providers
        </h2>

        <p>
          {appInfo.name} uses Supabase for authentication, database storage,
          file storage, and backend services. Your data may be processed and
          stored by Supabase as part of providing these services.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Uploaded images
        </h2>

        <p>
          If you upload journal images, those files are stored so they can be
          shown inside your trip journal. Avoid uploading sensitive images that
          you do not want stored in the service.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Account deletion
        </h2>

        <p>
          You can request deletion of your account and associated data by using
          the account deletion feature in the app or by contacting support.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Data security
        </h2>

        <p>
          We use access controls, authentication, and database security rules to
          help protect your data. No online service can guarantee complete
          security, but we work to protect your information responsibly.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Contact
        </h2>

        <p>
          For privacy questions or account deletion requests, contact us at{" "}
          <a
            className="font-medium text-rose-600 underline"
            href={`mailto:${appInfo.supportEmail}`}
          >
            {appInfo.supportEmail}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
