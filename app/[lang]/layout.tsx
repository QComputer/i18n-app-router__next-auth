/**
 * Root Layout with Internationalization
 * 
 * This layout handles:
 * - Theme provider setup for dark/light mode
 * - Locale-aware navigation with RTL support
 * - Authentication-aware navigation bar
 * - Global CSS imports
 */

import { i18nConfig, Locale } from "@/i18n-config";
import "@/app/globals.css"
import LocaleSwitcher from "@/components/locale-switcher";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthNav } from "@/components/auth-nav";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { getDictionary } from "@/get-dictionary";


export const metadata = {
  title: "Appointment Booking",
  description: "Build your appointment booking system",
};

/**
 * Generate static params for all supported locales
 * This enables static generation of all locale variants
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

/**
 * Main Layout Component
 * 
 * @param props.children - The page content to render
 * @param props.params - Promise resolving to { lang: Locale }
 */
export default async function LangLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Await params (required in Next.js 16)
  const params = await props.params;
  const locale = params.lang as Locale;
  const dictionary = await getDictionary(locale);
  
  // Determine text direction based on locale
  // RTL languages: Persian (fa), Arabic (ar)
  const isRTL = locale === "fa" || locale === "ar"

  const { children } = props;

  // Get current session for auth-aware navigation
  const session = await auth();

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={"min-h-screen bg-background font-sans antialiased"}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation Bar */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container flex h-16 items-center justify-between px-4">
              {/* Logo / Brand */}
              <div className="flex items-center gap-6">
                <Link 
                  href={`/${locale}`} 
                  className="flex items-center space-x-2 font-bold text-xl"
                >
                  <span>Zero</span>
                </Link>
                
                {/* Main Navigation Links */}
                <div className="hidden md:flex items-center gap-4">
                  <Link 
                    href={`/${locale}/appointments`}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {(await dictionary).appointment.title}
                  </Link>
                  <Link 
                    href={`/${locale}/services`}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {dictionary.navigation.services}
                  </Link>
                </div>
              </div>

              {/* Right Side: Theme, Locale, Auth */}
              <div className="flex items-center gap-3">
                {/* Theme Switcher */}
                <ThemeSwitcher />
                
                {/* Locale Switcher */}
                <LocaleSwitcher />
                
                {/* Auth Navigation - Shows Sign In/Sign Up or User Avatar */}
                <AuthNav session={session} locale={locale} dictionary={dictionary} />
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
              <p className="text-center text-sm text-muted-foreground md:text-left">
                © {new Date().getFullYear()} Appointment Booking. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href={`/${locale}/privacy`} className="hover:text-primary">
                  Privacy
                </Link>
                <Link href={`/${locale}/terms`} className="hover:text-primary">
                  Terms
                </Link>
                <Link href={`/${locale}/contact`} className="hover:text-primary">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
