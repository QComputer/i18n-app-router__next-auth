export const i18nConfig = {
  defaultLocale: "fa",
  locales: ["fa","en", "ar", "tr"],
} as const;

export type Locale = (typeof i18nConfig)["locales"][number];
