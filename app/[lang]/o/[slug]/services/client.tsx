/**
 * Organization Services Client Component
 * 
 * Client-side component for displaying categorized services with booking functionality.
 * Shows services organized by categories with available time slots.
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, startOfDay, isSameDay, isToday } from "date-fns"
import Link from "next/link"
import { 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  X
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toPersianDigits } from "@/lib/utils"

// Types
interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
}

interface Staff {
  id: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  currency: string
  color: string | null
  slotInterval: number
  staff: Staff
}

interface ServiceCategory {
  id: string
  name: string
  description: string | null
  services: Service[]
}

interface TimeSlot {
  time: string
  label: string
  available: boolean
}

// Helper function for translation
function useTranslation(locale: string, dictionary: Record<string, unknown>) {
  const t = (key: string, fallback: string): string => {
    const keys = key.split(".")
    let value: unknown = dictionary
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
      if (value === undefined) return fallback
    }
    return value as string || fallback
  }
  return t
}

// Step Indicator Component
function StepIndicator({ currentStep, steps, locale, t }: { 
  currentStep: number
  steps: { number: number; label: string }[]
  locale: string
  t: (key: string, fallback: string) => string
}) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors
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
              className={`w-12 sm:w-24 h-1 mx-2 transition-colors
                ${currentStep > step.number ? "bg-primary" : "bg-muted"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Service Card Component
function ServiceCard({ 
  service, 
  isSelected, 
  onSelect,
  locale,
  t
}: { 
  service: Service
  isSelected: boolean
  onSelect: () => void
  locale: string
  t: (key: string, fallback: string) => string
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {service.color && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: service.color }}
                />
              )}
              <h3 className="font-semibold">{service.name}</h3>
            </div>
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration} {locale === "fa" ? "دقیقه" : "min"}
              </span>
              {service.price !== null && (
                <span>
                  {locale === "fa" 
                    ? toPersianDigits(service.price.toLocaleString()) 
                    : service.price.toLocaleString()
                  } {service.currency}
                </span>
              )}
            </div>
            {/* Staff info */}
            {service.staff && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={service.staff.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {service.staff.user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">
                  {t("services.providedBy", "Provided by")}: {service.staff.user.name}
                </span>
              </div>
            )}
          </div>
          {isSelected && (
            <Badge variant="default" className="bg-primary">
              <Check className="h-3 w-3 mr-1" />
              {locale === "fa" ? "انتخاب شده" : "Selected"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Calendar Grid Component
function CalendarGrid({
  currentMonth,
  selectedDate,
  availableDates,
  onDateSelect,
  locale
}: {
  currentMonth: Date
  selectedDate: Date | null
  availableDates: Date[]
  onDateSelect: (date: Date) => void
  locale: string
}) {
  const today = startOfDay(new Date())
  const dayNames = locale === "fa" 
    ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    return newMonth
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: (Date | null)[] = []
    const startDayOfWeek = firstDay.getDay()
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }
    
    return days
  }

  const days = generateCalendarDays()
  const [viewMonth, setViewMonth] = useState<Date>(currentMonth)

  // Format Persian date
  const formatDatePersian = (date: Date, formatStr: string): string => {
    const persianMonths = [
      "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ]
    
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    
    return formatStr
      .replace("MMMM", persianMonths[month])
      .replace("yyyy", toPersianDigits(year.toString()))
      .replace("MM", toPersianDigits((month + 1).toString()))
      .replace("dd", toPersianDigits(day.toString()))
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 bg-muted">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setViewMonth(navigateMonth("prev"))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <h3 className="font-semibold">
          {locale === "fa" 
            ? formatDatePersian(viewMonth, "MMMM yyyy")
            : format(viewMonth, "MMMM yyyy")
          }
        </h3>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setViewMonth(navigateMonth("next"))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day, i) => (
          <div 
            key={i} 
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2 min-h-[60px]" />
          }

          const isPast = date < today
          const isAvailable = isDateAvailable(date)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isTodayDate = isToday(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => isAvailable && onDateSelect(date)}
              disabled={isPast || !isAvailable}
              className={`
                p-2 min-h-[60px] border-b border-r text-center transition-colors relative
                ${index % 7 === 6 ? "border-r-0" : ""}
                ${isSelected ? "bg-primary text-primary-foreground" : ""}
                ${!isSelected && isAvailable && !isPast ? "hover:bg-muted cursor-pointer" : ""}
                ${isPast || !isAvailable ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              <span className={`text-sm ${isSelected ? "font-bold" : ""}`}>
                {locale === "fa" ? toPersianDigits(date.getDate()) : date.getDate()}
              </span>
              {isTodayDate && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Time Slot Component
function TimeSlotComponent({ 
  slot, 
  isSelected, 
  onSelect,
  locale 
}: { 
  slot: TimeSlot
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

// Main Client Component
export default function OrganizationServicesClient({
  organization,
  serviceCategories,
  dictionary,
  lang
}: {
  organization: Organization
  serviceCategories: ServiceCategory[]
  dictionary: Record<string, unknown>
  lang: string
}) {
  const router = useRouter()
  const t = useTranslation(lang, dictionary)
  const isRtl = lang === "fa" || lang === "ar"
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  
  // Form fields
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [notes, setNotes] = useState("")
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Steps
  const steps = [
    { number: 1, label: t("services.selectService", "Select Service") },
    { number: 2, label: t("appointment.selectTime", "Date & Time") },
    { number: 3, label: t("appointment.yourInformation", "Your Info") },
    { number: 4, label: t("appointment.confirmBooking", "Confirm") },
  ]

  // Generate available dates (next 30 days)
  useEffect(() => {
    const generateDates = () => {
      const dates: Date[] = []
      const today = startOfDay(new Date())
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dates.push(date)
      }
      return dates
    }
    setAvailableDates(generateDates())
  }, [])

  // Fetch available slots when date changes
  const fetchSlots = async (date: Date, service: Service) => {
    try {
      const params = new URLSearchParams({
        date: date.toISOString(),
        serviceId: service.id,
      })
      
      // Always pass staffId since each service is provided by a single staff member
      if (service.staff) {
        params.append("staffId", service.staff.id)
      }
      
      // Use public slots API
      const response = await fetch(`/${lang}/api/slots/public?${params.toString()}`)
      if (response.ok) {
        const slots = await response.json()
        setAvailableSlots(slots)
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error)
      setAvailableSlots([])
    }
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    if (selectedService) {
      fetchSlots(date, selectedService)
    }
  }

  // Handle service selection
  const handleServiceSelect = (service: Service, category: ServiceCategory) => {
    setSelectedService(service)
    setSelectedCategory(category)
    setSelectedTime(null)
    setAvailableSlots([])
    if (selectedDate) {
      fetchSlots(selectedDate, service)
    }
  }

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  // Navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Submit booking
  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/${lang}/api/appointments/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate.toISOString(),
          time: selectedTime,
          clientName,
          clientPhone,
          clientEmail,
          notes,
          staffId: selectedService.staff?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Show success message and redirect
        alert(t("appointment.bookingSuccess", "Appointment booked successfully!"))
        router.push(`/${lang}/appointments`)
      } else {
        alert(data.error || t("appointment.bookingFailed", "Failed to book appointment"))
      }
    } catch (error) {
      console.error("Booking failed:", error)
      alert(t("appointment.bookingFailed", "Failed to book appointment"))
    } finally {
      setSubmitting(false)
    }
  }

  // Can proceed check
  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedService
      case 2: return !!selectedDate && !!selectedTime
      case 3: return !!clientName
      default: return true
    }
  }

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  // Check if there are any services
  const hasServices = serviceCategories.some(cat => cat.services.length > 0)

  return (
    <div className={isRtl ? "rtl" : "ltr"} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {organization.logo && (
                <img 
                  src={organization.logo} 
                  alt={organization.name} 
                  className="h-12 w-12 object-contain rounded-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{organization.name}</h1>
                {organization.description && (
                  <p className="text-sm text-muted-foreground">{organization.description}</p>
                )}
              </div>
            </div>
            {organization.phone && (
              <a 
                href={`tel:${organization.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {organization.phone}
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t("services.ourServices", "Our Services")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("services.selectServiceToBook", "Select a service to book an appointment")}
          </p>
        </div>

        {!hasServices ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("services.noServices", "No services available")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("services.noServicesDescription", "This organization has not added any services yet.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} steps={steps} locale={lang} t={t} />
            
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {serviceCategories
                  .filter(category => category.services.length > 0)
                  .map((category) => (
                    <div key={category.id}>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {category.name}
                        <Badge variant="secondary" className="ml-2">
                          {category.services.length}
                        </Badge>
                      </h2>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.services.map((service) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            isSelected={selectedService?.id === service.id}
                            onSelect={() => handleServiceSelect(service, category)}
                            locale={lang}
                            t={t}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && selectedService && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t("appointment.selectDate", "Select a Date & Time")}</CardTitle>
                  <CardDescription>
                    {selectedService.name} - {selectedService.duration} {lang === "fa" ? "دقیقه" : "minutes"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Calendar */}
                  <div>
                    <Label className="mb-2 block">{t("appointment.appointmentDate", "Date")}</Label>
                    <CalendarGrid
                      currentMonth={currentMonth}
                      selectedDate={selectedDate}
                      availableDates={availableDates}
                      onDateSelect={handleDateSelect}
                      locale={lang}
                    />
                  </div>
                  
                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <Label className="mb-2 block">{t("appointment.appointmentTime", "Time")}</Label>
                      {availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot) => (
                            <TimeSlotComponent
                              key={slot.time}
                              slot={slot}
                              isSelected={selectedTime === slot.time}
                              onSelect={() => handleTimeSelect(slot.time)}
                              locale={lang}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          {t("appointment.noAvailableSlots", "No available slots for this date")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Step 3: Client Information */}
            {currentStep === 3 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t("appointment.yourInformation", "Your Information")}</CardTitle>
                  <CardDescription>
                    {lang === "fa" ? "اطلاعات خود را وارد کنید" : "Enter your information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">{t("appointment.fullName", "Full Name")} *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="clientName"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder={t("appointment.fullName", "Full Name")}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">{t("appointment.phoneNumber", "Phone")}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="clientPhone"
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder={t("appointment.phoneNumber", "Phone")}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="clientEmail">{t("appointment.email", "Email")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="clientEmail"
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder={t("appointment.email", "Email")}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("appointment.additionalNotes", "Notes")}</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("appointment.notesPlaceholder", "Additional notes...")}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Step 4: Confirmation */}
            {currentStep === 4 && selectedService && selectedDate && selectedTime && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t("appointment.confirmBooking", "Confirm Booking")}</CardTitle>
                  <CardDescription>
                    {lang === "fa" ? "لطفاً اطلاعات را بررسی کنید" : "Please review your booking details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Service Info */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("services.service", "Service")}</p>
                      <p className="font-medium">{selectedService.name}</p>
                      {selectedCategory && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedCategory.name}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedService.duration} {lang === "fa" ? "دقیقه" : "minutes"}
                      </p>
                      {selectedService.staff && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("services.provider", "Provider")}: {selectedService.staff.user.name}
                        </p>
                      )}
                    </div>
                    
                    {/* Date & Time */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("appointment.dateAndTime", "Date & Time")}</p>
                      <p className="font-medium">
                        {lang === "fa" 
                          ? `${format(selectedDate, "EEEE dd MMMM yyyy")} - ${toPersianDigits(selectedTime)}`
                          : `${format(selectedDate, "EEEE, MMMM d, yyyy")} - ${selectedTime}`
                        }
                      </p>
                    </div>
                    
                    {/* Client Info */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("appointment.clientInfo", "Client Information")}</p>
                      <p className="font-medium">{clientName}</p>
                      {clientPhone && (
                        <p className="text-sm text-muted-foreground mt-1">{clientPhone}</p>
                      )}
                      {clientEmail && (
                        <p className="text-sm text-muted-foreground mt-1">{clientEmail}</p>
                      )}
                    </div>
                    
                    {notes && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{t("appointment.notes", "Notes")}</p>
                        <p className="font-medium">{notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                {t("common.back", "Back")}
              </Button>
              
              {currentStep < 4 ? (
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  {t("common.next", "Next")}
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting || !canProceed()}
                >
                  {submitting 
                    ? t("common.loading", "Loading...") 
                    : t("appointment.confirmBooking", "Confirm Booking")
                  }
                  <Check className="mr-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {organization.phone && (
                <a href={`tel:${organization.phone}`} className="flex items-center gap-1 hover:text-primary">
                  <Phone className="h-4 w-4" />
                  {organization.phone}
                </a>
              )}
              {organization.email && (
                <a href={`mailto:${organization.email}`} className="flex items-center gap-1 hover:text-primary">
                  <Mail className="h-4 w-4" />
                  {organization.email}
                </a>
              )}
            </div>
            {organization.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {organization.address}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
