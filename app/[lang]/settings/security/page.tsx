/**
 * Security Settings Page
 * 
 * Page component that allows users to manage their security settings.
 * Users can change their password and view security-related information.
 * 
 * Route: /[lang]/settings/security
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, Lock, Shield, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { changePasswordAction } from "@/app/actions/security";
import React from "react";

// Type for the dictionary
type Dictionary = Record<string, unknown>;

// Helper to get translation
async function getTranslation(locale: string, key: string, fallback: string): Promise<string> {
  try {
    const dictionary = await getDictionary(locale as "en" | "fa" | "ar" | "tr");
    const keys = key.split(".");
    let value: unknown = dictionary;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
      if (value === undefined) return fallback;
    }
    return value as string || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

/**
 * Change password form component with server action integration
 */
function ChangePasswordForm({
  locale,
  dictionary
}: {
  locale: string;
  dictionary: Dictionary;
}) {
  // Translation helpers
  const t = {
    title: getTranslationSync(dictionary, "settings.security", "Security"),
    description: getTranslationSync(dictionary, "settings.securityDescription", "Manage your password and security settings"),
    changePassword: getTranslationSync(dictionary, "settings.changePassword", "Change Password"),
    currentPassword: getTranslationSync(dictionary, "auth.currentPassword", "Current Password"),
    newPassword: getTranslationSync(dictionary, "auth.newPassword", "New Password"),
    confirmPassword: getTranslationSync(dictionary, "auth.confirmPassword", "Confirm Password"),
    currentPasswordPlaceholder: getTranslationSync(dictionary, "auth.currentPasswordPlaceholder", "Enter current password"),
    newPasswordPlaceholder: getTranslationSync(dictionary, "auth.newPasswordPlaceholder", "Enter new password"),
    confirmPasswordPlaceholder: getTranslationSync(dictionary, "auth.confirmPasswordPlaceholder", "Confirm new password"),
    save: getTranslationSync(dictionary, "common.save", "Save"),
    saving: getTranslationSync(dictionary, "auth.saving", "Saving..."),
    success: getTranslationSync(dictionary, "settings.saveSuccess", "Settings saved successfully"),
    hasPassword: getTranslationSync(dictionary, "settings.hasPassword", "Password is set"),
    noPassword: getTranslationSync(dictionary, "settings.noPassword", "No password set"),
    passwordCreated: getTranslationSync(dictionary, "settings.passwordCreated", "Password created on"),
    tips: getTranslationSync(dictionary, "settings.passwordTips", "Password Tips"),
    tip1: getTranslationSync(dictionary, "settings.passwordTip1", "Use at least 8 characters"),
    tip2: getTranslationSync(dictionary, "settings.passwordTip2", "Include numbers and special characters"),
    tip3: getTranslationSync(dictionary, "settings.passwordTip3", "Avoid using personal information"),
  };

  // Initialize the server action with useActionState
  const [state, formAction, isPending] = React.useActionState<
    { message?: string; error?: string; success?: boolean; errors?: Record<string, string[]> },
    FormData
  >(changePasswordAction, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t.changePassword}
        </CardTitle>
        <CardDescription>
          {t.hasPassword} / {t.noPassword}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Success/Error messages */}
        {state?.success && state?.message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {state.message}
          </div>
        )}
        
        {state?.error && !state?.errors && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Hidden locale field */}
          <input type="hidden" name="locale" value={locale} />

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t.currentPassword}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder={t.currentPasswordPlaceholder}
              autoComplete="current-password"
            />
            {state?.errors?.currentPassword && (
              <p className="text-sm text-destructive">{state.errors.currentPassword[0]}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder={t.newPasswordPlaceholder}
              autoComplete="new-password"
            />
            {state?.errors?.newPassword && (
              <p className="text-sm text-destructive">{state.errors.newPassword[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              autoComplete="new-password"
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          {/* Password Tips */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t.tips}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t.tip1}</li>
              <li>• {t.tip2}</li>
              <li>• {t.tip3}</li>
            </ul>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Helper for synchronous translation
function getTranslationSync(dictionary: Dictionary, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Main security settings page component
 */
export default async function SecuritySettingsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang as Locale;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale) as unknown as Dictionary;

  // Translation helpers
  const t = {
    title: await getTranslation(locale, "settings.security", "Security"),
    description: await getTranslation(locale, "settings.securityDescription", "Manage your password and security settings"),
    passwordCreated: await getTranslation(locale, "settings.passwordCreated", "Password created on"),
    accountCreated: await getTranslation(locale, "settings.accountCreated", "Account created on"),
    noPassword: await getTranslation(locale, "settings.noPassword", "No password set"),
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/dashboard`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {"Back"}
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">
          {t.description}
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {"Account Security"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{"Password"}</p>
              <p className="font-medium">
                {user.password ? t.passwordCreated : t.noPassword}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.accountCreated}</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <ChangePasswordForm 
        locale={locale} 
        dictionary={dictionary} 
      />
    </div>
  );
}
