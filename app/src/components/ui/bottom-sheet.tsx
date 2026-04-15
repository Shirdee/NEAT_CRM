"use client";

import {useEffect, useRef} from "react";

type BottomSheetProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  label: string;
};

export function BottomSheet({children, isOpen, onClose, label}: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) onClose();
  }

  return (
    <dialog
      aria-label={label}
      className={[
        "fixed inset-0 z-50 m-0 h-full max-h-full w-full max-w-full",
        "bg-transparent p-0",
        "backdrop:bg-ink/40 backdrop:backdrop-blur-sm",
      ].join(" ")}
      onClick={handleBackdropClick}
      ref={dialogRef}
    >
      <div
        className={[
          "absolute inset-x-0 bottom-0",
          "rounded-t-[32px] bg-white/95",
          "shadow-[0_-12px_48px_rgba(16,36,63,0.10)] backdrop-blur",
          "pb-safe",
          "max-h-[92dvh] overflow-y-auto",
          "animate-[sheet-up_280ms_cubic-bezier(0.32,0.72,0,1)_both]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-ink/15" />
        </div>
        {children}
      </div>
    </dialog>
  );
}
