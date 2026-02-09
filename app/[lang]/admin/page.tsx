import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getUsers } from "@/app/actions/admin/users"
import { getOrganizations } from "@/app/actions/admin/organizations"
import { getAllStaff } from "@/app/actions/admin/staff"
import { getAllServices } from "@/app/actions/admin/services"
import { getAllAppointments } from "@/app/actions/admin/appointments"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get dashboard statistics
  const [userStats, orgStats, staffStats, serviceStats, appointmentStats] = await Promise.all([
    getUsers({ limit: 5 }),
    getOrganizations({ limit: 5 }),
    getAllStaff({ limit: 5 }),
    getAllServices({ limit: 5 }),
    getAllAppointments({ limit: 5 }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{dict.admin?.dashboard?.title || "Admin Dashboard"}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">
            {dict.admin?.dashboard?.totalUsers || "Total Users"}
          </h3>
          <p className="text-2xl font-bold">{userStats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {dict.admin?.dashboard?.latestUsers || "Latest 5 users"}
          </p>
          <ul className="mt-2 space-y-1">
            {userStats.users.slice(0, 5).map((u) => (
              <li key={u.id} className="text-sm">
                {u.name || u.username} ({u.role})
              </li>
            ))}
          </ul>
        </div>

        {/* Total Organizations Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">
            {dict.admin?.dashboard?.totalOrganizations || "Total Organizations"}
          </h3>
          <p className="text-2xl font-bold">{orgStats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {dict.admin?.dashboard?.latestOrganizations || "Latest 5 organizations"}
          </p>
          <ul className="mt-2 space-y-1">
            {orgStats.organizations.slice(0, 5).map((org) => (
              <li key={org.id} className="text-sm">
                {org.name} ({org.type})
              </li>
            ))}
          </ul>
        </div>

        {/* Total Staff Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">
            {dict.admin?.dashboard?.totalStaff || "Total Staff"}
          </h3>
          <p className="text-2xl font-bold">{staffStats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {dict.admin?.dashboard?.latestStaff || "Latest 5 staff members"}
          </p>
          <ul className="mt-2 space-y-1">
            {staffStats.staffs.slice(0, 5).map((staff) => (
              <li key={staff.id} className="text-sm">
                {staff.user?.name || staff.user?.username} ({staff.hierarchy})
              </li>
            ))}
          </ul>
        </div>

        {/* Total Services Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">
            {dict.admin?.dashboard?.totalServices || "Total Services"}
          </h3>
          <p className="text-2xl font-bold">{serviceStats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {dict.admin?.dashboard?.latestServices || "Latest 5 services"}
          </p>
          <ul className="mt-2 space-y-1">
            {serviceStats.services.slice(0, 5).map((service) => (
              <li key={service.id} className="text-sm">
                {service.name} ({service.organization?.name})
              </li>
            ))}
          </ul>
        </div>

        {/* Total Appointments Card */}
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">
            {dict.admin?.dashboard?.totalAppointments || "Total Appointments"}
          </h3>
          <p className="text-2xl font-bold">{appointmentStats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {dict.admin?.dashboard?.latestAppointments || "Latest 5 appointments"}
          </p>
          <ul className="mt-2 space-y-1">
            {appointmentStats.appointments.slice(0, 5).map((apt) => (
              <li key={apt.id} className="text-sm">
                {apt.clientName} - {apt.service?.name} ({apt.status})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">
          {dict.admin?.dashboard?.quickActions || "Quick Actions"}
        </h3>
        
        <div className="grid gap-4 md:grid-cols-4">
          <a
            href={`/${lang}/admin/users/new`}
            className="block p-4 rounded-lg hover:bg-accent text-center"
          >
            <div className="text-lg mb-1">👤</div>
            <div className="text-sm font-medium">
              {dict.admin?.dashboard?.createUser || "Create User"}
            </div>
          </a>

          <a
            href={`/${lang}/admin/organizations/new`}
            className="block p-4 rounded-lg hover:bg-accent text-center"
          >
            <div className="text-lg mb-1">🏢</div>
            <div className="text-sm font-medium">
              {dict.admin?.dashboard?.createOrganization || "Create Organization"}
            </div>
          </a>

          <a
            href={`/${lang}/admin/staff/new`}
            className="block p-4 rounded-lg hover:bg-accent text-center"
          >
            <div className="text-lg mb-1">👥</div>
            <div className="text-sm font-medium">
              {dict.admin?.dashboard?.createStaff || "Create Staff"}
            </div>
          </a>

          <a
            href={`/${lang}/admin/services`}
            className="block p-4 rounded-lg hover:bg-accent text-center"
          >
            <div className="text-lg mb-1">📋</div>
            <div className="text-sm font-medium">
              {dict.admin?.dashboard?.viewServices || "View Services"}
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
