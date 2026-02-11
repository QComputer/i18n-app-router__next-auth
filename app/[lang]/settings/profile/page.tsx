/**
 * Profile Settings Page
 * 
 * Page component that allows users to manage their profile settings.
 * Users can update their name, email, phone, and preferred language.
 * 
 * Route: /[lang]/settings/profile
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, User, Mail, Phone, Globe, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileAction } from "@/app/actions/profile";

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

// Type for the dictionary
type Dictionary = Record<string, unknown>;

/**
 * Helper function to safely get translation strings
 */
function getTranslation(dictionary: Dictionary, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Profile form component with server action integration
 */
function ProfileForm({
  locale,
  user,
  dictionary
}: {
  locale: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    username: string;
    image: string | null;
    locale: string;
  };
  dictionary: Dictionary;
}) {
  // Initialize the server action with useActionState
  const [state, formAction, isPending] = React.useActionState<
    { message?: string; error?: string; success?: boolean; errors?: Record<string, string[]> },
    FormData
  >(updateProfileAction, {});

  // Translation helpers
  const t = {
    title: getTranslation(dictionary, "settings.profile", "Profile"),
    description: getTranslation(dictionary, "settings.profileDescription", "Manage your personal information"),
    name: getTranslation(dictionary, "auth.name", "Name"),
    namePlaceholder: getTranslation(dictionary, "auth.namePlaceholder", "Enter your name"),
    email: getTranslation(dictionary, "auth.email", "Email"),
    emailPlaceholder: getTranslation(dictionary, "auth.emailPlaceholder", "Enter your email"),
    phone: getTranslation(dictionary, "auth.phone", "Phone"),
    phonePlaceholder: getTranslation(dictionary, "auth.phonePlaceholder", "Enter your phone number"),
    locale: getTranslation(dictionary, "settings.language", "Language"),
    username: getTranslation(dictionary, "auth.username", "Username"),
    save: getTranslation(dictionary, "common.save", "Save"),
    saving: getTranslation(dictionary, "auth.saving", "Saving..."),
    success: getTranslation(dictionary, "settings.saveSuccess", "Settings saved successfully"),
    usernameDescription: getTranslation(dictionary, "auth.usernameDescription", "Your unique identifier"),
    uploadAvatar: getTranslation(dictionary, "auth.uploadAvatar", "Upload Photo"),
    avatarRequirements: getTranslation(dictionary, "auth.avatarRequirements", "JPG, PNG or GIF. Max size 2MB"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Success/Error messages */}
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

        <form action={formAction} className="space-y-6">
          {/* Hidden locale field */}
          <input type="hidden" name="locale" value={locale} />

          {/* Avatar section */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm" className="mb-2">
                <Upload className="h-4 w-4 mr-2" />
                {t.uploadAvatar}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t.avatarRequirements}
              </p>
            </div>
          </div>

          {/* Username (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="username">{t.username}</Label>
            <Input
              id="username"
              name="username"
              value={user.username}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">{t.usernameDescription}</p>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name || ""}
                placeholder={t.namePlaceholder}
                className="pl-9"
              />
            </div>
            {state?.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email || ""}
                placeholder={t.emailPlaceholder}
                className="pl-9"
              />
            </div>
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Phone input */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone || ""}
                placeholder={t.phonePlaceholder}
                className="pl-9"
              />
            </div>
            {state?.errors?.phone && (
              <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
            )}
          </div>

          {/* Language selection */}
          <div className="space-y-2">
            <Label htmlFor="locale">{t.locale}</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select name="locale" defaultValue={user.locale}>
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder={t.locale} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fa">فارسی (Persian)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  <SelectItem value="tr">Türkçe (Turkish)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Import React for useActionState
import React from "react";

/**
 * Main profile settings page component
 */
export default async function ProfileSettingsPage(props: {
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
      name: true,
      email: true,
      phone: true,
      username: true,
      image: true,
      locale: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale) as unknown as Dictionary;

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
        <h1 className="text-3xl font-bold">{"Profile"}</h1>
        <p className="text-muted-foreground mt-1">
          {"Manage your personal information"}
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm 
        locale={locale} 
        user={user} 
        dictionary={dictionary} 
      />
    </div>
  );
}
