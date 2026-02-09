import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getAllStaff } from "@/app/actions/admin/staff"

export const dynamic = "force-dynamic"

export default async function StaffListPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get all staff members
  const staffData = await getAllStaff({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.staff?.title || "Staff Management"}
        </h1>

        <a
          href={`/${lang}/admin/staff/new`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          {dict.admin?.staff?.newStaff || "Create New Staff"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <p className="text-muted-foreground mb-4">
          {dict.admin?.staff?.listDescription || "Manage all staff members in the system"}
        </p>

        {staffData.staffs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">{dict.admin?.staff?.userId || "User"}</th>
                  <th className="p-3 text-left">{dict.admin?.staff?.organizationId || "Organization"}</th>
                  <th className="p-3 text-left">{dict.admin?.staff?.hierarchy || "Hierarchy"}</th>
                  <th className="p-3 text-left">{dict.admin?.staff?.isActive || "Active"}</th>
                  <th className="p-3 text-left">{dict.admin?.staff?.isDefault || "Default"}</th>
                  <th className="p-3 text-left">{dict.admin?.common?.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staffData.staffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-accent">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{staff.user?.name || staff.user?.username}</p>
                        <p className="text-xs text-muted-foreground">{staff.user?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="p-3">{staff.organization?.name || "-"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {dict.admin?.hierarchy?.[staff.hierarchy] || staff.hierarchy}
                      </span>
                    </td>
                    <td className="p-3">
                      {staff.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {dict.admin?.common?.active || "Active"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {dict.admin?.common?.inactive || "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {staff.isDefault ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {dict.admin?.common?.yes || "Yes"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {dict.admin?.common?.no || "No"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      <a
                        href={`/${lang}/admin/staff/${staff.id}`}
                        className="text-primary hover:underline"
                      >
                        {dict.admin?.common?.view || "View"}
                      </a>
                      <a
                        href={`/${lang}/admin/staff/${staff.id}/edit`}
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
            {dict.admin?.staff?.noStaff || "No staff members found"}
          </p>
        )}
      </div>
    </div>
  )
}
