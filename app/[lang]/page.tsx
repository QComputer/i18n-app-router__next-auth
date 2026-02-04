import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import Counter from "@/components/counter";
import Link from "next/link";
import "@/app/globals.css"

export default async function IndexPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);

  return (
    <div>
      <Counter dictionary={dictionary.counter} />

      <div className=" min-h-screen flex flex-col items-center justify-center p-4">

        <h1 className="text-4xl font-bold mb-4">
          {lang === "fa" as Locale ? "رزرو نوبت" : "Appointment Booking"}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {lang === "fa" as Locale
            ? "سیستم رزرو نوبت خود را بسازید"
            : "Build your appointment booking system"}
        </p>

        <div className="flex gap-4">
          <Link
            href={`${lang}/auth/signin`}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {lang === "fa" as Locale ? "ورود" : "Sign In"}
          </Link>
          <Link
            href={`${lang}/auth/signup`}
            className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {lang === "fa" as Locale ? "ثبت‌نام" : "Sign Up"}
          </Link>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="text-muted-foreground space-y-2">
            {lang === "fa" as Locale ? (
              <>
                <li>✓ پشتیبانی از چند زبان (فارسی، انگلیسی، عربی، ترکی)</li>
                <li>✓ تم روشن/تاریک</li>
                <li>✓ رزرو نوبت</li>
                <li>✓ مدیریت خدمات</li>
                <li>✓ مدیریت کارکنان</li>
                <li>✓ تنظیمات ساعات کاری</li>
              </>
            ) : (
              <>
                <li>✓ Multi-language support (English, Persian, Arabic, Turkish)</li>
                <li>✓ Dark/Light theme</li>
                <li>✓ Appointment booking</li>
                <li>✓ Service management</li>
                <li>✓ Staff management</li>
                <li>✓ Business hours configuration</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
