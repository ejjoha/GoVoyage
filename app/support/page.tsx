import { appInfo } from "@/lib/appInfo";

export default function SupportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-stone-800">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-stone-950">
        Support
      </h1>

      <section className="mt-8 space-y-5 text-sm leading-6">
        <p>
          Need help with {appInfo.name}? Contact support and we will do our best
          to help.
        </p>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Contact support
          </h2>

          <p className="mt-2">
            Email:{" "}
            <a
              className="font-medium text-rose-600 underline"
              href={`mailto:${appInfo.supportEmail}`}
            >
              {appInfo.supportEmail}
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Account deletion
          </h2>

          <p className="mt-2">
            You can request deletion of your account and associated data from
            inside the app account area, or by contacting support from the email
            address connected to your account.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Useful links
          </h2>

          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <a className="text-rose-600 underline" href="/privacy">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="text-rose-600 underline" href="/terms">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
