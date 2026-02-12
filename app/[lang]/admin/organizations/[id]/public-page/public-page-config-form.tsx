"use client"

import { useState, type ReactNode } from "react"
import { updateOrganizationPublicPageConfig, updateOrganizationSocialLinks, updateOrganizationContactInfo } from "@/app/actions/admin/organizations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionToast } from "@/lib/hooks/use-toast-actions"
import type { Organization } from "@/lib/generated/prisma/client"

interface PublicPageConfigFormProps {
  organization: Organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any
  lang: string
}

export function PublicPageConfigForm({ organization, dictionary, lang }: PublicPageConfigFormProps): ReactNode {
  const { success, error } = useActionToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Hero section state
  const [heroTitle, setHeroTitle] = useState<string>(organization.heroTitle ?? "")
  const [heroSubtitle, setHeroSubtitle] = useState<string>(organization.heroSubtitle ?? "")
  const [heroBackgroundImage, setHeroBackgroundImage] = useState<string>(organization.heroBackgroundImage ?? "")
  
  // About section state
  const [aboutEnabled, setAboutEnabled] = useState<boolean>(organization.aboutEnabled ?? true)
  const [aboutContent, setAboutContent] = useState<string>(organization.aboutContent ?? "")
  const [aboutImage, setAboutImage] = useState<string>(organization.aboutImage ?? "")
  
  // Section visibility state
  const [practiceAreasEnabled, setPracticeAreasEnabled] = useState<boolean>(organization.practiceAreasEnabled ?? true)
  const [attorneysEnabled, setAttorneysEnabled] = useState<boolean>(organization.attorneysEnabled ?? true)
  const [testimonialsEnabled, setTestimonialsEnabled] = useState<boolean>(organization.testimonialsEnabled ?? true)
  const [caseResultsEnabled, setCaseResultsEnabled] = useState<boolean>(organization.caseResultsEnabled ?? true)
  const [awardsEnabled, setAwardsEnabled] = useState<boolean>(organization.awardsEnabled ?? true)
  const [faqEnabled, setFaqEnabled] = useState<boolean>(organization.faqEnabled ?? true)
  const [contactEnabled, setContactEnabled] = useState<boolean>(organization.contactEnabled ?? true)
  const [appointmentEnabled, setAppointmentEnabled] = useState<boolean>(organization.appointmentEnabled ?? true)
  
  // SEO state
  const [seoTitle, setSeoTitle] = useState<string>(organization.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState<string>(organization.seoDescription ?? "")
  const [seoKeywords, setSeoKeywords] = useState<string>(organization.seoKeywords ?? "")
  
  // Contact info state
  const [address, setAddress] = useState<string>(organization.address ?? "")
  const [phone, setPhone] = useState<string>(organization.phone ?? "")
  const [email, setEmail] = useState<string>(organization.email ?? "")
  const [mapUrl, setMapUrl] = useState<string>(organization.mapUrl ?? "")
  const [workingHours, setWorkingHours] = useState<string>(organization.workingHours ?? "")
  const [emergencyPhone, setEmergencyPhone] = useState<string>(organization.emergencyPhone ?? "")
  
  // Social links state
  const [facebookUrl, setFacebookUrl] = useState<string>(organization.facebookUrl ?? "")
  const [twitterUrl, setTwitterUrl] = useState<string>(organization.twitterUrl ?? "")
  const [instagramUrl, setInstagramUrl] = useState<string>(organization.instagramUrl ?? "")
  const [linkedinUrl, setLinkedinUrl] = useState<string>(organization.linkedinUrl ?? "")
  const [telegramUrl, setTelegramUrl] = useState<string>(organization.telegramUrl ?? "")

  const dict = dictionary.admin?.organizations?.publicPageConfig || {}
  const commonDict = dictionary.admin?.common || {}

  const handleSavePublicPageConfig = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await updateOrganizationPublicPageConfig(organization.id, {
        heroTitle: heroTitle || null,
        heroSubtitle: heroSubtitle || null,
        heroBackgroundImage: heroBackgroundImage || null,
        aboutEnabled,
        aboutContent: aboutContent || null,
        aboutImage: aboutImage || null,
        practiceAreasEnabled,
        attorneysEnabled,
        testimonialsEnabled,
        caseResultsEnabled,
        awardsEnabled,
        faqEnabled,
        contactEnabled,
        appointmentEnabled,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      })
      
      success(
        commonDict.success || "Success",
        dict.configSaved || "Configuration saved successfully"
      )
    } catch (err) {
      console.error("Error saving public page config:", err)
      error(
        commonDict.error || "Error",
        commonDict.errorSaving || "Failed to save configuration"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveContactInfo = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await updateOrganizationContactInfo(organization.id, {
        address: address || null,
        phone: phone || null,
        email: email || null,
        mapUrl: mapUrl || null,
        workingHours: workingHours || null,
        emergencyPhone: emergencyPhone || null,
      })
      
      success(
        commonDict.success || "Success",
        dict.contactInfoSaved || "Contact information saved successfully"
      )
    } catch (err) {
      console.error("Error saving contact info:", err)
      error(
        commonDict.error || "Error",
        commonDict.errorSaving || "Failed to save contact information"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSocialLinks = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await updateOrganizationSocialLinks(organization.id, {
        facebookUrl: facebookUrl || null,
        twitterUrl: twitterUrl || null,
        instagramUrl: instagramUrl || null,
        linkedinUrl: linkedinUrl || null,
        telegramUrl: telegramUrl || null,
      })
      
      success(
        commonDict.success || "Success",
        dict.socialLinksSaved || "Social links saved successfully"
      )
    } catch (err) {
      console.error("Error saving social links:", err)
      error(
        commonDict.error || "Error",
        commonDict.errorSaving || "Failed to save social links"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="hero" className="space-y-6">
      <TabsList className="grid grid-cols-5 gap-4 bg-muted p-1">
        <TabsTrigger value="hero">{dict.heroSection || "Hero Section"}</TabsTrigger>
        <TabsTrigger value="about">{dict.aboutSection || "About Section"}</TabsTrigger>
        <TabsTrigger value="sections">{dict.pageSections || "Page Sections"}</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="contact">{dict.contactInfo || "Contact Info"}</TabsTrigger>
      </TabsList>

      {/* Hero Section */}
      <TabsContent value="hero">
        <Card>
          <CardHeader>
            <CardTitle>{dict.heroSection || "Hero Section"}</CardTitle>
            <CardDescription>
              {dict.heroSectionDesc || "Configure the hero section of your public page"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">{dict.heroTitle || "Hero Title"}</Label>
              <Input
                id="heroTitle"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder={dict.heroTitlePlaceholder || "Enter hero title"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">{dict.heroSubtitle || "Hero Subtitle"}</Label>
              <Textarea
                id="heroSubtitle"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder={dict.heroSubtitlePlaceholder || "Enter hero subtitle"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heroBackgroundImage">{dict.heroBackgroundImage || "Background Image URL"}</Label>
              <Input
                id="heroBackgroundImage"
                value={heroBackgroundImage}
                onChange={(e) => setHeroBackgroundImage(e.target.value)}
                placeholder={dict.heroBackgroundImagePlaceholder || "Enter background image URL"}
              />
            </div>
            
            <Button onClick={handleSavePublicPageConfig} disabled={isLoading}>
              {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* About Section */}
      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>{dict.aboutSection || "About Section"}</CardTitle>
            <CardDescription>
              {dict.aboutSectionDesc || "Configure the about section of your public page"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="aboutEnabled"
                checked={aboutEnabled}
                onCheckedChange={setAboutEnabled}
              />
              <Label htmlFor="aboutEnabled">{dict.enableAboutSection || "Enable About Section"}</Label>
            </div>
            
            {aboutEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="aboutContent">{dict.aboutContent || "About Content"}</Label>
                  <Textarea
                    id="aboutContent"
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    placeholder={dict.aboutContentPlaceholder || "Enter about your organization"}
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aboutImage">{dict.aboutImage || "About Image URL"}</Label>
                  <Input
                    id="aboutImage"
                    value={aboutImage}
                    onChange={(e) => setAboutImage(e.target.value)}
                    placeholder={dict.aboutImagePlaceholder || "Enter about image URL"}
                  />
                </div>
              </>
            )}
            
            <Button onClick={handleSavePublicPageConfig} disabled={isLoading}>
              {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Page Sections */}
      <TabsContent value="sections">
        <Card>
          <CardHeader>
            <CardTitle>{dict.pageSections || "Page Sections"}</CardTitle>
            <CardDescription>
              {dict.pageSectionsDesc || "Enable or disable sections on your public page"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="practiceAreasEnabled"
                  checked={practiceAreasEnabled}
                  onCheckedChange={setPracticeAreasEnabled}
                />
                <Label htmlFor="practiceAreasEnabled">{dict.practiceAreas || "Practice Areas"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="attorneysEnabled"
                  checked={attorneysEnabled}
                  onCheckedChange={setAttorneysEnabled}
                />
                <Label htmlFor="attorneysEnabled">{dict.attorneys || "Attorneys"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="testimonialsEnabled"
                  checked={testimonialsEnabled}
                  onCheckedChange={setTestimonialsEnabled}
                />
                <Label htmlFor="testimonialsEnabled">{dict.testimonials || "Testimonials"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="caseResultsEnabled"
                  checked={caseResultsEnabled}
                  onCheckedChange={setCaseResultsEnabled}
                />
                <Label htmlFor="caseResultsEnabled">{dict.caseResults || "Case Results"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="awardsEnabled"
                  checked={awardsEnabled}
                  onCheckedChange={setAwardsEnabled}
                />
                <Label htmlFor="awardsEnabled">{dict.awards || "Awards"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="faqEnabled"
                  checked={faqEnabled}
                  onCheckedChange={setFaqEnabled}
                />
                <Label htmlFor="faqEnabled">{dict.faq || "FAQ"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="contactEnabled"
                  checked={contactEnabled}
                  onCheckedChange={setContactEnabled}
                />
                <Label htmlFor="contactEnabled">{dict.contactSection || "Contact Section"}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="appointmentEnabled"
                  checked={appointmentEnabled}
                  onCheckedChange={setAppointmentEnabled}
                />
                <Label htmlFor="appointmentEnabled">{dict.appointmentBooking || "Appointment Booking"}</Label>
              </div>
            </div>
            
            <Button onClick={handleSavePublicPageConfig} disabled={isLoading}>
              {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SEO */}
      <TabsContent value="seo">
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              {dict.seoDesc || "Configure search engine optimization settings"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">{dict.seoTitle || "SEO Title"}</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={dict.seoTitlePlaceholder || "Enter SEO title"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoDescription">{dict.seoDescription || "SEO Description"}</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={dict.seoDescriptionPlaceholder || "Enter SEO description"}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">{dict.seoKeywords || "SEO Keywords"}</Label>
              <Input
                id="seoKeywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder={dict.seoKeywordsPlaceholder || "Enter SEO keywords (comma separated)"}
              />
            </div>
            
            <Button onClick={handleSavePublicPageConfig} disabled={isLoading}>
              {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Contact Info */}
      <TabsContent value="contact">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dict.contactInfo || "Contact Information"}</CardTitle>
              <CardDescription>
                {dict.contactInfoDesc || "Configure contact information for your public page"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{dict.address || "Address"}</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={dict.addressPlaceholder || "Enter address"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{dict.phone || "Phone"}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={dict.phonePlaceholder || "Enter phone number"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{dict.email || "Email"}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.emailPlaceholder || "Enter email"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">{dict.emergencyPhone || "Emergency Phone"}</Label>
                  <Input
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder={dict.emergencyPhonePlaceholder || "Enter emergency phone"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workingHours">{dict.workingHours || "Working Hours"}</Label>
                  <Input
                    id="workingHours"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder={dict.workingHoursPlaceholder || "e.g., Mon-Fri: 9AM-5PM"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapUrl">{dict.mapUrl || "Map URL"}</Label>
                  <Input
                    id="mapUrl"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder={dict.mapUrlPlaceholder || "Enter map embed URL"}
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveContactInfo} disabled={isLoading}>
                {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dict.socialLinks || "Social Links"}</CardTitle>
              <CardDescription>
                {dict.socialLinksDesc || "Configure social media links for your public page"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter</Label>
                  <Input
                    id="twitterUrl"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telegramUrl">Telegram</Label>
                  <Input
                    id="telegramUrl"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveSocialLinks} disabled={isLoading}>
                {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
