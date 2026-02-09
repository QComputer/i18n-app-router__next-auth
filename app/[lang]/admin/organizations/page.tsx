import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getOrganizations } from "@/app/actions/admin/organizations"

export const dynamic = "force-dynamic"

export default async function OrganizationsListPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get all organizations
  const organizationsData = await getOrganizations({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.organizations?.title || "Organization Management"}
        </h1>

        <a
          href={`/${lang}/admin/organizations/new`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          {dict.admin?.organizations?.newOrganization || "Create New Organization"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <p className="text-muted-foreground mb-4">
          {dict.admin?.organizations?.listDescription || "Manage all organizations in the system"}
        </p>

        {organizationsData.organizations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">{dict.admin?.organizations?.name || "Name"}</th>
                  <th className="p-3 text-left">{dict.admin?.organizations?.type || "Type"}</th>
                  <th className="p-3 text-left">{dict.admin?.organizations?.email || "Email"}</th>
                  <th className="p-3 text-left">{dict.admin?.organizations?.phone || "Phone"}</th>
                  <th className="p-3 text-left">{dict.admin?.organizations?.status || "Status"}</th>
                  <th className="p-3 text-left">{dict.admin?.common?.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {organizationsData.organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-accent">
                    <td className="p-3">{org.name}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {dict.admin?.organizationTypes?.[org.type] || org.type}
                      </span>
                    </td>
                    <td className="p-3">{org.email || "-"}</td>
                    <td className="p-3">{org.phone || "-"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {org.isActive ? dict.admin?.common?.active || "Active" : dict.admin?.common?.inactive || "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <a
                        href={`/${lang}/admin/organizations/${org.id}`}
                        className="text-primary hover:underline"
                      >
                        {dict.admin?.common?.view || "View"}
                      </a>
                      <a
                        href={`/${lang}/admin/organizations/${org.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        {dict.admin?.common?.edit || "Edit"}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">
            {dict.admin?.organizations?.noOrganizations || "No organizations found"}
          </p>
        )}
      </div>
    </div>
  )
}
