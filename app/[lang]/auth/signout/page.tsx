import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { SignoutButton } from "@/components/ui/signout-button";
import Link from "next/link";

interface SignoutPageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function SignoutPage(props: SignoutPageProps) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {dictionary.signout.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.signout.description}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <SignoutButton 
            dictionary={dictionary} 
            lang={lang} 
            variant="default"
          />
          <Link href={`/${lang}/dashboard`}>
            <button className="px-4 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              {dictionary.signout.cancelButton}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
