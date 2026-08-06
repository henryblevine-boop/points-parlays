import { cn } from "@/lib/utils";
import { formatOdds } from "@/lib/odds";

export function OddsButton({
  label,
  odds,
  active,
  disabled,
  onClick,
  className,
}: {
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
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-2 transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-elevated text-foreground hover:border-primary/60",
        disabled && "cursor-not-allowed opacity-40 hover:border-border",
        className,
      )}
    >
      <span className="w-full truncate text-center text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-sm font-bold tabular-nums">{formatOdds(odds)}</span>
    </button>
  );
}
