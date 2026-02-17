"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Store,
  Users,
  Calendar,
  ShoppingCart,
  ArrowRight,
  ChevronRight,
  Clock,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { followTarget, unfollowTarget } from "@/app/actions/follow"
import { toPersianDigits } from "@/lib/utils"

// Types
type OrganizationType = "LAWYER" | "DOCTOR" | "MARKET" | "RESTAURANT" | "SALON" | "OTHER"

interface Organization {
  id: string
  name: string
  slug: string
  type: OrganizationType
  coverImage: string | null
  avatarImage: string | null
  logo: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  website: string | null
  workingHours: string | null
  serviceCategories: Array<{
    id: string
    name: string
    description: string | null
    services: Array<{
      id: string
      name: string
      description: string | null
      duration: number
      price: number | null
      currency: string
      staff: {
        id: string
        user: {
          id: string
          name: string | null
          image: string | null
        }
      }
    }>
  }>
  products: Array<{
    id: string
    name: string
    image: string | null
    price: number | null
    currency: string
    productCategory: {
      id: string
      name: string
    }
  }>
  staffs: Array<{
    id: string
    hierarchy: string
    bio: string | null
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
}

interface OrganizationProfileClientProps {
  organization: Organization
  isFollowing: boolean
  followerCount: number
  dictionary: Record<string, unknown>
  lang: string
}

// Helper function for translation
function useTranslation(lang: string, dictionary: Record<string, unknown>) {
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

// =====================
// PRODUCT MENU (MARKET/RESTAURANT)
// =====================

interface ProductMenuProps {
  products: Organization['products']
  lang: string
}

function ProductMenu({ products, lang }: ProductMenuProps) {
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const categoryName = product.productCategory.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, typeof products>)
  
  const categories = Object.keys(productsByCategory)
  
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products available</h3>
          <p className="text-muted-foreground text-center">
            This store has not added any products yet.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">{category}</Badge>
              <span className="text-sm font-normal text-muted-foreground">
                ({productsByCategory[category].length} items)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {productsByCategory[category].map((product) => (
                <div 
                  key={product.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.image ? (
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          width={64} 
                          height={64} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.productCategory.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {product.price !== null && (
                      <span className="font-semibold text-lg">
                        {lang === "fa" 
                          ? toPersianDigits(product.price.toLocaleString()) 
                          : product.price.toLocaleString()
                        } {product.currency}
                      </span>
                    )}
                    <Link href={`/${lang}/product/${product.id}`}>
                      <Button variant="outline" size="sm">
                        View
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// =====================
// STAFF & SERVICES MENU (LAWYER/DOCTOR/SALON)
// =====================

interface StaffServicesMenuProps {
  organization: Organization
  lang: string
}

function StaffServicesMenu({ organization, lang }: StaffServicesMenuProps) {
  const { serviceCategories, staffs } = organization
  
  // Group services by category
  const servicesByCategory = serviceCategories.reduce((acc, category) => {
    if (category.services.length > 0) {
      acc[category.name] = category.services
    }
    return acc
  }, {} as Record<string, typeof serviceCategories[0]['services']>)
  
  const categories = Object.keys(servicesByCategory)
  
  return (
    <div className="space-y-8">
      {/* Staff Section */}
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Our Team
            <span className="text-sm font-normal text-muted-foreground">
              ({staffs.length} members)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {staffs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {staffs.map((staff) => (
                <Link 
                  key={staff.id} 
                  href={`/${lang}/staff/${staff.id}`}
                  className="flex flex-col items-center text-center hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-16 w-16 mb-2">
                    {staff.user.image ? (
                      <AvatarImage src={staff.user.image} alt={staff.user.name || ""} />
                    ) : (
                      <AvatarFallback>{staff.user.name?.charAt(0) || "?"}</AvatarFallback>
                    )}
                  </Avatar>
                  <p className="font-medium text-sm">{staff.user.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.hierarchy}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No staff members yet
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Services Section */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">{category}</Badge>
              <span className="text-sm font-normal text-muted-foreground">
                ({servicesByCategory[category].length} services)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {servicesByCategory[category].map((service) => (
                <div 
                  key={service.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {service.duration} {lang === "fa" ? "دقیقه" : "min"}
                        {service.price && (
                          <span>• {lang === "fa" ? toPersianDigits(service.price.toLocaleString()) : service.price.toLocaleString()} {service.currency}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/${lang}/o/${organization.slug}/services`}>
                      <Button variant="outline" size="sm">
                        Book
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {categories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services available</h3>
            <p className="text-muted-foreground text-center">
              This organization has not added any services yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =====================
// PROFILE HEADER
// =====================

interface ProfileHeaderProps {
  organization: Organization
  isFollowing: boolean
  followerCount: number
  lang: string
  dictionary: Record<string, unknown>
  onFollowToggle: () => Promise<void>
}

function ProfileHeader({ 
  organization, 
  isFollowing, 
  followerCount, 
  lang, 
  onFollowToggle 
}: ProfileHeaderProps) {
  const isRtl = lang === "fa" || lang === "ar"
  
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-72 w-full bg-muted overflow-hidden relative">
        {organization.coverImage ? (
          <Image 
            src={organization.coverImage} 
            alt="Cover" 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
      </div>
      
      {/* Organization Info */}
      <div className="container mx-auto px-4 -mt-16 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="h-32 w-32 border-4 border-background shadow-lg rounded-lg overflow-hidden bg-background">
              {organization.logo || organization.avatarImage ? (
                <Image 
                  src={(organization.logo || organization.avatarImage) as string} 
                  alt={organization.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Store className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <Badge className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground">
              {organization.type}
            </Badge>
          </div>
          
          {/* Organization Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{organization.name}</h1>
                {organization.description && (
                  <p className="text-muted-foreground mt-1">{organization.description}</p>
                )}
              </div>
              
              {/* Follow Button */}
              <Button 
                onClick={onFollowToggle}
                size="lg"
                className="min-w-[140px]"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats & Contact */}
        <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{followerCount}</span>
            <span className="text-sm text-muted-foreground">Followers</span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            {organization.phone && (
              <a href={`tel:${organization.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Phone className="h-4 w-4" />
                {organization.phone}
              </a>
            )}
            {organization.email && (
              <a href={`mailto:${organization.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Mail className="h-4 w-4" />
                {organization.email}
              </a>
            )}
            {organization.address && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {organization.address}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================
// MAIN COMPONENT
// =====================

export function OrganizationProfileClient({ 
  organization, 
  isFollowing: initialIsFollowing, 
  followerCount, 
  dictionary,
  lang 
}: OrganizationProfileClientProps) {
  const t = useTranslation(lang, dictionary)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowTarget(organization.id, "ORGANIZATION")
        setIsFollowing(false)
      } else {
        await followTarget(organization.id, "ORGANIZATION")
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const isMarketOrRestaurant = organization.type === "MARKET" || organization.type === "RESTAURANT"
  const isServiceBusiness = organization.type === "LAWYER" || organization.type === "DOCTOR" || organization.type === "SALON"
  
  return (
    <div className={lang === "fa" || lang === "ar" ? "rtl" : "ltr"} dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <ProfileHeader 
        organization={organization}
        isFollowing={isFollowing}
        followerCount={followerCount}
        lang={lang}
        dictionary={dictionary}
        onFollowToggle={handleFollowToggle}
      />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="home">Home</TabsTrigger>
            {isMarketOrRestaurant && <TabsTrigger value="products">Products</TabsTrigger>}
            {isServiceBusiness && <TabsTrigger value="services">Services & Staff</TabsTrigger>}
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {organization.description ? (
                    <p className="text-muted-foreground">{organization.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description available</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Business Hours */}
              {organization.workingHours && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{organization.workingHours}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {organization.type === "MARKET" || organization.type === "RESTAURANT" ? (
                    <Link href={`/${lang}/o/${organization.slug}`} className="block">
                      <Button variant="outline" className="w-full justify-between">
                        View Products
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : null}
                  
                  {organization.type !== "MARKET" && organization.type !== "RESTAURANT" && (
                    <Link href={`/${lang}/o/${organization.slug}/services`} className="block">
                      <Button variant="outline" className="w-full justify-between">
                        Book Services
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  
                  <Link href={`/${lang}/o/${organization.slug}/staff`} className="block">
                    <Button variant="outline" className="w-full justify-between">
                      Our Team
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Products Tab (MARKET/RESTAURANT) */}
          {isMarketOrRestaurant && (
            <TabsContent value="products">
              <ProductMenu products={organization.products} lang={lang} />
            </TabsContent>
          )}
          
          {/* Services Tab (LAWYER/DOCTOR/SALON) */}
          {isServiceBusiness && (
            <TabsContent value="services">
              <StaffServicesMenu organization={organization} lang={lang} />
            </TabsContent>
          )}
          
          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organization.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href={`tel:${organization.phone}`} className="text-muted-foreground hover:text-primary">
                          {organization.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {organization.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href={`mailto:${organization.email}`} className="text-muted-foreground hover:text-primary">
                          {organization.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {organization.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">{organization.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          {organization.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {organization.workingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-muted-foreground">{organization.workingHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {organization.name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
