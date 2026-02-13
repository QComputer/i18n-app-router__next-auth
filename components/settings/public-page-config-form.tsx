/**
 * Organization Public Page Configuration Form
 * 
 * A form component that allows OWNER/MANAGER users to customize their
 * organization's public landing page content, including hero section,
 * about content, section visibility, SEO settings, contact info, and social links.
 * 
 * This component is used in the settings area for organization owners to
 * manage their public page without needing admin access.
 * 
 * @module components/settings/public-page-config-form
 */

"use client";

import { useState, type ReactNode } from "react";
import { 
  updateMyOrganizationPublicPage, 
  updateMyOrganizationSocialLinks, 
  updateMyOrganizationContactInfo 
} from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionToast } from "@/lib/hooks/use-toast-actions";
import type { Organization } from "@/lib/generated/prisma/client";

interface PublicPageConfigFormProps {
  organization: Organization;
  /** Dictionary for translations */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  /** Current language locale */
  lang: string;
}

/**
 * Public Page Configuration Form Component
 * 
 * Provides a tabbed interface for editing all aspects of the organization's
 * public landing page. Data is saved via server actions.
 */
export function PublicPageConfigForm({ 
  organization, 
  dictionary, 
  lang 
}: PublicPageConfigFormProps): ReactNode {
  const { success, error } = useActionToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Hero section state - Initialize from organization data
  const [heroTitle, setHeroTitle] = useState<string>(organization.heroTitle ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState<string>(organization.heroSubtitle ?? "");
  const [heroBackgroundImage, setHeroBackgroundImage] = useState<string>(organization.heroBackgroundImage ?? "");
  
  // About section state
  const [aboutEnabled, setAboutEnabled] = useState<boolean>(organization.aboutEnabled ?? true);
  const [aboutContent, setAboutContent] = useState<string>(organization.aboutContent ?? "");
  const [aboutImage, setAboutImage] = useState<string>(organization.aboutImage ?? "");
  
  // Section visibility state - These control which sections appear on the landing page
  const [practiceAreasEnabled, setPracticeAreasEnabled] = useState<boolean>(organization.practiceAreasEnabled ?? true);
  const [attorneysEnabled, setAttorneysEnabled] = useState<boolean>(organization.attorneysEnabled ?? true);
  const [testimonialsEnabled, setTestimonialsEnabled] = useState<boolean>(organization.testimonialsEnabled ?? true);
  const [caseResultsEnabled, setCaseResultsEnabled] = useState<boolean>(organization.caseResultsEnabled ?? true);
  const [awardsEnabled, setAwardsEnabled] = useState<boolean>(organization.awardsEnabled ?? true);
  const [faqEnabled, setFaqEnabled] = useState<boolean>(organization.faqEnabled ?? true);
  const [contactEnabled, setContactEnabled] = useState<boolean>(organization.contactEnabled ?? true);
  const [appointmentEnabled, setAppointmentEnabled] = useState<boolean>(organization.appointmentEnabled ?? true);
  
  // SEO state - Search engine optimization settings
  const [seoTitle, setSeoTitle] = useState<string>(organization.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState<string>(organization.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState<string>(organization.seoKeywords ?? "");
  
  // Contact info state - Displayed on the public page
  const [address, setAddress] = useState<string>(organization.address ?? "");
  const [phone, setPhone] = useState<string>(organization.phone ?? "");
  const [email, setEmail] = useState<string>(organization.email ?? "");
  const [mapUrl, setMapUrl] = useState<string>(organization.mapUrl ?? "");
  const [workingHours, setWorkingHours] = useState<string>(organization.workingHours ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState<string>(organization.emergencyPhone ?? "");
  
  // Social links state - Displayed in footer and contact section
  const [facebookUrl, setFacebookUrl] = useState<string>(organization.facebookUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState<string>(organization.twitterUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState<string>(organization.instagramUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState<string>(organization.linkedinUrl ?? "");
  const [telegramUrl, setTelegramUrl] = useState<string>(organization.telegramUrl ?? "");

  // Get translations from dictionary
  const dict = dictionary.settings?.publicPage || dictionary.admin?.organizations?.publicPageConfig || {};
  const commonDict = dictionary.admin?.common || {};

  /**
   * Save public page configuration (hero, about, sections, SEO)
   * Called when user clicks save in the first three tabs
   */
  const handleSavePublicPageConfig = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await updateMyOrganizationPublicPage({
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
      });
      
      success(
        commonDict.success || "Success",
        dict.configSaved || "Public page configuration saved successfully"
      );
    } catch (err) {
      console.error("Error saving public page config:", err);
      error(
        commonDict.error || "Error",
        err instanceof Error ? err.message : (commonDict.errorSaving || "Failed to save configuration")
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save contact information
   * Called when user clicks save in the contact info tab
   */
  const handleSaveContactInfo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await updateMyOrganizationContactInfo({
        address: address || null,
        phone: phone || null,
        email: email || null,
        mapUrl: mapUrl || null,
        workingHours: workingHours || null,
        emergencyPhone: emergencyPhone || null,
      });
      
      success(
        commonDict.success || "Success",
        dict.contactInfoSaved || "Contact information saved successfully"
      );
    } catch (err) {
      console.error("Error saving contact info:", err);
      error(
        commonDict.error || "Error",
        err instanceof Error ? err.message : (commonDict.errorSaving || "Failed to save contact information")
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save social links
   * Called when user clicks save in the social links section
   */
  const handleSaveSocialLinks = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await updateMyOrganizationSocialLinks({
        facebookUrl: facebookUrl || null,
        twitterUrl: twitterUrl || null,
        instagramUrl: instagramUrl || null,
        linkedinUrl: linkedinUrl || null,
        telegramUrl: telegramUrl || null,
      });
      
      success(
        commonDict.success || "Success",
        dict.socialLinksSaved || "Social links saved successfully"
      );
    } catch (err) {
      console.error("Error saving social links:", err);
      error(
        commonDict.error || "Error",
        err instanceof Error ? err.message : (commonDict.errorSaving || "Failed to save social links")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="hero" className="space-y-6">
      <TabsList className="grid grid-cols-5 gap-4 bg-muted p-1">
        <TabsTrigger value="hero">{dict.heroSection || "Hero Section"}</TabsTrigger>
        <TabsTrigger value="about">{dict.aboutSection || "About Section"}</TabsTrigger>
        <TabsTrigger value="sections">{dict.pageSections || "Page Sections"}</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="contact">{dict.contactInfo || "Contact Info"}</TabsTrigger>
      </TabsList>

      {/* Hero Section Tab */}
      {/* Controls the main banner area at the top of the landing page */}
      <TabsContent value="hero">
        <Card>
          <CardHeader>
            <CardTitle>{dict.heroSection || "Hero Section"}</CardTitle>
            <CardDescription>
              {dict.heroSectionDesc || "Configure the hero section that appears at the top of your public page"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">
                {dict.heroTitle || "Hero Title"} 
                <span className="text-muted-foreground text-xs ml-2">(e.g., "Welcome to Our Law Firm")</span>
              </Label>
              <Input
                id="heroTitle"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder={dict.heroTitlePlaceholder || "Enter a compelling title for your organization"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">
                {dict.heroSubtitle || "Hero Subtitle"}
                <span className="text-muted-foreground text-xs ml-2">(e.g., "Experienced attorneys fighting for your rights")</span>
              </Label>
              <Textarea
                id="heroSubtitle"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder={dict.heroSubtitlePlaceholder || "Describe what makes your organization unique"}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heroBackgroundImage">
                {dict.heroBackgroundImage || "Background Image URL"}
              </Label>
              <Input
                id="heroBackgroundImage"
                value={heroBackgroundImage}
                onChange={(e) => setHeroBackgroundImage(e.target.value)}
                placeholder={dict.heroBackgroundImagePlaceholder || "https://example.com/images/hero.jpg"}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to an image (recommended: 1920x1080px)
              </p>
            </div>
            
            <Button onClick={handleSavePublicPageConfig} disabled={isLoading}>
              {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* About Section Tab */}
      {/* Controls the "About Us" section on the landing page */}
      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>{dict.aboutSection || "About Section"}</CardTitle>
            <CardDescription>
              {dict.aboutSectionDesc || "Tell visitors about your organization, history, and values"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="aboutEnabled"
                checked={aboutEnabled}
                onCheckedChange={setAboutEnabled}
              />
              <Label htmlFor="aboutEnabled">{dict.enableAboutSection || "Show About Section"}</Label>
            </div>
            
            {aboutEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="aboutContent">
                    {dict.aboutContent || "About Content"}
                  </Label>
                  <Textarea
                    id="aboutContent"
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    placeholder={dict.aboutContentPlaceholder || "Tell visitors about your organization's history, mission, and values"}
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aboutImage">
                    {dict.aboutImage || "About Image URL"}
                  </Label>
                  <Input
                    id="aboutImage"
                    value={aboutImage}
                    onChange={(e) => setAboutImage(e.target.value)}
                    placeholder={dict.aboutImagePlaceholder || "https://example.com/images/about.jpg"}
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

      {/* Page Sections Tab */}
      {/* Controls which sections are visible on the public landing page */}
      <TabsContent value="sections">
        <Card>
          <CardHeader>
            <CardTitle>{dict.pageSections || "Page Sections"}</CardTitle>
            <CardDescription>
              {dict.pageSectionsDesc || "Choose which sections to display on your public landing page"}
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
                <Label htmlFor="attorneysEnabled">{dict.attorneys || "Attorneys/Staff"}</Label>
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
                <Label htmlFor="awardsEnabled">{dict.awards || "Awards & Recognition"}</Label>
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

      {/* SEO Tab */}
      {/* Search engine optimization settings for better visibility */}
      <TabsContent value="seo">
        <Card>
          <CardHeader>
            <CardTitle>SEO (Search Engine Optimization)</CardTitle>
            <CardDescription>
              {dict.seoDesc || "Optimize your page for search engines like Google"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">
                {dict.seoTitle || "SEO Title"}
                <span className="text-muted-foreground text-xs ml-2">(appears in search results)</span>
              </Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={dict.seoTitlePlaceholder || "Your Organization - Services | Location"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoDescription">
                {dict.seoDescription || "SEO Description"}
              </Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={dict.seoDescriptionPlaceholder || "Brief description for search engines (150-160 characters recommended)"}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">
                {dict.seoKeywords || "SEO Keywords"}
              </Label>
              <Input
                id="seoKeywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder={dict.seoKeywordsPlaceholder || "law firm, attorney, legal services, Tehran"}
              />
              <p className="text-xs text-muted-foreground">
                Separate keywords with commas
              </p>
            </div>
            
            <Button onClick={handleSavePublicPageConfig} disabled={isLoading}>
              {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Contact Info Tab */}
      {/* Contact details and social media links displayed on the public page */}
      <TabsContent value="contact">
        <div className="space-y-6">
          {/* Basic Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{dict.contactInfo || "Contact Information"}</CardTitle>
              <CardDescription>
                {dict.contactInfoDesc || "How visitors can reach your organization"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{dict.address || "Address"}</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={dict.addressPlaceholder || "123 Main Street, City, Country"}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{dict.phone || "Phone Number"}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={dict.phonePlaceholder || "+98 21 1234 5678"}
                    type="tel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{dict.email || "Email Address"}</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.emailPlaceholder || "contact@example.com"}
                    type="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">{dict.emergencyPhone || "Emergency Phone"}</Label>
                  <Input
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder={dict.emergencyPhonePlaceholder || "+98 912 345 6789"}
                    type="tel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workingHours">{dict.workingHours || "Working Hours"}</Label>
                  <Input
                    id="workingHours"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder={dict.workingHoursPlaceholder || "Mon-Fri: 9AM-6PM"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mapUrl">{dict.mapUrl || "Map Embed URL"}</Label>
                  <Input
                    id="mapUrl"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder={dict.mapUrlPlaceholder || "Google Maps embed URL"}
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveContactInfo} disabled={isLoading}>
                {isLoading ? (commonDict.saving || "Saving...") : (commonDict.save || "Save")}
              </Button>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>{dict.socialLinks || "Social Media Links"}</CardTitle>
              <CardDescription>
                {dict.socialLinksDesc || "Link your social media profiles"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter / X</Label>
                  <Input
                    id="twitterUrl"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telegramUrl">Telegram</Label>
                  <Input
                    id="telegramUrl"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    placeholder="https://t.me/yourchannel"
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
  );
}
