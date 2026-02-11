"use client";

/**
 * Theme Form Client Component
 */

import { useState, useTransition } from "react";
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateThemeAction } from "@/app/actions/profile";
import { useTheme } from "next-themes";

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

interface ThemeFormProps {
  locale: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    themeMode: string;
  };
  dictionary: Dictionary;
}

const themeOptions = [
  { value: "LIGHT", label: "Light", icon: Sun, description: "Always use light mode" },
  { value: "DARK", label: "Dark", icon: Moon, description: "Always use dark mode" },
  { value: "SYSTEM", label: "System", icon: Monitor, description: "Match system settings" },
];

export function ThemeForm({ locale, user, dictionary }: ThemeFormProps) {
  const { setTheme, theme: currentTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{
    message?: string;
    error?: string;
    success?: boolean;
  }>({});

  const t = {
    title: getTranslation(dictionary, "settings.theme", "Theme"),
    description: getTranslation(dictionary, "settings.themeDescription", "Choose your preferred theme"),
    selectTheme: getTranslation(dictionary, "settings.selectTheme", "Select Theme"),
    saving: getTranslation(dictionary, "settings.saving", "Saving..."),
    save: getTranslation(dictionary, "common.save", "Save"),
    success: getTranslation(dictionary, "settings.themeSaved", "Theme saved successfully"),
  };

  async function handleAction(formData: FormData) {
    const themeMode = formData.get("themeMode") as string;
    
    startTransition(async () => {
      try {
        // Update theme locally first for immediate feedback
        setTheme(themeMode.toLowerCase());
        
        const result = await updateThemeAction(state, formData);
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
          <Palette className="h-5 w-5" />
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

          {/* Theme Selection */}
          <div className="space-y-4">
            <Label>{t.selectTheme}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = (currentTheme || user.themeMode).toUpperCase() === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const form = document.getElementById("theme-form") as HTMLFormElement;
                      const input = document.getElementById(`theme-${option.value}`) as HTMLInputElement;
                      if (input) {
                        form?.requestSubmit();
                      }
                    }}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      id={`theme-${option.value}`}
                      name="themeMode"
                      value={option.value}
                      className="sr-only"
                      defaultChecked={isSelected}
                    />
                    <Icon className={`h-8 w-8 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {option.description}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              <Palette className="h-4 w-4 mr-2" />
              {isPending ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
