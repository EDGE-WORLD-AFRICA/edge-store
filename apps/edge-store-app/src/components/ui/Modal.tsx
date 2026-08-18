import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";

type IModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: IModalSize;
  children: ReactNode;
  showCloseButton?: boolean;
}

const sizeClasses: Record<IModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  showCloseButton = true,
}: IModalProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Use createPortal to render the modal at the root of the document body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        className="animate-modal-overlay-in absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`animate-modal-content-in relative w-full ${sizeClasses[size]} rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-xl`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            {title && (
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 sm:max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};