
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import OrganizationCreateForm from "./organization-create-form"

export const dynamic = "force-dynamic"

export default async function OrganizationCreatePage({
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
          {dict.admin?.organizations?.newOrganization || "Create New Organization"}
        </h1>

        <a
          href={`/${lang}/admin/organizations`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border"
        >
          {dict.admin?.common?.back || "Back"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <OrganizationCreateForm
          dict={dict}
          lang={lang}
        />
      </div>
    </div>
  )
}
