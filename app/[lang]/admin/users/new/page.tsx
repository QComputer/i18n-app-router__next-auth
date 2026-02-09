
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import UserCreateForm from "./user-create-form"

export const dynamic = "force-dynamic"

export default async function UserCreatePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.users?.newUser || "Create New User"}
        </h1>

        <a
          href={`/${lang}/admin/users`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border"
        >
          {dict.admin?.common?.back || "Back"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <UserCreateForm
          dict={dict}
          lang={lang}
        />
      </div>
    </div>
  )
}
