import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getOrganizationById } from "@/app/actions/admin/organizations"

export const dynamic = "force-dynamic"

export default async function OrganizationDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
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
          {dict.admin?.organizations?.organizationDetails || "Organization Details"}
        </h1>

        <div className="flex gap-2">
          <a
            href={`/${lang}/admin/organizations/${id}/edit`}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            {dict.admin?.common?.edit || "Edit"}
          </a>
          <a
            href={`/${lang}/admin/organizations/${id}/public-page`}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90"
          >
            {dict.admin?.organizations?.publicPageConfig || "Public Page Config"}
          </a>
          <a
            href={`/${lang}/law-firm/${orgData.slug}`}
            target="_blank"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {dict.admin?.organizations?.viewPublicPage || "View Public Page"}
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {dict.admin?.organizations?.organizationDetails || "Organization Information"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.name || "Name"}
              </label>
              <p className="text-sm">{orgData.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.slug || "Slug"}
              </label>
              <p className="text-sm">{orgData.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.type || "Type"}
              </label>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {dict.admin?.organizationTypes?.[orgData.type] || orgData.type}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.description || "Description"}
              </label>
              <p className="text-sm">{orgData.description || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.website || "Website"}
              </label>
              <p className="text-sm">{orgData.website || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.email || "Email"}
              </label>
              <p className="text-sm">{orgData.email || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.phone || "Phone"}
              </label>
              <p className="text-sm">{orgData.phone || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.address || "Address"}
              </label>
              <p className="text-sm">{orgData.address || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.timezone || "Timezone"}
              </label>
              <p className="text-sm">{orgData.timezone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.locale || "Locale"}
              </label>
              <p className="text-sm">{orgData.locale}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.organizations?.status || "Status"}
              </label>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {orgData.isActive ? dict.admin?.common?.active || "Active" : dict.admin?.common?.inactive || "Inactive"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.common?.createdAt || "Created At"}
              </label>
              <p className="text-sm">{new Date(orgData.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.common?.updatedAt || "Updated At"}
              </label>
              <p className="text-sm">{new Date(orgData.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {orgData.staffs.length > 0 && (
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">
              {dict.admin?.staff?.title || "Staff Members"} ({orgData.staffs.length})
            </h3>

            <div className="space-y-3">
              {orgData.staffs.slice(0, 10).map((staff) => (
                <div key={staff.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{staff.user?.name || staff.user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {dict.admin?.hierarchy?.[staff.hierarchy] || staff.hierarchy}
                    </p>
                    {staff.services.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {staff.services.length} {dict.service?.title || "Services"}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/${lang}/admin/staff/${staff.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {dict.admin?.common?.view || "View"}
                  </a>
                </div>
              ))}
              {orgData.staffs.length > 10 && (
                <p className="text-sm text-muted-foreground">
                  {dict.common?.andMore || "And"} {orgData.staffs.length - 10}{" "}
                  {dict.common?.more || "more"}
                </p>
              )}
            </div>
          </div>
        )}

        {orgData.serviceCategories.length > 0 && (
          <div className="md:col-span-2 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">
              {dict.serviceCategory?.title || "Service Categories"} ({orgData.serviceCategories.length})
            </h3>

            <div className="space-y-4">
              {orgData.serviceCategories.slice(0, 10).map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{category.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {category.services.length} {dict.service?.title || "Services"}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  )}
                  {category.services.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {category.services.slice(0, 3).map((service) => service.name).join(", ")}
                      {category.services.length > 3 && `, ${dict.common?.andMore || "And"} ${category.services.length - 3} ${dict.common?.more || "more"}`}
                    </div>
                  )}
                </div>
              ))}
              {orgData.serviceCategories.length > 10 && (
                <p className="text-sm text-muted-foreground">
                  {dict.common?.andMore || "And"} {orgData.serviceCategories.length - 10}{" "}
                  {dict.common?.more || "more"}
                </p>
              )}
            </div>
          </div>
        )}

        {orgData.appointments.length > 0 && (
          <div className="md:col-span-2 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">
              {dict.appointment?.title || "Appointments"} ({orgData.appointments.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">{dict.appointment?.appointmentDate || "Date"}</th>
                    <th className="p-3 text-left">{dict.appointment?.clientName || "Client"}</th>
                    <th className="p-3 text-left">{dict.appointment?.service || "Service"}</th>
                    <th className="p-3 text-left">{dict.appointment?.status || "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orgData.appointments.slice(0, 10).map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-accent">
                      <td className="p-3">
                        {new Date(appointment.startTime).toLocaleDateString()}
                      </td>
                      <td className="p-3">{appointment.clientName}</td>
                      <td className="p-3">{appointment.service?.name || "-"}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {dict.appointment?.status?.[appointment.status] || appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orgData.appointments.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {dict.common?.andMore || "And"} {orgData.appointments.length - 10}{" "}
                  {dict.common?.more || "more"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
