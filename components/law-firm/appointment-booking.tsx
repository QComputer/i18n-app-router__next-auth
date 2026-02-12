"use client"

import { useState } from "react"
import { Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Organization } from "@/lib/generated/prisma/client"

interface AppointmentBookingProps {
  organization: Organization
  dictionary: Record<string, unknown>
  lang: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary = any

export function AppointmentBooking({ organization, dictionary, lang }: AppointmentBookingProps) {
  const dict = dictionary as Dictionary
  const isRtl = lang === "fa" || lang === "ar"
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    try {
      // TODO: Submit appointment request to API
      // For now, simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to submit appointment request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate available time slots (9 AM to 5 PM)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (isSuccess) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {dict.appointment?.bookingSuccess || "Your appointment has been booked successfully!"}
              </h2>
              <p className="text-slate-600 mb-6">
                We will contact you shortly to confirm your appointment. 
                Thank you for choosing {organization.name}.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                variant="outline"
              >
                {dict.appointment?.bookAnother || "Book Another Appointment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {dict.lawfirm?.appointment?.title || "Book Your Appointment"}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {dict.lawfirm?.appointment?.subtitle || 
              "Schedule a free consultation with our experienced attorneys. We'll review your case and provide expert legal advice."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              {dict.appointment?.newAppointment || "Request an Appointment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Info */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{dict.appointment?.service || "Service"}:</span>{" "}
                  {dict.appointment?.freeConsultation || "Free Consultation"}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-medium">{dict.appointment?.duration || "Duration"}:</span>{" "}
                  30-60 minutes
                </p>
              </div>

              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  {dict.appointment?.fullName || "Full Name"} *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={dict.appointment?.namePlaceholder || "Enter your full name"}
                  required
                />
              </div>

              {/* Phone and Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    {dict.appointment?.phoneNumber || "Phone Number"} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={dict.appointment?.phonePlaceholder || "+1 (555) 123-4567"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    {dict.appointment?.email || "Email Address"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={dict.appointment?.emailPlaceholder || "your@email.com"}
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    {dict.appointment?.selectDate || "Preferred Date"} *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={getMinDate()}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    {dict.appointment?.selectTime || "Preferred Time"} *
                  </Label>
                  <select
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">{dict.appointment?.selectTime || "Select a time"}</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  {dict.appointment?.additionalNotes || "Additional Notes"}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={dict.appointment?.notesPlaceholder || 
                    "Please describe your legal matter briefly..."}
                  rows={4}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3"
              >
                {isSubmitting 
                  ? (dict.appointment?.sending || "Sending...") 
                  : (dict.appointment?.confirmBooking || "Confirm Booking")
                }
              </Button>

              {/* Disclaimer */}
              <p className="text-xs text-slate-500 text-center">
                {dict.appointment?.disclaimer || 
                  "By submitting this form, you agree that this does not create an attorney-client relationship. " +
                  "We will contact you within 24 business hours to confirm your appointment."}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
