
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getUsers } from "@/app/actions/admin/users"
import { getOrganizations } from "@/app/actions/admin/organizations"
import StaffCreateForm from "./staff-create-form"

export const dynamic = "force-dynamic"

export default async function StaffCreatePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  const [usersData, orgsData] = await Promise.all([
    getUsers({}),
    getOrganizations({}),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.staff?.newStaff || "Create New Staff"}
        </h1>

        <a
          href={`/${lang}/admin/staff`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border"
        >
          {dict.admin?.common?.back || "Back"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <StaffCreateForm
          users={usersData.users}
          organizations={orgsData.organizations}
          dict={dict}
          lang={lang}
        />
      </div>
    </div>
  )
}
