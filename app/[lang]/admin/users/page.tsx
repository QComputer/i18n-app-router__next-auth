import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getUsers } from "@/app/actions/admin/users"

export const dynamic = "force-dynamic"

export default async function UsersListPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get all users
  const usersData = await getUsers({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.users?.title || "User Management"}
        </h1>

        <a
          href={`/${lang}/admin/users/new`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          {dict.admin?.users?.newUser || "Create New User"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <p className="text-muted-foreground mb-4">
          {dict.admin?.users?.listDescription || "Manage all users in the system"}
        </p>

        {usersData.users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">{dict.admin?.users?.username || "Username"}</th>
                  <th className="p-3 text-left">{dict.admin?.users?.email || "Email"}</th>
                  <th className="p-3 text-left">{dict.admin?.users?.name || "Name"}</th>
                  <th className="p-3 text-left">{dict.admin?.users?.role || "Role"}</th>
                  <th className="p-3 text-left">{dict.admin?.common?.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersData.users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent">
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email || "-"}</td>
                    <td className="p-3">{user.name || "-"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dict.admin?.roles?.[user.role] || user.role}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <a
                        href={`/${lang}/admin/users/${user.id}`}
                        className="text-primary hover:underline"
                      >
                        {dict.admin?.common?.view || "View"}
                      </a>
                      <a
                        href={`/${lang}/admin/users/${user.id}/edit`}
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
            {dict.admin?.users?.noUsers || "No users found"}
          </p>
        )}
      </div>
    </div>
  )
}
