import { appInfo } from "@/lib/appInfo";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-stone-800">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-stone-950">
        Terms of Service
      </h1>

      <p className="mt-2 text-sm text-stone-500">
        Last updated: {appInfo.lastUpdated}
      </p>

      <section className="mt-8 space-y-5 text-sm leading-6">
        <p>
          These Terms of Service explain the basic rules for using {appInfo.name}.
          By using the app, you agree to use it responsibly and only for lawful
          purposes.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Use of the app
        </h2>

        <p>
          {appInfo.name} is provided to help you plan trips, manage itineraries,
          packing, journals, and shared expenses. You are responsible for the
          information you add to the app and for making sure it is accurate.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Accounts
        </h2>

        <p>
          You are responsible for keeping your login access secure. If you
          believe your account has been accessed without permission, contact
          support as soon as possible.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          User content
        </h2>

        <p>
          You keep ownership of the travel information, journal entries, images,
          and other content you add. You give {appInfo.name} permission to store
          and process that content so the app can provide its features.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Shared trips
        </h2>

        <p>
          If you invite other travellers to a trip, they may be able to view or
          edit shared trip information depending on the app features available
          to them.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          No financial advice
        </h2>

        <p>
          Cost sharing and expense summaries are provided for convenience only.
          You are responsible for checking amounts, currencies, and settlements
          before paying other travellers.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Availability
        </h2>

        <p>
          We aim to keep the app reliable, but we do not guarantee that it will
          always be available, error-free, or uninterrupted.
        </p>

        <h2 className="text-xl font-semibold text-stone-950">
          Contact
        </h2>

        <p>
          For questions about these terms, contact{" "}
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
