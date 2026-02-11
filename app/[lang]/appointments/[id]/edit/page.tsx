/**
 * Edit Appointment Page
 * 
 * Page component for editing existing appointments.
 * Allows modifying service, date, time, staff, and client information.
 * 
 * Route: /[lang]/appointments/[id]/edit
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import { format } from "date-fns"
import Link from "next/link"
import { Calendar, Clock, User, Mail, Phone, FileText, ArrowRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateAppointmentAction } from "@/app/actions/appointments"

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
 * Main edit appointment page component
 */
export default async function EditAppointmentPage(props: {
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

  // Fetch services
  const services = await prisma.service.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch staff members
  let staffMembers: { id: string; user: { name: string | null; username: string } }[] = [];
  
  if (session.user.role !== "STAFF" || session.user.hierarchy !== "MERCHANT") {
    staffMembers = await prisma.staff.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
  } else if (session.user.staffId) {
    // Staff users can only see themselves
    const staff = await prisma.staff.findUnique({
      where: { id: session.user.staffId as string },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });
    if (staff) {
      staffMembers = [{
        id: staff.id,
        user: staff.user,
      }];
    }
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale);
  
  // Translation helpers
  const t = {
    title: getTranslation(dictionary, "appointment.editAppointment", "Edit Appointment"),
    description: getTranslation(dictionary, "appointment.editAppointmentDescription", "Update appointment details"),
    service: getTranslation(dictionary, "appointment.service", "Service"),
    selectService: getTranslation(dictionary, "appointment.selectService", "Select a Service"),
    date: getTranslation(dictionary, "appointment.appointmentDate", "Date"),
    time: getTranslation(dictionary, "appointment.appointmentTime", "Time"),
    duration: getTranslation(dictionary, "appointment.duration", "Duration"),
    staff: getTranslation(dictionary, "appointment.staff", "Staff"),
    selectStaff: getTranslation(dictionary, "appointment.selectStaff", "Select Staff (Optional)"),
    clientInfo: getTranslation(dictionary, "appointment.clientInfo", "Client Information"),
    fullName: getTranslation(dictionary, "appointment.fullName", "Full Name"),
    phone: getTranslation(dictionary, "appointment.phoneNumber", "Phone Number"),
    email: getTranslation(dictionary, "appointment.email", "Email Address"),
    notes: getTranslation(dictionary, "appointment.notes", "Notes"),
    additionalNotes: getTranslation(dictionary, "appointment.additionalNotes", "Additional Notes"),
    save: getTranslation(dictionary, "common.save", "Save"),
    back: getTranslation(dictionary, "common.back", "Back"),
  };

  // Format current appointment time
  const formatTime = (date: Date) => format(new Date(date), "HH:mm");
  const formatDate = (date: Date) => format(new Date(date), "yyyy-MM-dd");

  // Get duration in minutes from service
  const selectedService = services.find(s => s.id === appointment.serviceId);
  const duration = selectedService?.duration || 30;

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

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.description}</p>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAppointmentAction.bind(null, appointmentId, locale)} className="space-y-6">
            {/* Hidden locale field */}
            <input type="hidden" name="locale" value={locale} />

            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="serviceId">{t.service} *</Label>
              <Select name="serviceId" defaultValue={appointment.serviceId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectService} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration} min {service.price ? `• ${service.price.toLocaleString()} ریال` : ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{t.date} *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={formatDate(appointment.startTime)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">{t.time} *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={formatTime(appointment.startTime)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t.duration}: <span className="font-medium">{duration} دقیقه</span>
              </p>
            </div>

            {/* Staff Selection */}
            <div className="space-y-2">
              <Label htmlFor="staffId">{t.staff}</Label>
              <Select name="staffId" defaultValue={appointment.staffId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectStaff} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— {t.selectStaff} —</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.user.name || staff.user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {t.clientInfo}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">{t.fullName} *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientName"
                      name="clientName"
                      type="text"
                      defaultValue={appointment.clientName}
                      placeholder={t.fullName}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">{t.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientPhone"
                      name="clientPhone"
                      type="tel"
                      defaultValue={appointment.clientPhone || ""}
                      placeholder={t.phone}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clientEmail">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      defaultValue={appointment.clientEmail || ""}
                      placeholder={t.email}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={appointment.notes || ""}
                  placeholder={t.additionalNotes}
                  className="pl-9 min-h-[100px]"
                />
              </div>
            </div>

            {/* Status Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {getTranslation(dictionary, "appointment.status", "Status")}: 
                <span className="font-medium ml-1">{appointment.status}</span>
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/${locale}/appointments/${appointmentId}`}>
                  <ArrowRight className="ml-2 h-4 w-4" />
                  {t.back}
                </Link>
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {t.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
