import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Solis-Fantasy" },
      {
        name: "description",
        content:
          "Terms of Service for Solis-Fantasy. Free-to-play social betting leagues with no real money wagering.",
      },
      { property: "og:title", content: "Terms of Service — Solis-Fantasy" },
      {
        property: "og:description",
        content: "Terms of Service for Solis-Fantasy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to home
        </Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 19, 2026</p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <p>
            Welcome to Solis-Fantasy. These Terms of Service govern your access to and use of the
            Solis-Fantasy website and mobile application. By creating an account or using the
            service, you agree to these terms.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">1. Free to Play</h2>
          <p>
            Solis-Fantasy is a free-to-play social game. All wagers are simulated. No real money,
            cryptocurrency, or anything of monetary value is wagered, won, or lost on this platform.
            Points awarded in leagues have no cash value and cannot be redeemed.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use Solis-Fantasy. By signing up, you represent that
            you meet this age requirement and that all information you provide is accurate and
            complete.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">3. Account Conduct</h2>
          <p>
            You are responsible for activity on your account. Do not share your password, impersonate
            others, post abusive content, manipulate league standings, or use the service for any
            unlawful purpose. We may suspend or terminate accounts that violate these rules.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">4. Content</h2>
          <p>
            You retain ownership of content you post, but you grant Solis-Fantasy a license to host,
            display, and distribute that content within the service. Do not post copyrighted
            material you do not have permission to use.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">5. Disclaimers</h2>
          <p>
            Solis-Fantasy is provided "as is" without warranties of any kind. We do not guarantee
            that odds, scores, or standings will always be accurate or available. The service is for
            entertainment purposes only.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">6. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after changes
            means you accept the revised terms.
          </p>

          <h2 className="font-display text-lg font-bold text-foreground">7. Contact</h2>
          <p>
            Questions about these terms? Email us at{" "}
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
