import { i18nConfig} from "@/i18n-config";
import "@/app/globals.css"
import LocaleSwitcher from "@/components/locale-switcher";


export const metadata = {
  title: "i18n within app router - Vercel Examples",
  description: "How to do i18n in Next.js 15 within app router",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LangLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const isRTL = params.lang === "fa" || params.lang === "ar"

  const { children } = props;

  return (
    
    <html lang={params.lang} dir={isRTL ? "rtl" : "ltr"} className="dark">
      <body className={"min-h-screen bg-background font-sans antialiased"}>
        <LocaleSwitcher />
        {children}
      </body>
    </html>
  );
}
