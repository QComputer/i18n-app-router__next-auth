import { i18nConfig, Locale} from "@/i18n-config";
import "@/app/globals.css"
import LocaleSwitcher from "@/components/locale-switcher";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";


export const metadata = {
  title: "Appointment Booking",
  description: "Build your appointment booking system",
};

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

export default async function LangLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const isRTL = params.lang === "fa" || params.lang === "ar"

  const { children } = props;

  return (
    <html lang={params.lang} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={"min-h-screen bg-background font-sans antialiased"}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex items-center justify-end gap-2 p-4">
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
