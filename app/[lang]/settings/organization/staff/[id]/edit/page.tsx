
import { requireOrganizationAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getStaffById } from "@/app/actions/admin/staff"
import StaffEditForm from "./staff-edit-form"

export const dynamic = "force-dynamic"

export default async function StaffEditPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const user = await requireOrganizationAdmin()
  const staffData = await getStaffById(id)
  
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

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
    <div className="space-y-6 container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.staff?.editStaff || "Edit Staff"}
        </h1>

        <a
          href={`/${lang}/settings/organization/staff/${id}`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border"
        >
          {dict.admin?.common?.back || "Back"}
        </a>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <StaffEditForm
          staffData={staffData}
          dict={dict}
          lang={lang}
        />
      </div>
    </div>
  )
}
