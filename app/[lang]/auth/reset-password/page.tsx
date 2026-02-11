/**
 * Reset Password Page
 * 
 * Page component that allows users to reset their password using a valid reset token.
 * The token is validated before showing the form, and the password is updated securely.
 * 
 * Route: /[lang]/auth/reset-password
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordAction } from "@/app/actions/reset-password";
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
 * Password strength indicator component
 * Shows visual feedback on password requirements
 */
function PasswordStrengthIndicator({ 
  password 
}: { 
  password: string 
}) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains a special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <div className="space-y-1 mt-2">
      {requirements.map((req, index) => (
        <div 
          key={index}
          className={`flex items-center gap-2 text-xs ${
            req.met ? "text-green-600" : "text-muted-foreground"
          }`}
        >
          <CheckCircle className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
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
 * Reset password form component with server action integration
 */
function ResetPasswordForm({
  locale,
  token,
  dictionary
}: {
  locale: string;
  token: string;
  dictionary: Record<string, unknown>;
}) {
  // State for showing/hiding password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");

  // Initialize the server action with useActionState for form state management
  const initialState: ActionState = {};
  const [state, action, isPending] = useActionState<
    ActionState,
    FormData
  >(resetPasswordAction, initialState);

  // Translation helpers
  const t = {
    title: getT(dictionary, "auth.resetPasswordTitle", "Reset Password"),
    description: getT(dictionary, "auth.resetPasswordDescription", "Enter your new password below"),
    newPassword: getT(dictionary, "auth.newPassword", "New Password"),
    confirmPassword: getT(dictionary, "auth.confirmPassword", "Confirm Password"),
    passwordPlaceholder: getT(dictionary, "auth.passwordPlaceholder", "Enter new password"),
    confirmPlaceholder: getT(dictionary, "auth.confirmPasswordPlaceholder", "Confirm your password"),
    submitButton: getT(dictionary, "auth.resetPasswordButton", "Reset Password"),
    submitting: getT(dictionary, "common.loading", "Resetting..."),
    successRedirect: getT(dictionary, "auth.redirectingToSignin", "Redirecting to sign in..."),
    backToHome: getT(dictionary, "auth.backToHome", "Back to Home"),
  };

  // Create form data with the token
  const handleSubmit = (formData: FormData) => {
    formData.set("token", token);
    action(formData);
  };

  // Success state - show success message and redirect
  if (state?.success && state?.message) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t.title}</h2>
            <p className="text-muted-foreground mb-4">{state.message}</p>
            <p className="text-sm text-muted-foreground">{t.successRedirect}</p>
          </div>
          
          {/* Auto-redirect to signin after 3 seconds */}
          <meta httpEquiv="refresh" content="3;url=/auth/signin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t.title}</CardTitle>
        <CardDescription className="text-center">
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error message display */}
        {state?.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {state.error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          {/* New Password input */}
          <div className="space-y-2">
            <Label htmlFor="password">{t.newPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                className="pl-9 pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          {/* Confirm Password input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmPlaceholder}
                className="pl-9 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? t.submitting : t.submitButton}
          </Button>
        </form>

        {/* Back to home link */}
        <div className="mt-4 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowRight className="ml-1 h-3 w-3" />
            {t.backToHome}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main reset password page component
 */
export default function ResetPasswordPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [locale, setLocale] = useState("en");
  const [token, setToken] = useState<string>("");
  const [dictionary, setDictionary] = useState<Record<string, unknown>>({});
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Get params
    Promise.all([props.params, props.searchParams]).then(([params, searchParams]) => {
      setLocale(params.lang);
      setToken(searchParams.token || "");
      
      // Fetch dictionary
      fetch(`/${params.lang}/dictionary.json`)
        .then((res) => res.json())
        .then((data) => setDictionary(data))
        .catch(() => setDictionary({}));

      // Validate token
      if (searchParams.token) {
        validateToken(searchParams.token, params.lang);
      } else {
        setValidationError("Invalid Reset Link");
        setIsValidating(false);
      }
    });
  }, [props.params, props.searchParams]);

  const validateToken = async (tokenValue: string, lang: string) => {
    try {
      const response = await fetch(`/api/auth/validate-token?token=${encodeURIComponent(tokenValue)}`);
      const data = await response.json();
      if (!data.isValid) {
        setValidationError(data.error || "This password reset link has expired.");
      }
    } catch {
      setValidationError("Failed to validate token");
    } finally {
      setIsValidating(false);
    }
  };

  const t = {
    appName: getT(dictionary, "common.appName", "Appointment Booking"),
    invalidTitle: "Invalid Reset Link",
    invalidDescription: "This password reset link is invalid or has expired.",
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/50">
        <div className="text-center">
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/50">
        {/* Logo or App Name */}
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2">
            <Lock className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{t.appName}</span>
          </Link>
        </div>
        
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t.invalidTitle}</h2>
              <p className="text-muted-foreground mb-4">{t.invalidDescription}</p>
              <Link href={`/${locale}/auth/forgot-password`}>
                <Button>Request New Reset Link</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/50">
      {/* Logo or App Name */}
      <div className="mb-8 text-center">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <Lock className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">{t.appName}</span>
        </Link>
      </div>

      {/* Reset password form */}
      <ResetPasswordForm 
        locale={locale} 
        token={token} 
        dictionary={dictionary} 
      />
    </div>
  );
}
