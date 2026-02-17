/**
 * Service Appointments List Component
 * 
 * Client component that displays a paginated list of appointments for a specific service.
 * Supports Persian locale and follows existing application patterns.
 * 
 * Route: Used in /services/[id] page
 */

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toPersianDigits } from "@/lib/utils"

type Appointment = {
  id: string
  startTime: Date
  endTime: Date
  status: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  staff: {
    id: string
    user: {
      name: string | null
      image: string | null
    }
  } | null
}

type Props = {
  serviceId: string
  initialAppointments: Appointment[]
  initialTotal: number
  initialPage: number
  initialTotalPages: number
  locale: string
  translations: {
    title: string
    noAppointments: string
    noAppointmentsDesc: string
    client: string
    date: string
    time: string
    staff: string
    status: string
    viewDetails: string
    previous: string
    next: string
    page: string
    of: string
    pending: string
    confirmed: string
    cancelled: string
    completed: string
  }
}

export function ServiceAppointmentsList({
  serviceId,
  initialAppointments,
  initialTotal,
  initialPage,
  initialTotalPages,
  locale,
  translations,
}: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [total, setTotal] = useState(initialTotal)
  const [isPending, startTransition] = useTransition()

  const loadPage = (newPage: number) => {
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          page: newPage.toString(),
          limit: "10",
        })
        
        const response = await fetch(`/api/service-appointments/${serviceId}?${params}`)
        const data = await response.json()
        
        if (data.appointments) {
          setAppointments(data.appointments)
          setPage(data.page)
          setTotalPages(data.totalPages)
          setTotal(data.total)
        }
      } catch (error) {
        console.error("Failed to load appointments:", error)
      }
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "success" | "warning" | "destructive"; label: string }> = {
      PENDING: { variant: "warning", label: translations.pending },
      CONFIRMED: { variant: "success", label: translations.confirmed },
      CANCELLED: { variant: "destructive", label: translations.cancelled },
      COMPLETED: { variant: "secondary", label: translations.completed },
    }
    
    const statusInfo = statusMap[status] || { variant: "secondary" as const, label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    if (locale === "fa") {
      return d.toLocaleDateString("fa-IR")
    }
    return d.toLocaleDateString()
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    if (locale === "fa") {
      return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (initialAppointments.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{translations.noAppointments}</h3>
            <p className="text-muted-foreground">{translations.noAppointmentsDesc}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Appointments List */}
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/${locale}/appointments/${appointment.id}`}
              className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">
                      {appointment.clientName}
                    </span>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {locale === "fa" 
                          ? toPersianDigits(formatDate(appointment.startTime))
                          : formatDate(appointment.startTime)
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {locale === "fa"
                          ? toPersianDigits(formatTime(appointment.startTime))
                          : formatTime(appointment.startTime)
                        }
                      </span>
                    </div>
                    {appointment.staff && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {appointment.staff.user.image && (
                            <AvatarImage src={appointment.staff.user.image} alt={appointment.staff.user.name || ""} />
                          )}
                          <AvatarFallback className="text-xs">
                            {appointment.staff.user.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {appointment.staff.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  {translations.viewDetails}
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {locale === "fa" 
                ? `${toPersianDigits(((page - 1) * 10 + 1).toString())}-${toPersianDigits(Math.min(page * 10, total).toString())} ${translations.of} ${toPersianDigits(total.toString())}`
                : `${((page - 1) * 10 + 1)}-${Math.min(page * 10, total)} ${translations.of} ${total}`
              }
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(page - 1)}
                disabled={page <= 1 || isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    {translations.previous}
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {locale === "fa" 
                  ? toPersianDigits(page.toString())
                  : page
                } {translations.of} {locale === "fa" ? toPersianDigits(totalPages.toString()) : totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(page + 1)}
                disabled={page >= totalPages || isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {translations.next}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
