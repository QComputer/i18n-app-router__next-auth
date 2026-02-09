
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getOrganizationById } from "@/app/actions/admin/organizations"
import OrganizationEditForm from "./organization-edit-form"

export const dynamic = "force-dynamic"

export default async function OrganizationEditPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  const orgData = await getOrganizationById(id)

  if (!orgData) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          {dict.admin?.organizations?.organizationDetails || "Organization Details"}
        </h1>
        <p className="text-muted-foreground">
          {dict.admin?.common?.notFound || "Organization not found"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.organizations?.editOrganization || "Edit Organization"}
        </h1>

        <a
          href={`/${lang}/admin/organizations/${id}`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border"
        >
          {dict.admin?.common?.back || "Back"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <OrganizationEditForm
          orgData={orgData}
          dict={dict}
          lang={lang}
        />
      </div>
    </div>
  )
}
