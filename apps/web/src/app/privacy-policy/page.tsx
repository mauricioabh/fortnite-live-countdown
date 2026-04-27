import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-lg py-2xl text-foreground">
      <div className="mx-auto w-full max-w-3xl space-y-xl rounded-lg border border-border bg-card p-xl">
        <header className="space-y-sm">
          <h1 className="text-2xl font-semibold">
            Privacy Policy - Live Countdown: for Fortnite Fans (Mobile App)
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: April 23, 2026
          </p>
          <p className="text-sm text-muted-foreground">
            Controller: Wayool, Mexico
          </p>
          <p className="text-sm text-muted-foreground">
            Contact: support@wayool.com
          </p>
          <p className="text-sm text-muted-foreground">
            Website:{" "}
            <a className="text-primary underline" href="https://wayool.com">
              https://wayool.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Official published version:{" "}
            <a
              className="text-primary underline"
              href="https://www.wayool.com/legal/privacy/live-countdown-fortnite"
            >
              wayool.com/legal/privacy/live-countdown-fortnite
            </a>
          </p>
        </header>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            1. Information we collect
          </h2>
          <h3 className="font-medium text-foreground">
            Account and authentication information
          </h3>
          <p>
            If you create an account or sign in, we process information needed
            to authenticate you, such as your email address and credentials,
            through our authentication services. If you use sign-in through a
            third party (for example Google) where available in your build, that
            provider may process information according to its own policies
            during sign-in.
          </p>
          <h3 className="font-medium text-foreground">
            Information generated when you use the app
          </h3>
          <p>
            We process information linked to your account to provide app
            features, including favorites and recently viewed or history related
            to Fortnite countdowns and related in-app content you interact with.
          </p>
          <h3 className="font-medium text-foreground">
            Game-related content shown in the app
          </h3>
          <p>
            The app displays Fortnite-related scheduling and shop-style
            information to help you track in-game timing and offers. This
            information is provided through our systems and may be associated
            with how you use the app (for example favorites or history where
            those features require an account).
          </p>
          <h3 className="font-medium text-foreground">
            Device and technical information
          </h3>
          <p>
            When you use the app, certain technical information is processed
            automatically as part of operating the service (for example IP
            address and related technical logs through our hosting and security
            providers).
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            2. How we use information
          </h2>
          <ul className="list-disc space-y-xs pl-lg">
            <li>Provide, operate, and maintain the app and your account</li>
            <li>Enable features such as favorites and history</li>
            <li>
              Deliver app content and keep timing-related information up to date
            </li>
            <li>
              Maintain security, troubleshoot issues, and protect against abuse
            </li>
            <li>Comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            3. Legal bases (EEA, UK, and similar jurisdictions)
          </h2>
          <ul className="list-disc space-y-xs pl-lg">
            <li>Performance of a contract (providing the app you requested)</li>
            <li>
              Legitimate interests (securing the service, maintaining
              reliability, preventing misuse), balanced against your rights
            </li>
            <li>
              Consent (where we specifically ask for it for optional processing)
            </li>
            <li>Legal obligation (where required to comply with the law)</li>
          </ul>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            4. How we share information
          </h2>
          <h3 className="font-medium text-foreground">Service providers</h3>
          <p>
            We use service providers to host infrastructure, authenticate users,
            operate databases, store content, and deliver the service. They
            process personal information on our behalf under contractual terms
            and only as needed to provide their services.
          </p>
          <h3 className="font-medium text-foreground">Sign-in providers</h3>
          <p>
            If you use third-party sign-in, that provider processes information
            as part of authentication under its own policies.
          </p>
          <h3 className="font-medium text-foreground">Legal and safety</h3>
          <p>
            We may disclose information if we believe in good faith that
            disclosure is required by law, legal process, or to protect the
            rights, safety, and security of users, us, or others.
          </p>
          <p>We do not sell your personal information.</p>
          <p>
            Fortnite is a trademark of Epic Games, Inc. This app is not
            affiliated with, endorsed by, or sponsored by Epic Games, Inc.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">5. Retention</h2>
          <p>
            We retain personal information for as long as your account is active
            and as needed to provide the app, unless a longer retention period
            is required or permitted by law. You may request deletion as
            described below.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">6. Security</h2>
          <p>
            We use reasonable technical and organizational measures designed to
            protect personal information. No method of transmission or storage
            is completely secure.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            7. Your rights and choices
          </h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, restrict, or object to certain processing, and to data
            portability. You may also have the right to lodge a complaint with a
            supervisory authority.
          </p>
          <p>
            To exercise your rights, contact us at support@wayool.com. We may
            need to verify your request.
          </p>
          <p>
            Account deletion: to request deletion of your account and associated
            personal data, email support@wayool.com from your registered email
            address, or use{" "}
            <Link className="text-primary underline" href="/data-request">
              /data-request
            </Link>
            . We will verify your request and respond within a reasonable
            period, subject to applicable law.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            8. Children&apos;s privacy
          </h2>
          <p>
            The app is not directed to children under 13. We do not knowingly
            collect personal information from children under 13. If you are a
            parent or guardian and believe a child under 13 has provided us
            personal information, contact us at support@wayool.com and we will
            take appropriate steps.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            9. International transfers
          </h2>
          <p>
            We may process and store information in countries other than your
            country of residence. Where required by applicable law, we use
            appropriate safeguards for international transfers of personal data.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            10. Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. The current
            version is always the one posted at{" "}
            <a
              className="text-primary underline"
              href="https://www.wayool.com/legal/privacy/live-countdown-fortnite"
            >
              wayool.com/legal/privacy/live-countdown-fortnite
            </a>
            , with the effective date shown at the top.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            11. Contact us
          </h2>
          <p>Wayool</p>
          <p>Email: support@wayool.com</p>
          <p>
            Website:{" "}
            <a className="text-primary underline" href="https://wayool.com">
              https://wayool.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
