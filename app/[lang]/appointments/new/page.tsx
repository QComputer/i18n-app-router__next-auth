/**
 * New Appointment Booking Page
 * 
 * Multi-step appointment booking form with:
 * 1. Service selection
 * 2. Date and time selection
 * 3. Staff selection (optional)
 * 4. Client information
 * 5. Confirmation
 * 
 * Route: /[lang]/appointments/new
 */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary"
import { i18nConfig, type Locale } from "@/i18n-config"
import prisma from "@/lib/db/prisma"
import { addDays, format, startOfDay } from "date-fns"
import { faIR } from "date-fns/locale"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Calendar, Clock, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { 
  getAvailableDates, 
  formatDatePersian, 
  getDayName,
  toPersianDigits
} from "@/lib/appointments/slots"

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }))
}

/**
 * Step indicator component
 */
function StepIndicator({ 
  currentStep, 
  steps,
  locale 
}: { 
  currentStep: number
  steps: { number: number; label: string }[]
  locale: string
}) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${currentStep >= step.number 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
                }
              `}
            >
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            <span className="text-xs mt-1 hidden sm:block">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-12 sm:w-24 h-1 mx-2 
                ${currentStep > step.number ? "bg-primary" : "bg-muted"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Service card component
 */
function ServiceCard({ 
  service, 
  isSelected, 
  onSelect 
}: { 
  service: { id: string; name: string; duration: number; price: number | null; description: string | null }
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
            )}
            <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration} دقیقه
              </span>
              {service.price !== null && (
                <span>
                  {service.price.toLocaleString()} ریال
                </span>
              )}
            </div>
          </div>
          {isSelected && (
            <Badge variant="default" className="bg-primary">
              <Check className="h-3 w-3 mr-1" />
              انتخاب شده
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Time slot component
 */
function TimeSlot({ 
  slot, 
  isSelected, 
  onSelect,
  locale 
}: { 
  slot: { time: string; label: string; available: boolean }
  isSelected: boolean
  onSelect: () => void
  locale: string
}) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      disabled={!slot.available}
      onClick={onSelect}
      className={`
        ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}
        ${locale === "fa" ? "font-farsi" : ""}
      `}
    >
      {locale === "fa" ? toPersianDigits(slot.label) : slot.label}
    </Button>
  )
}

/**
 * Date selector component
 */
function DateSelector({ 
  dateWithSlots, 
  isSelected, 
  onSelect 
}: { 
  dateWithSlots: { formattedDate: string; dayName: string; isHoliday: boolean; slots: unknown[] }
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${dateWithSlots.isHoliday ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-4 text-center">
        <p className="text-sm text-muted-foreground">{dateWithSlots.dayName}</p>
        <p className="text-xl font-bold mt-1">{dateWithSlots.formattedDate}</p>
        {dateWithSlots.isHoliday && (
          <Badge variant="destructive" className="mt-2">تعطیل</Badge>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Main new appointment page component
 */
export default async function NewAppointmentPage(props: {
  params: Promise<{ lang: string }>
}) {
  const params = await props.params
  const locale = params.lang as Locale
  
  // Get current session
  const session = await auth()
  
  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }
  
  // Get dictionary for translations
  const dictionary = await getDictionary(locale)
  
  // Get user's organization ID
  const organizationId = session.user.organizationId || "default"
  
  // Fetch services
  const services = await prisma.service.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  })
  
  // Fetch staff members
  const staffMembers = await prisma.staff.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  })
  
  // Translation helpers
  const dict = dictionary as unknown as Record<string, Record<string, string>>
  const t = {
    title: dict.appointment?.title || "Appointments",
    newAppointment: dict.appointment?.newAppointment || "New Appointment",
    bookNow: dict.appointment?.bookNow || "Book Now",
    selectService: dict.appointment?.selectService || "Select a Service",
    selectDate: dict.appointment?.selectDate || "Select a Date",
    selectTime: dict.appointment?.selectTime || "Select a Time",
    selectStaff: dict.appointment?.selectStaff || "Select Staff (Optional)",
    yourInformation: dict.appointment?.yourInformation || "Your Information",
    fullName: dict.appointment?.fullName || "Full Name",
    phoneNumber: dict.appointment?.phoneNumber || "Phone Number",
    email: dict.appointment?.email || "Email Address",
    additionalNotes: dict.appointment?.additionalNotes || "Additional Notes",
    confirmBooking: dict.appointment?.confirmBooking || "Confirm Booking",
    availableSlots: dict.appointment?.availableSlots || "Available Slots",
    noAvailableSlots: dict.appointment?.noAvailableSlots || "No available slots for this date",
    selectDifferentDate: dict.appointment?.selectDifferentDate || "Please select a different date",
    back: dict.common?.back || "Back",
    next: dict.common?.next || "Next",
  }
  
  // Steps for the booking process
  const steps = [
    { number: 1, label: locale === "fa" ? "انتخاب خدمت" : "Service" },
    { number: 2, label: locale === "fa" ? "انتخاب زمان" : "Date & Time" },
    { number: 3, label: locale === "fa" ? "اطلاعات شما" : "Your Info" },
    { number: 4, label: locale === "fa" ? "تأیید" : "Confirm" },
  ]
  
  // Get available dates for the next 14 days
  const availableDates = await getAvailableDates(
    organizationId,
    new Date(),
    14,
    services[0]?.id || "",
    undefined,
    locale
  )
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t.newAppointment}</h1>
        <p className="text-muted-foreground mt-2">{t.bookNow}</p>
      </div>
      
      {/* Step Indicator */}
      <StepIndicator currentStep={1} steps={steps} locale={locale} />
      
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t.selectService}</CardTitle>
          <CardDescription>
            {locale === "fa" 
              ? "یکی از خدمات زیر را انتخاب کنید" 
              : "Select one of the services below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={false}
                onSelect={() => {}}
              />
            ))}
          </div>
          
          {/* No Services Message */}
          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {locale === "fa" 
                  ? "هیچ خدمتی یافت نشد" 
                  : "No services found"}
              </p>
              <Link href={`/${locale}/services/new`}>
                <Button variant="outline">
                  {locale === "fa" ? "افزودن خدمت جدید" : "Add New Service"}
                </Button>
              </Link>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Link href={`/${locale}/appointments`}>
              <Button variant="outline">
                <ArrowRight className="ml-2 h-4 w-4" />
                {t.back}
              </Button>
            </Link>
            <Button>
              {t.next}
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
