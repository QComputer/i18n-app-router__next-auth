"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { i18nConfig } from "@/i18n-config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const redirectedPathname = (locale: string) => {
    if (!pathname) return "/"
    const segments = pathname.split("/")
    segments[1] = locale
    return segments.join("/")
  }

  const localeNames: Record<string, string> = {
    en: "English",
    fa: "فارسی",
    ar: "العربية",
    tr: "Türkçe",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18nConfig.locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link href={redirectedPathname(locale)}>
              {localeNames[locale] || locale}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
