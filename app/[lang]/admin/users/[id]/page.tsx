import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getUserById } from "@/app/actions/admin/users"

export const dynamic = "force-dynamic"

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get user details
  const userData = await getUserById(id)

  if (!userData) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          {dict.admin?.users?.userDetails || "User Details"}
        </h1>
        <p className="text-muted-foreground">
          {dict.admin?.common?.notFound || "User not found"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.users?.userDetails || "User Details"}
        </h1>

        <a
          href={`/${lang}/admin/users/${id}/edit`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          {dict.admin?.common?.edit || "Edit"}
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {dict.admin?.users?.userDetails || "User Information"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.users?.username || "Username"}
              </label>
              <p className="text-sm">{userData.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.users?.email || "Email"}
              </label>
              <p className="text-sm">{userData.email || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.users?.name || "Name"}
              </label>
              <p className="text-sm">{userData.name || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.users?.phone || "Phone"}
              </label>
              <p className="text-sm">{userData.phone || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.admin?.users?.role || "Role"}
              </label>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {dict.admin?.roles?.[userData.role] || userData.role}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.common?.createdAt || "Created At"}
              </label>
              <p className="text-sm">{new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {dict.common?.updatedAt || "Updated At"}
              </label>
              <p className="text-sm">{new Date(userData.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {userData.staff && (
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">
              {dict.admin?.staff?.title || "Staff Information"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {dict.admin?.staff?.organizationId || "Organization"}
                </label>
                <p className="text-sm">{userData.staff.organization?.name || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {dict.admin?.staff?.hierarchy || "Hierarchy"}
                </label>
                <p className="text-sm">
                  {dict.admin?.hierarchy?.[userData.staff.hierarchy] || userData.staff.hierarchy}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {dict.admin?.staff?.bio || "Bio"}
                </label>
                <p className="text-sm">{userData.staff.bio || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {dict.admin?.staff?.isActive || "Active"}
                </label>
                <p className="text-sm">
                  {userData.staff.isActive ? dict.admin?.common?.yes || "Yes" : dict.admin?.common?.no || "No"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {dict.admin?.staff?.isDefault || "Default Staff"}
                </label>
                <p className="text-sm">
                  {userData.staff.isDefault ? dict.admin?.common?.yes || "Yes" : dict.admin?.common?.no || "No"}
                </p>
              </div>
            </div>
          </div>
        )}

        {userData.appointments.length > 0 && (
          <div className="md:col-span-2 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">
              {dict.appointment?.title || "Appointments"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">{dict.appointment?.appointmentDate || "Date"}</th>
                    <th className="p-3 text-left">{dict.appointment?.service || "Service"}</th>
                    <th className="p-3 text-left">{dict.appointment?.status || "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {userData.appointments.slice(0, 10).map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-accent">
                      <td className="p-3">
                        {new Date(appointment.startTime).toLocaleDateString()}
                      </td>
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
              {userData.appointments.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {dict.common?.andMore || "And"} {userData.appointments.length - 10}{" "}
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
