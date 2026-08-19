import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Solis-Fantasy" },
      {
        name: "description",
        content:
          "Privacy Policy for Solis-Fantasy. Learn what data we collect and how we use it.",
      },
      { property: "og:title", content: "Privacy Policy — Solis-Fantasy" },
      {
        property: "og:description",
        content: "Privacy Policy for Solis-Fantasy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to home
        </Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 19, 2026</p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <p>
            This Privacy Policy describes how Solis-Fantasy collects, uses, and protects your
            personal information when you use our website and mobile application.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect the following information when you use Solis-Fantasy:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account information: email address, username, password, and profile details.</li>
            <li>Usage data: bets placed, leagues joined, posts, likes, comments, and friend connections.</li>
            <li>Device and log data: IP address, browser type, device identifiers, and app usage statistics.</li>
          </ul>

          <h2 className="font-display text-lg font-bold text-foreground">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Provide and maintain the service, including league standings and bet history.</li>
            <li>Communicate with you about your account, security, or service updates.</li>
            <li>Improve the app and fix issues.</li>
            <li>Enforce our Terms of Service and prevent abuse.</li>
          </ul>

          <h2 className="font-display text-lg font-bold text-foreground">3. Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We share data only with trusted service
            providers who help us run the app (such as hosting and authentication services), and
            when required by law.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">4. Cookies and Analytics</h2>
          <p>
            We use cookies and similar technologies to keep you signed in and understand how the app
            is used. You can control cookies through your browser settings.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">5. Data Security</h2>
          <p>
            We take reasonable measures to protect your information, but no online service is
            completely secure. Please use a strong password and keep your account credentials private.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">6. Your Choices</h2>
          <p>
            You can update your profile, change your password, or delete your account from the
            Profile settings. If you delete your account, your personal data will be removed in
            accordance with our data-retention practices.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">7. Children's Privacy</h2>
          <p>
            Solis-Fantasy is not intended for users under 18. We do not knowingly collect personal
            information from children under 18.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by posting the new policy in the app.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a
              href="mailto:support@solis-fantasy.com"
              className="text-primary underline underline-offset-2"
            >
              support@solis-fantasy.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
