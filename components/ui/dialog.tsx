/**
 * Modal Dialog Component
 * 
 * A reusable modal dialog component for displaying content
 * in an overlay with title, description, and actions.
 */

"use client";

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

/**
 * Modal props interface
 */
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  hideCloseButton?: boolean;
}

/**
 * Modal Component
 * 
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item?"
 * >
 *   <p>This action cannot be undone.</p>
 *   <div className="flex justify-end gap-2 mt-4">
 *     <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="destructive">Delete</Button>
 *   </div>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  hideCloseButton = false,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  React.useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`relative w-full ${sizes[size]} bg-background rounded-lg shadow-lg animate-in zoom-in-95 slide-in-from-bottom-2`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Close button */}
          {!hideCloseButton && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-2">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation Modal Component
 * 
 * A pre-built modal for confirmation dialogs.
 */
interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Loading..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Alert Modal Component
 * 
 * A simple alert modal with only an OK button.
 */
interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  okLabel?: string;
  onOk?: () => void;
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  okLabel = "OK",
  onOk,
}: AlertModalProps) {
  const handleOk = () => {
    onOk?.();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="flex justify-end mt-4">
        <Button onClick={handleOk}>{okLabel}</Button>
      </div>
    </Modal>
  );
}

/**
 * useModal hook
 * 
 * A hook to manage modal state.
 * 
 * @example
 * ```tsx
 * const { open, setOpen, Modal } = useModal();
 * 
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Open Modal</Button>
 *     <Modal title="My Modal">
 *       <p>Modal content</p>
 *     </Modal>
 *   </>
 * );
 * ```
 */
export function useModal() {
  const [open, setOpen] = useState(false);

  const ModalWrapper = ({ children, title, description, size }: Omit<ModalProps, "open" | "onOpenChange">) => (
    <Modal open={open} onOpenChange={setOpen} title={title} description={description} size={size}>
      {children}
    </Modal>
  );

  return {
    open,
    setOpen,
    Modal: ModalWrapper,
  };
}

/**
 * useConfirm hook
 * 
 * A hook to manage confirmation dialog state.
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmModalProps, "open" | "onOpenChange"> | null>(null);

  const confirm = useCallback((options: Omit<ConfirmModalProps, "open" | "onOpenChange">) => {
    setConfig(options);
    setOpen(true);
  }, []);

  const ConfirmWrapper = () => {
    if (!config) return null;
    return (
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        {...config}
      />
    );
  };

  return {
    confirm,
    ConfirmModal: ConfirmWrapper,
  };
}
