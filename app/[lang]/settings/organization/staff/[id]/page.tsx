import { requireOrganizationAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getStaffById } from "@/app/actions/admin/staff"

export const dynamic = "force-dynamic"

export default async function StaffDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const user = await requireOrganizationAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get staff details
  const staffData = await getStaffById(id)

  if (!staffData || user.organizationId !== staffData.organizationId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          {dict.admin?.staff?.staffDetails || "Staff Details"}
        </h1>
        <p className="text-muted-foreground">
          {dict.admin?.common?.notFound || "Staff member not found"}
        </p>
      </div>
    )
  }

  return (
    <div 
      className="space-y-4 container mx-auto py-8 px-4 max-w-4xl"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.staff?.staffDetails || "Staff Details"}
        </h1>

        <a
          href={`/${lang}/settings/organization/staff/${id}/edit`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          {dict.admin?.common?.edit || "Edit"}
        </a>
      </div>

      <div className="grid gap-6 ">
        <div className="p-6 bg-card rounded-lg border">
          

          <div className="space-y-8">
            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.staff?.userId || "User"}
              </label>
              <div>
                <p className="font-medium">{staffData.user?.name || staffData.user?.username}</p>
                <p className="text-xs text-muted-foreground">{staffData.user?.email || "-"}</p>
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.staff?.organizationId || "Organization"}
              </label>
              <p className="text-sm">{staffData.organization?.name || "-"}</p>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.staff?.hierarchy || "Hierarchy"}
              </label>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {dict.admin?.hierarchy?.[staffData.hierarchy] || staffData.hierarchy}
              </span>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.staff?.bio || "Bio"}
              </label>
              <p className="text-sm">{staffData.bio || "-"}</p>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.staff?.isActive || "Active"}
              </label>
              <p className="text-sm">
                {staffData.isActive ? dict.admin?.common?.yes || "Yes" : dict.admin?.common?.no || "No"}
              </p>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.staff?.isDefault || "Default Staff"}
              </label>
              <p className="text-sm">
                {staffData.isDefault ? dict.admin?.common?.yes || "Yes" : dict.admin?.common?.no || "No"}
              </p>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.common?.createdAt || "Created At"}
              </label>
              <p className="text-sm">{new Date(staffData.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.common?.updatedAt || "Updated At"}
              </label>
              <p className="text-sm">{new Date(staffData.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {staffData.appointments.length > 0 && (
          <div className="md:col-span-2 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">
              {dict.appointment?.title || "Appointments"} ({staffData.appointments.length})
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
                  {staffData.appointments.slice(0, 10).map((appointment) => (
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
              {staffData.appointments.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {dict.common?.andMore || "And"} {staffData.appointments.length - 10}{" "}
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
