/**
 * Organization Staff Client Component
 * 
 * Client-side component for displaying staff members grouped by ServiceField.
 * Shows staff organized by their service field categories with professional cards.
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Users,
  Briefcase,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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

interface StaffMember {
  id: string
  hierarchy: string
  bio: string | null
  isActive: boolean
  isDefault: boolean
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
}

interface ServiceField {
  id: string
  name: string
  staffs: StaffMember[]
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

// Staff Card Component
function StaffCard({ 
  staff, 
  locale,
  t
}: { 
  staff: StaffMember
  locale: string
  t: (key: string, fallback: string) => string
}) {
  const isRtl = locale === "fa" || locale === "ar"
  
  // Get hierarchy badge variant
  const getHierarchyBadge = (hierarchy: string) => {
    switch (hierarchy) {
      case "OWNER":
        return <Badge className="bg-amber-500">Owner</Badge>
      case "MANAGER":
        return <Badge className="bg-blue-500">Manager</Badge>
      default:
        return <Badge variant="secondary">Staff</Badge>
    }
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage 
              src={staff.user.image || undefined} 
              alt={staff.user.name || "Staff"}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl">
              {staff.user.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          
          {/* Name and Role */}
          <h3 className="text-lg font-semibold mb-1">{staff.user.name}</h3>
          <div className="mb-3">{getHierarchyBadge(staff.hierarchy)}</div>
          
          {/* Bio */}
          {staff.bio && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {staff.bio}
            </p>
          )}
          
          {/* Contact Info */}
          <div className="w-full space-y-2 text-sm">
            {staff.user.phone && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:${staff.user.phone}`} className="hover:text-primary">
                  {staff.user.phone}
                </a>
              </div>
            )}
            {staff.user.email && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${staff.user.email}`} className="hover:text-primary truncate">
                  {staff.user.email}
                </a>
              </div>
            )}
          </div>
          
          {/* Default Staff Badge */}
          {staff.isDefault && (
            <Badge variant="outline" className="mt-4 bg-primary/10">
              {t("staff.defaultStaff", "Default Staff")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeleton
function StaffCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// ServiceField Section Component
function ServiceFieldSection({ 
  field, 
  locale,
  t,
  isExpanded,
  onToggle
}: { 
  field: ServiceField
  locale: string
  t: (key: string, fallback: string) => string
  isExpanded: boolean
  onToggle: () => void
}) {
  const isRtl = locale === "fa" || locale === "ar"
  
  return (
    <div className="mb-8">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-muted rounded-lg mb-4 hover:bg-muted/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold">{field.name}</h2>
            <p className="text-sm text-muted-foreground">
              {field.staffs.length} {t("staff.member", "member")}{field.staffs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronRight 
          className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""} ${isRtl ? "rotate-180" : ""}`}
        />
      </button>
      
      {/* Staff Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {field.staffs.map((staff) => (
            <StaffCard 
              key={staff.id} 
              staff={staff} 
              locale={locale}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Client Component
export default function OrganizationStaffClient({
  organization,
  serviceFields,
  unassignedStaff,
  dictionary,
  lang
}: {
  organization: Organization
  serviceFields: ServiceField[]
  unassignedStaff: StaffMember[]
  dictionary: Record<string, unknown>
  lang: string
}) {
  const t = useTranslation(lang, dictionary)
  const isRtl = lang === "fa" || lang === "ar"
  
  // State for expanded sections
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set(serviceFields.map(f => f.id))
  )
  const [showUnassigned, setShowUnassigned] = useState(true)
  
  // Toggle field expansion
  const toggleField = (fieldId: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev)
      if (next.has(fieldId)) {
        next.delete(fieldId)
      } else {
        next.add(fieldId)
      }
      return next
    })
  }
  
  // Check if there are any staff members
  const hasStaff = serviceFields.some(f => f.staffs.length > 0) || unassignedStaff.length > 0
  
  return (
    <div className={isRtl ? "rtl" : "ltr"} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {organization.logo && (
                <Image 
                  src={organization.logo} 
                  alt={organization.name} 
                  width={64}
                  height={64}
                  className="object-contain rounded-lg"
                />
              )}
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold">{organization.name}</h1>
                {organization.description && (
                  <p className="text-sm text-muted-foreground">{organization.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("staff.ourTeam", "Our Team")}
          </h1>
          <p className="text-muted-foreground">
            {t("staff.meetOurStaff", "Meet our professional staff members")}
          </p>
        </div>

        {!hasStaff ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("staff.noStaff", "No staff members")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("staff.noStaffDescription", "This organization has not added any staff members yet.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ServiceField Sections */}
            {serviceFields
              .filter(field => field.staffs.length > 0)
              .map((field) => (
                <ServiceFieldSection
                  key={field.id}
                  field={field}
                  locale={lang}
                  t={t}
                  isExpanded={expandedFields.has(field.id)}
                  onToggle={() => toggleField(field.id)}
                />
              ))
            }

            {/* Unassigned Staff Section */}
            {unassignedStaff.length > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setShowUnassigned(!showUnassigned)}
                  className="w-full flex items-center justify-between p-4 bg-muted rounded-lg mb-4 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-semibold">
                        {t("staff.otherStaff", "Other Staff")}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {unassignedStaff.length} {t("staff.member", "member")}{unassignedStaff.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`h-5 w-5 text-muted-foreground transition-transform ${showUnassigned ? "rotate-90" : ""} ${isRtl ? "rotate-180" : ""}`}
                  />
                </button>
                
                {showUnassigned && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unassignedStaff.map((staff) => (
                      <StaffCard 
                        key={staff.id} 
                        staff={staff} 
                        locale={lang}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
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
