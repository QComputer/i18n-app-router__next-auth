import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getOrganizationById } from "@/app/actions/admin/organizations"
import { PublicPageConfigForm } from "./public-page-config-form"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ lang: string; id: string }>
}

export default async function OrganizationPublicPageConfigPage({ params }: PageProps) {
  const { lang, id } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get organization details
  const orgData = await getOrganizationById(id)

  if (!orgData) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          {dict.admin?.organizations?.publicPageConfig || "Public Page Configuration"}
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
        <div>
          <h1 className="text-3xl font-bold">
            {dict.admin?.organizations?.publicPageConfig || "Public Page Configuration"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {orgData.name}
          </p>
        </div>
        
        <div className="flex gap-2">
          <a
            href={`/${lang}/admin/organizations/${id}`}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90"
          >
            {dict.admin?.common?.back || "Back"}
          </a>
          <a
            href={`/${lang}/law-firm/${orgData.slug}`}
            target="_blank"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            {dict.admin?.organizations?.viewPublicPage || "View Public Page"}
          </a>
        </div>
      </div>

      <PublicPageConfigForm 
        organization={orgData}
        dictionary={dict}
        lang={lang}
      />
    </div>
  )
}
