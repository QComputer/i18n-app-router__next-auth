import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import { auth } from "@/lib/auth"
import { DashboardSidebar } from "./dashboard-sidebar"

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang;
  const { children } = props;
  
  // Get the session using auth() from lib/auth (which uses NextAuth)
  const session = await auth();
  
  // If no session, redirect to signin
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }
  
  const dict = await getDictionary(locale as Locale);

  return (
    <DashboardSidebar 
      locale={locale} 
      dict={dict} 
      session={session}
    >
      {children}
    </DashboardSidebar>
  )
}
