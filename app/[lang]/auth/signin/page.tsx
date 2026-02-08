import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { SigninForm } from "@/components/ui/signin-form";
import Link from "next/link";

interface SigninPageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function SigninPage(props: SigninPageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {dictionary.common.appName}
          </h1>
        </div>
        
        <SigninForm dictionary={dictionary} lang={lang} />
        
      </div>
    </div>
  );
}
