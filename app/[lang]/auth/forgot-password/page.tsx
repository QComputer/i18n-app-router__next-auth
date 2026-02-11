/**
 * Forgot Password Page
 * 
 * Page component that allows users to request a password reset.
 * Users can enter their email or username to receive a reset link.
 * 
 * Route: /[lang]/auth/forgot-password
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordAction } from "@/app/actions/forgot-password";
import { useActionState } from "react";

/**
 * Type definition for the form state returned by server actions
 */
interface ActionState {
  message?: string;
  error?: string;
  success?: boolean;
}

/**
 * Helper function to safely get translation strings
 */
function getT(dictionary: Record<string, unknown>, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Forgot password form component with server action integration
 * 
 * Uses React 19's useActionState for form state management
 */
function ForgotPasswordForm({
  locale,
  dictionary
}: {
  locale: string;
  dictionary: Record<string, unknown>;
}) {
  // Initialize the server action with useActionState for form state management
  // useActionState was introduced in React 19 as a replacement for useFormState
  const initialState: ActionState = {};
  const [state, action, isPending] = useActionState<
    ActionState,
    FormData
  >(forgotPasswordAction, initialState);

  // Translation helpers - use safe access pattern
  const t = {
    title: getT(dictionary, "auth.forgotPasswordTitle", "Forgot Password"),
    description: getT(dictionary, "auth.forgotPasswordDescription", "Enter your email or username to receive a password reset link"),
    emailOrUsername: getT(dictionary, "auth.emailOrUsername", "Email or Username"),
    emailOrUsernamePlaceholder: getT(dictionary, "auth.emailOrUsernamePlaceholder", "Enter your email or username"),
    submitButton: getT(dictionary, "auth.sendResetLink", "Send Reset Link"),
    submitting: getT(dictionary, "common.loading", "Sending..."),
    backToSignin: getT(dictionary, "auth.backToSignin", "Back to Sign In"),
    successMessage: getT(dictionary, "auth.resetEmailSent", "If an account exists, you will receive a reset link"),
    errorMessage: getT(dictionary, "auth.errorOccurred", "An error occurred"),
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
        <CardDescription className="text-center">
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Success or error message display */}
        {state?.message && !state?.error && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {state.message}
          </div>
        )}
        
        {state?.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          {/* Email or Username input */}
          <div className="space-y-2">
            <Label htmlFor="identifier">{t.emailOrUsername}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder={t.emailOrUsernamePlaceholder}
                className="pl-9"
                required
                disabled={!!state?.message && !state?.error}
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || (!!state?.message && !state?.error)}
          >
            {isPending ? t.submitting : t.submitButton}
          </Button>
        </form>

        {/* Back to sign in link */}
        <div className="mt-4 text-center">
          <Link
            href={`/${locale}/auth/signin`}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowRight className="ml-1 h-3 w-3" />
            {t.backToSignin}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main forgot password page component
 * 
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default function ForgotPasswordPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const [locale, setLocale] = useState("en");
  const [dictionary, setDictionary] = useState<Record<string, unknown>>({});

  useEffect(() => {
    // Get locale from params
    props.params.then((params) => {
      setLocale(params.lang);
      
      // Fetch dictionary dynamically
      fetch(`/${params.lang}/dictionary.json`)
        .then((res) => res.json())
        .then((data) => setDictionary(data))
        .catch(() => setDictionary({}));
    });
  }, [props.params]);

  const t = {
    appName: getT(dictionary, "common.appName", "Appointment Booking"),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/50">
      {/* Logo or App Name */}
      <div className="mb-8 text-center">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <Lock className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">{t.appName}</span>
        </Link>
      </div>

      {/* Forgot password form */}
      <ForgotPasswordForm locale={locale} dictionary={dictionary} />
    </div>
  );
}
