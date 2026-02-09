import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth/admin"
import { getDictionary } from "@/get-dictionary"
import { type Locale } from "@/i18n-config"
import { getAllAppointments } from "@/app/actions/admin/appointments"

export const dynamic = "force-dynamic"

export default async function AppointmentsListPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const user = await requireAdmin()
  const dictionary = await getDictionary(lang as Locale)
  const dict = dictionary as unknown as Record<string, any>

  // Get all appointments
  const appointmentsData = await getAllAppointments({})

  // Helper to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(lang, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {dict.admin?.appointments?.title || "Appointment Management"}
        </h1>
      </div>

      <div className="p-6 bg-card rounded-lg border">
        <p className="text-muted-foreground mb-4">
          {dict.admin?.appointments?.listDescription || "Manage all appointments in the system"}
        </p>

        {appointmentsData.appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">{dict.admin?.appointments?.clientName || "Client Name"}</th>
                  <th className="p-3 text-left">{dict.admin?.appointments?.service || "Service"}</th>
                  <th className="p-3 text-left">{dict.admin?.appointments?.organization || "Organization"}</th>
                  <th className="p-3 text-left">{dict.admin?.appointments?.startTime || "Start Time"}</th>
                  <th className="p-3 text-left">{dict.admin?.appointments?.status || "Status"}</th>
                  <th className="p-3 text-left">{dict.admin?.common?.actions || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointmentsData.appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-accent">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.clientEmail || "-"}</p>
                      </div>
                    </td>
                    <td className="p-3">{appointment.service?.name || "-"}</td>
                    <td className="p-3">{appointment.organization?.name || "-"}</td>
                    <td className="p-3">{formatDate(appointment.startTime)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dict.admin?.appointmentStatus?.[appointment.status] || appointment.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      <a
                        href={`/${lang}/admin/appointments/${appointment.id}`}
                        className="text-primary hover:underline"
                      >
                        {dict.admin?.common?.view || "View"}
                      </a>
                      <a
                        href={`/${lang}/admin/appointments/${appointment.id}/edit`}
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
            {dict.admin?.appointments?.noAppointments || "No appointments found"}
          </p>
        )}
      </div>
    </div>
  )
}
