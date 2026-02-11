"use client";

/**
 * Security Form Client Component
 */

import { useState, useTransition } from "react";
import { Shield, Lock, Key, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { changePasswordAction } from "@/app/actions/security";

type Dictionary = Record<string, unknown>;

function getTranslation(dictionary: Dictionary, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

interface SecurityFormProps {
  locale: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
  };
  dictionary: Dictionary;
}

export function SecurityForm({ locale, user, dictionary }: SecurityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{
    message?: string;
    error?: string;
    success?: boolean;
    errors?: Record<string, string[]>;
  }>({});

  const t = {
    title: getTranslation(dictionary, "settings.security", "Security"),
    description: getTranslation(dictionary, "settings.securityDescription", "Manage your password and security settings"),
    currentPassword: getTranslation(dictionary, "settings.currentPassword", "Current Password"),
    newPassword: getTranslation(dictionary, "settings.newPassword", "New Password"),
    confirmPassword: getTranslation(dictionary, "settings.confirmPassword", "Confirm Password"),
    passwordPlaceholder: getTranslation(dictionary, "auth.passwordPlaceholder", "Enter password"),
    changePassword: getTranslation(dictionary, "settings.changePassword", "Change Password"),
    changing: getTranslation(dictionary, "settings.changing", "Changing..."),
    passwordRequirements: getTranslation(dictionary, "auth.passwordRequirements", "At least 8 characters with uppercase, lowercase, and number"),
    success: getTranslation(dictionary, "settings.passwordChanged", "Password changed successfully"),
  };

  async function handleAction(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await changePasswordAction(state, formData);
        setState(result);
      } catch (err) {
        setState({ error: "An unexpected error occurred" });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success && state?.message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {state.message}
          </div>
        )}
        
        {state?.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {state.error}
          </div>
        )}

        <form action={handleAction} className="space-y-6">
          <input type="hidden" name="locale" value={locale} />

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t.currentPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder={t.passwordPlaceholder}
                className="pl-9"
                required
              />
            </div>
            {state?.errors?.currentPassword && (
              <p className="text-sm text-destructive">{state.errors.currentPassword[0]}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t.newPassword}</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder={t.passwordPlaceholder}
                className="pl-9"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t.passwordRequirements}
            </p>
            {state?.errors?.newPassword && (
              <p className="text-sm text-destructive">{state.errors.newPassword[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t.passwordPlaceholder}
                className="pl-9"
                required
              />
            </div>
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              <Lock className="h-4 w-4 mr-2" />
              {isPending ? t.changing : t.changePassword}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
