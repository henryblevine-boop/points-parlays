/**
 * Renders a bet slip as a 1080x1920 Instagram-Stories-sized PNG on a canvas.
 * Pure client-side — no network calls, no AI, no cost.
 */
import { formatOdds, formatPoints } from "./odds";
import type { Bet } from "./data";

const W = 1080;
const H = 1920;

const NAVY = "#0b1524";
const NAVY_CARD = "#132238";
const ORANGE = "#f97316";
const WHITE = "#ffffff";
const MUTED = "#93a4bd";
const WIN = "#22c55e";
const LOSS = "#ef4444";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1);
  return `${out}…`;
}

export type ShareCardOptions = {
  bet: Bet;
  username: string;
};

export function renderShareCard({ bet, username }: ShareCardOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const won = bet.status === "won";
  const lost = bet.status === "lost";
  const accent = won ? WIN : lost ? LOSS : ORANGE;
  const verdict = won ? "PARLAY HIT" : lost ? "BAD BEAT" : "LIVE TICKET";

  // Background: navy with a radial accent glow behind the headline.
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 430, 40, W / 2, 430, 760);
  glow.addColorStop(0, `${accent}55`);
  glow.addColorStop(1, "#0b152400");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";

  // Brand
  ctx.fillStyle = ORANGE;
  ctx.font = "800 44px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("SOLIS·FANTASY", W / 2, 190);
  ctx.fillStyle = MUTED;
  ctx.font = "600 32px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("FREE-TO-PLAY · NO REAL MONEY", W / 2, 240);

  // Verdict headline
  ctx.fillStyle = accent;
  ctx.font = "900 118px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(verdict, W / 2, 420);

  // Odds + points
  ctx.fillStyle = WHITE;
  ctx.font = "800 76px system-ui, -apple-system, Segoe UI, sans-serif";
  const legCount = bet.bet_legs.length;
  ctx.fillText(
    `${legCount > 1 ? `${legCount}-LEG PARLAY` : "STRAIGHT"} ${formatOdds(bet.combined_odds)}`,
    W / 2,
    530,
  );

  if (bet.status !== "pending") {
    ctx.fillStyle = accent;
    ctx.font = "900 150px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(`${formatPoints(bet.points_delta)} PTS`, W / 2, 690);
  } else {
    ctx.fillStyle = MUTED;
    ctx.font = "700 54px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("SWEATING IT OUT", W / 2, 670);
  }

  // Legs card
  const cardX = 80;
  const cardY = 780;
  const cardW = W - 160;
  const rowH = 128;
  const visible = bet.bet_legs.slice(0, 6);
  const cardH = 40 + visible.length * rowH + 40;

  ctx.fillStyle = NAVY_CARD;
  roundRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fill();
  ctx.strokeStyle = `${accent}66`;
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.stroke();

  ctx.textAlign = "left";
  visible.forEach((leg, i) => {
    const y = cardY + 40 + i * rowH;
    if (i > 0) {
      ctx.strokeStyle = "#24354f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 40, y - 4);
      ctx.lineTo(cardX + cardW - 40, y - 4);
      ctx.stroke();
    }
    ctx.fillStyle = WHITE;
    ctx.font = "800 46px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(truncate(ctx, leg.selection, cardW - 300), cardX + 40, y + 52);

    ctx.fillStyle = MUTED;
    ctx.font = "500 34px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(truncate(ctx, `${leg.market} · ${leg.matchup}`, cardW - 300), cardX + 40, y + 100);

    ctx.fillStyle = ORANGE;
    ctx.font = "800 46px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(formatOdds(leg.odds), cardX + cardW - 40, y + 52);
    ctx.textAlign = "left";
  });

  if (bet.bet_legs.length > visible.length) {
    ctx.fillStyle = MUTED;
    ctx.font = "600 34px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(
      `+${bet.bet_legs.length - visible.length} more legs`,
      cardX + 40,
      cardY + cardH - 4,
    );
  }

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = "800 52px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(`@${username}`, W / 2, H - 220);
  ctx.fillStyle = MUTED;
  ctx.font = "500 36px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(
    new Date(bet.placed_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    W / 2,
    H - 160,
  );
  ctx.fillStyle = ORANGE;
  ctx.font = "700 38px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("solisfantasy.lovable.app", W / 2, H - 90);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Couldn't export the image."));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

export async function shareOrDownloadCard(blob: Blob, filename: string): Promise<"shared" | "saved"> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "Solis-Fantasy" });
      return "shared";
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return "shared";
    }
  }
  downloadBlob(blob, filename);
  return "saved";
}
