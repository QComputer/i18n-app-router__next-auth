/**
 * Toast Notification Component
 * 
 * A reusable toast notification system that displays
 * success, error, warning, and info messages.
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "./button";

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Toast context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 * 
 * Wraps the application and provides toast functionality.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * Toast Container Component
 * 
 * Renders all active toasts in a fixed position.
 */
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

/**
 * Toast Item Component
 * 
 * Individual toast notification with icon and close button.
 */
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-amber-800",
    info: "text-blue-800",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColors[toast.type]} animate-in slide-in-from-bottom-5`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${textColors[toast.type]}`}>{toast.title}</p>
        {toast.description && (
          <p className={`text-sm mt-1 ${textColors[toast.type]} opacity-80`}>
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 p-1 rounded hover:bg-black/5 ${textColors[toast.type]}`}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Toast Action Component
 * 
 * Optional action button for toast notifications.
 */
interface ToastActionProps {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
}

export function ToastAction({ label, onClick, variant = "default" }: ToastActionProps) {
  return (
    <Button variant={variant} size="sm" onClick={onClick} className="mt-2">
      {label}
    </Button>
  );
}

/**
 * Convenience function to create a toast hook
 * 
 * Example usage:
 * ```tsx
 * const { success, error } = useToast();
 * success("Operation successful", "Your changes have been saved");
 * ```
 */
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
  };
}
