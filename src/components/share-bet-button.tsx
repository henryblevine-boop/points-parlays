import { useEffect, useState } from "react";
import { Share2, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  canvasToBlob,
  downloadBlob,
  renderShareCard,
  shareOrDownloadCard,
} from "@/lib/share-card";
import type { Bet } from "@/lib/data";

export function ShareBetButton({ bet, username }: { bet: Bet; username: string }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const canvas = renderShareCard({ bet, username });
        const b = await canvasToBlob(canvas);
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setBlob(b);
        setPreview(url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't build the card.");
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setPreview(null);
      setBlob(null);
    };
  }, [open, bet, username]);

  const filename = `solis-fantasy-${bet.status}-${bet.id.slice(0, 6)}.png`;

  return (
    <>
      <button
        type="button"
        aria-label="Share this bet as an image"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        <Share2 className="size-4" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Share your ticket</DialogTitle>
            <DialogDescription>
              Sized 1080×1920 for Instagram Stories. Save it or share straight from your phone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Shareable Solis-Fantasy result card"
                className="max-h-[55vh] w-auto rounded-lg border border-border"
              />
            ) : (
              <div className="h-[55vh] w-[31vh] animate-pulse rounded-lg bg-muted" />
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={!blob}
              onClick={() => {
                if (blob) downloadBlob(blob, filename);
              }}
            >
              <Download className="size-4" aria-hidden /> Save
            </Button>
            <Button
              disabled={!blob || busy}
              onClick={async () => {
                if (!blob) return;
                setBusy(true);
                try {
                  const result = await shareOrDownloadCard(blob, filename);
                  if (result === "saved") toast.success("Card saved to your device");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Share2 className="size-4" aria-hidden /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
