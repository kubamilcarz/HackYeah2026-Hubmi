"use client";

import { useState } from "react";
import { CheckCircle, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Toast, ToastViewport } from "@/components/ui/Toast";

type ToastItem = { id: number; title: string; description: string; variant: "success" | "info" | "warning" | "danger" };

export function FeedbackShowcase() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function addToast() {
    const id = Date.now();
    setToasts((current) => [...current, {
      id,
      title: "Zgłoszenie zapisane",
      description: "Szkic potrzeby jest gotowy do dalszego uzupełnienia.",
      variant: "success",
    }]);
  }

  function removeToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <section className="mt-10" aria-labelledby="toasts-dialogs-heading">
      <div className="mb-4">
        <h3 className="type-h3" id="toasts-dialogs-heading">Komunikaty i okna dialogowe</h3>
        <p className="type-caption mt-1 text-[var(--content-muted)]">Komunikat potwierdza wykonaną czynność bez przerywania pracy. Okno dialogowe wymaga wyraźnej decyzji, zwłaszcza przed usunięciem szkicu.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border-subtle)] p-4">
          <h4 className="type-h3">Komunikat</h4>
          <p className="type-caption mt-1 text-[var(--content-muted)]">Można go zamknąć; znika także automatycznie po sześciu sekundach.</p>
          <Button className="mt-4" leadingIcon={CheckCircle} onClick={addToast}>Zapisz zgłoszenie</Button>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] p-4">
          <h4 className="type-h3">Potwierdzenie usunięcia</h4>
          <p className="type-caption mt-1 text-[var(--content-muted)]">Escape, przycisk zamknięcia lub tło anuluje działanie i przywraca fokus do przycisku.</p>
          <Button className="mt-4" leadingIcon={Trash} onClick={() => setIsDialogOpen(true)} variant="destructive">Usuń szkic</Button>
        </div>
      </div>

      <ToastViewport>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </ToastViewport>

      <Dialog
        description="Usunięcie szkicu jest nieodwracalne. Opublikowane zgłoszenie nie zostanie zmienione."
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        title="Usunąć szkic zgłoszenia?"
      >
        <div className="dialog__actions">
          <Button onClick={() => setIsDialogOpen(false)} variant="secondary">Anuluj</Button>
          <Button onClick={() => setIsDialogOpen(false)} variant="destructive">Usuń szkic</Button>
        </div>
      </Dialog>
    </section>
  );
}
