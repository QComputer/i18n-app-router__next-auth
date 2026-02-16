import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getAllServices } from "@/app/actions/admin/services"

export const dynamic = "force-dynamic"

export default async function ServicesListPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get all services
  const servicesData = await getAllServices({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.services?.title || "Service Management"}
        </h1>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <p className="text-muted-foreground mb-4">
          {dict.admin?.services?.listDescription || "Manage all services in the system"}
        </p>

        {servicesData.services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">{dict.admin?.services?.name || "Name"}</th>
                  <th className="p-3 text-left">{dict.admin?.services?.description || "Description"}</th>
                  <th className="p-3 text-left">{dict.admin?.services?.duration || "Duration"}</th>
                  <th className="p-3 text-left">{dict.admin?.services?.price || "Price"}</th>
                  <th className="p-3 text-left">{dict.admin?.services?.organization || "Organization"}</th>
                  <th className="p-3 text-left">{dict.admin?.services?.status || "Status"}</th>
                  <th className="p-3 text-left">{dict.admin?.common?.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {servicesData.services.map((service) => (
                  <tr key={service.id} className="hover:bg-accent">
                    <td className="p-3">{service.name}</td>
                    <td className="p-3">{service.description || "-"}</td>
                    <td className="p-3">{service.duration} min</td>
                    <td className="p-3">{service.price ? `${service.price} ${service.currency}` : "-"}</td>
                    <td className="p-3">{service.serviceCategory.name || "- serviceCategory.name"}</td>
                    <td className="p-3">{service.staffId || "- stafId"}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive 
                          ? dict.admin?.common?.active || "Active" 
                          : dict.admin?.common?.inactive || "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <a
                        href={`/${lang}/admin/services/${service.id}`}
                        className="text-primary hover:underline"
                      >
                        {dict.admin?.common?.view || "View"}
                      </a>
                      <a
                        href={`/${lang}/admin/services/${service.id}/edit`}
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
            {dict.admin?.services?.noServices || "No services found"}
          </p>
        )}
      </div>
    </div>
  )
}
