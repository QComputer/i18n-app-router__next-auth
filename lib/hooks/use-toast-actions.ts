/**
 * Server Action Toast Hook
 * 
 * Provides promise-based toast notifications for server actions.
 */

"use client";

import { useToast, Toast } from "@/components/ui/toast";

export type ActionResult<T = void> = 
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; code?: string };

interface ToastOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export function useActionToast() {
  const { addToast } = useToast();

  function showLoading(message?: string): string {
    const id = Math.random().toString(36).substring(2, 9);
    addToast({
      type: "info",
      title: "Processing...",
      description: message,
      duration: 0,
    } as Toast & { id: string });
    return id;
  }

  function hideLoading(id: string): void {
    addToast({
      type: "info",
      title: "Processing...",
    } as Toast & { id: string });
  }

  async function executeAction<T>(
    action: Promise<ActionResult<T>>,
    options: ToastOptions = {}
  ): Promise<ActionResult<T>> {
    const {
      onSuccess,
      onError,
      successMessage = "Operation completed successfully",
      errorMessage = "Operation failed",
    } = options;

    const loadingId = showLoading(options.loadingMessage);

    try {
      const result = await action;
      hideLoading(loadingId);

      if (result.success) {
        addToast({ type: "success", title: successMessage, description: result.message });
        onSuccess?.(result.data);
      } else {
        addToast({ type: "error", title: errorMessage, description: result.error });
        onError?.(result.error);
      }

      return result;
    } catch (err) {
      hideLoading(loadingId);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      addToast({ type: "error", title: errorMessage });
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  return {
    executeAction,
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
