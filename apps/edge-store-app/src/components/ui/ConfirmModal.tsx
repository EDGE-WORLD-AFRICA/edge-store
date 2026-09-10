import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "./Modal";

interface IConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
    btnBg: "bg-danger hover:bg-danger/90",
  },
  warning: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    btnBg: "bg-warning hover:bg-warning/90",
  },
  default: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    btnBg: "bg-primary hover:bg-primary-strong",
  },
};

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: IConfirmModalProps) => {
  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center py-2 text-center">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg}`}>
          <AlertTriangle size={24} className={style.iconColor} />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        <div className="mt-6 flex w-full gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${style.btnBg}`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};