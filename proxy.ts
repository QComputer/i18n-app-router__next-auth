import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { i18nConfig } from "./i18n-config";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

export { auth as proxy } from "@/lib/auth"

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = Array.from(i18nConfig.locales);

  // Use negotiator and intl-localematcher to get best lang
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  const lang = matchLocale(languages, locales, i18nConfig.defaultLocale);

  return lang;
}

export function proxy0(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('PROXY--------------->pathname:', pathname);

  // // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // // If you have one
  // if (
  //   [
  //     '/manifest.json',
  //     '/favicon.ico',
  //     // Your other files in `public`
  //   ].includes(pathname)
  // )
  //   return

  // Check if there is any supported lang in the pathname
  const pathnameIsMissingLocale = i18nConfig.locales.every(
    (lang) =>
      !pathname.startsWith(`/${lang}/`) && pathname !== `/${lang}`,
  );

  // Redirect if there is no lang
  if (pathnameIsMissingLocale) {
    const lang = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(
        `/${lang}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};