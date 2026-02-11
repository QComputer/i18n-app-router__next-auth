/**
 * Cancel Appointment Page
 * 
 * Page component for canceling an appointment.
 * Requires a cancellation reason.
 * 
 * Route: /[lang]/appointments/[id]/cancel
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import Link from "next/link"
import { ArrowRight, AlertTriangle, Calendar, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cancelAppointmentAction } from "@/app/actions/appointments"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Helper to safely get translation strings
 */
function getTranslation(dictionary: Record<string, unknown>, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Main cancel appointment page component
 */
export default async function CancelAppointmentPage(props: {
  params: Promise<{ lang: string; id: string }>
}) {
  const params = await props.params;
  const locale = params.lang as Locale;
  const appointmentId = params.id;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get organization ID
  const organizationId = session.user.organizationId || "default";
  if (!organizationId) {
    redirect(`/${locale}/appointments`);
  }

  // Fetch the appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: true,
      staff: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!appointment || appointment.organizationId !== organizationId) {
    redirect(`/${locale}/appointments`);
  }

  // For STAFF users, check if appointment is assigned to them
  if (session.user.role === "STAFF" && session.user.hierarchy === "MERCHANT" && session.user.staffId) {
    if (appointment.staffId !== session.user.staffId) {
      redirect(`/${locale}/appointments`);
    }
  }

  // Check if appointment can be cancelled
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    redirect(`/${locale}/appointments/${appointmentId}`);
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale);
  
  // Translation helpers
  const t = {
    title: getTranslation(dictionary, "appointment.cancelAppointment", "Cancel Appointment"),
    description: getTranslation(dictionary, "appointment.cancelConfirm", "Are you sure you want to cancel this appointment?"),
    reason: getTranslation(dictionary, "appointment.cancellationReason", "Cancellation Reason"),
    reasonPlaceholder: getTranslation(dictionary, "appointment.cancellationReasonPlaceholder", "Please provide a reason for cancellation"),
    confirm: getTranslation(dictionary, "appointment.confirmCancel", "Confirm Cancellation"),
    back: getTranslation(dictionary, "common.back", "Back"),
    service: getTranslation(dictionary, "appointment.service", "Service"),
    date: getTranslation(dictionary, "appointment.appointmentDate", "Date"),
    time: getTranslation(dictionary, "appointment.appointmentTime", "Time"),
    client: getTranslation(dictionary, "appointment.clientInfo", "Client"),
  };

  // Format appointment date and time
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/appointments/${appointmentId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        {t.back}
      </Link>

      {/* Warning Banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-amber-800 font-medium">{t.title}</p>
          <p className="text-amber-700 text-sm mt-1">{t.description}</p>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </div>

      {/* Appointment Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {getTranslation(dictionary, "appointment.appointmentDetails", "Appointment Details")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{t.service}</p>
              <p className="font-medium">{appointment.service.name}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{t.date}</p>
              <p className="font-medium">{formatDate(appointment.startTime)}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{t.time}</p>
              <p className="font-medium">{formatTime(appointment.startTime)}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{t.client}</p>
              <p className="font-medium">{appointment.clientName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            {t.confirm}
          </CardTitle>
          <CardDescription>
            {getTranslation(dictionary, "appointment.cancellationNotice", "This action cannot be undone. The appointment will be marked as cancelled.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={cancelAppointmentAction.bind(null, appointmentId, locale)} className="space-y-6">
            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">{t.reason}</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder={t.reasonPlaceholder}
                rows={4}
              />
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <input
                type="checkbox"
                id="confirm"
                name="confirm"
                value="true"
                required
                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="confirm" className="text-sm text-red-800">
                {getTranslation(dictionary, "appointment.cancelConfirmationText", "I understand that this action will permanently cancel this appointment and cannot be reversed.")}
              </label>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/${locale}/appointments/${appointmentId}`}>
                  <ArrowRight className="ml-2 h-4 w-4" />
                  {t.back}
                </Link>
              </Button>
              <Button type="submit" variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                {t.confirm}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
