import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-card/50 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
          <Link
            to="/terms"
            className="underline-offset-2 transition-colors hover:text-primary hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="underline-offset-2 transition-colors hover:text-primary hover:underline"
          >
            Privacy Policy
          </Link>
        </div>

        <a
          href="mailto:sollisfantasysports@gmail.com"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <Mail className="size-4" aria-hidden />
          sollisfantasysports@gmail.com
        </a>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Free to play. No real money wagering. Must be 18+.
      </p>
    </footer>
  );
}
