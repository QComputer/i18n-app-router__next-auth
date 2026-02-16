"use client";

/**
 * Profile Form Client Component
 */

import { useState, useTransition } from "react";
import { User, Mail, Phone, Globe, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileAction } from "@/app/actions/profile";
import { updateProfileImage } from "@/app/actions/profile-image";
import { ImageUploadWithCrop } from "@/components/ui/image-upload";

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

interface ProfileFormProps {
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
}

export function ProfileForm({ locale, user, dictionary }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{
    message?: string;
    error?: string;
    success?: boolean;
    errors?: Record<string, string[]>;
  }>({});
  
  const [currentImage, setCurrentImage] = useState(user.image || "");
  const [imageUpdating, setImageUpdating] = useState(false);

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

  async function handleAction(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await updateProfileAction(state, formData);
        setState(result);
      } catch (err) {
        setState({ error: "An unexpected error occurred" });
      }
    });
  }

  // Handle image upload
  const handleImageChange = async (imageUrl: string) => {
    setImageUpdating(true);
    try {
      await updateProfileImage(imageUrl);
      setCurrentImage(imageUrl);
      setState({ success: true, message: "Profile image updated successfully" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update image";
      setState({ error: message });
    } finally {
      setImageUpdating(false);
    }
  }

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

          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentImage || undefined} alt={user.name || "User"} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <ImageUploadWithCrop
                value={currentImage}
                onChange={handleImageChange}
                disabled={imageUpdating}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t.avatarRequirements}
              </p>
            </div>
          </div>

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
