import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatOdds } from "@/lib/odds";

/**
 * DraftKings-style odds cell: the line (e.g. "+3.5", "O 44.5") sits on top in
 * white, with the price underneath in the accent green. Moneyline cells have no
 * line, so the price is centered on its own.
 */
export function OddsButton({
  line,
  label,
  odds,
  active,
  disabled,
  onClick,
  className,
}: {
  /** Line / point text shown above the price. Omit for moneyline. */
  line?: string | null;
  /** Accessible description of the selection. */
  label: string;
  odds: number;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-12 min-w-0 flex-col items-center justify-center rounded-md border transition-colors",
        active
          ? "border-primary bg-primary/15"
          : "border-transparent bg-elevated hover:border-primary/50",
        disabled && "opacity-40",
        className,
      )}
    >
      {disabled ? (
        <Lock className="size-3.5 text-muted-foreground" aria-hidden />
      ) : (
        <>
          {line ? (
            <span className="text-[13px] leading-tight font-semibold tabular-nums text-foreground">
              {line}
            </span>
          ) : null}
          <span
            className={cn(
              "tabular-nums leading-tight",
              line ? "text-[11px] font-semibold" : "text-[15px] font-bold",
              active ? "text-primary" : "text-primary",
            )}
          >
            {formatOdds(odds)}
          </span>
        </>
      )}
    </button>
  );
}
