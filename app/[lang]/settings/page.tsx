/**
 * Settings Landing Page
 * 
 * Comprehensive settings hub that organizes all settings into logical categories.
 * Displays settings based on user role permissions.
 * 
 * Route: /[lang]/settings
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { 
  Settings, 
  User, 
  Shield, 
  Palette, 
  Building2, 
  Users, 
  Lock, 
  Bell, 
  Globe,
  ChevronRight,
  Check,
  Folder
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

// Type for the dictionary
type Dictionary = Record<string, unknown>;

/**
 * Helper function to safely get translation strings
 */
function getTranslation(dictionary: Dictionary, key: string, fallback: string): string {
  const keys = key.split(".");
  let value: unknown = dictionary;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

/**
 * Settings category interface
 */
interface SettingsCategory {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  items: SettingsItem[];
  roles: string[]; // Which roles can access this category
}

/**
 * Settings item interface
 */
interface SettingsItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
  key?: string;
}

/**
 * Main settings landing page component
 */
export default async function SettingsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const locale = params.lang as Locale;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get user data for role-based access
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      themeMode: true,
      locale: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get dictionary for translations
  const dictionary = await getDictionary(locale) as unknown as Dictionary;

  // Get user role
  const userRole = user.role;

  // Get user's staff record to check hierarchy
  const staff = await prisma.staff.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      hierarchy: true,
      organizationId: true,
    },
  });

  // Define all settings categories
  const t = {
    title: getTranslation(dictionary, "settings.title", "Settings"),
    description: getTranslation(dictionary, "settings.description", "Manage your account and application preferences"),
    profile: getTranslation(dictionary, "settings.profile", "Profile"),
    profileDesc: getTranslation(dictionary, "settings.profileDesc", "Update your personal information"),
    security: getTranslation(dictionary, "settings.security", "Security"),
    securityDesc: getTranslation(dictionary, "settings.securityDesc", "Manage your password and security settings"),
    theme: getTranslation(dictionary, "settings.theme", "Appearance"),
    themeDesc: getTranslation(dictionary, "settings.themeDesc", "Customize the look and feel"),
    organization: getTranslation(dictionary, "settings.organization", "Organization"),
    organizationDesc: getTranslation(dictionary, "settings.organizationDesc", "Manage your organization settings"),
    team: getTranslation(dictionary, "settings.team", "Team & Staff"),
    teamDesc: getTranslation(dictionary, "settings.teamDesc", "Manage team members and their permissions"),
    notifications: getTranslation(dictionary, "settings.notifications", "Notifications"),
    notificationsDesc: getTranslation(dictionary, "settings.notificationsDesc", "Configure how you receive notifications"),
    integrations: getTranslation(dictionary, "settings.integrations", "Integrations"),
    integrationsDesc: getTranslation(dictionary, "settings.integrationsDesc", "Connect third-party services"),
    privacy: getTranslation(dictionary, "settings.privacy", "Privacy"),
    privacyDesc: getTranslation(dictionary, "settings.privacyDesc", "Control your data and privacy settings"),
    account: getTranslation(dictionary, "settings.account", "Account"),
    // Additional translated strings
    profileAndAccount: getTranslation(dictionary, "settings.profileAndAccount", locale === 'fa' ? 'پروفایل و حساب کاربری' : 'Profile & Account'),
    accountDetails: getTranslation(dictionary, "settings.accountDetails", locale === 'fa' ? 'اطلاعات حساب کاربری را مدیریت کنید' : 'Manage your account details'),
    securityAndPrivacy: getTranslation(dictionary, "settings.securityAndPrivacy", locale === 'fa' ? 'امنیت و حریم خصوصی' : 'Security & Privacy'),
    appearanceAndTheme: getTranslation(dictionary, "settings.appearanceAndTheme", locale === 'fa' ? 'ظاهر و تم' : 'Appearance & Theme'),
    teamAndStaffManagement: getTranslation(dictionary, "settings.teamAndStaffManagement", locale === 'fa' ? 'مدیریت تیم و کارکنان' : 'Team & Staff Management'),
    staffMembers: getTranslation(dictionary, "settings.staffMembers", locale === 'fa' ? 'اعضای کارکنان' : 'Staff Members'),
    viewAndManageStaff: getTranslation(dictionary, "settings.viewAndManageStaff", locale === 'fa' ? 'مشاهده و مدیریت کارکنان' : 'View and manage staff'),
    rolesAndPermissions: getTranslation(dictionary, "settings.rolesAndPermissions", locale === 'fa' ? 'نقش‌ها و دسترسی‌ها' : 'Roles & Permissions'),
    configureAccessLevels: getTranslation(dictionary, "settings.configureAccessLevels", locale === 'fa' ? 'سطوح دسترسی را تنظیم کنید' : 'Configure access levels'),
    inviteMembers: getTranslation(dictionary, "settings.inviteMembers", locale === 'fa' ? 'دعوت اعضای جدید' : 'Invite Members'),
    organizationSettings: getTranslation(dictionary, "settings.organizationSettings", locale === 'fa' ? 'تنظیمات سازمان' : 'Organization Settings'),
    publicPage: getTranslation(dictionary, "settings.publicPage", locale === 'fa' ? 'صفحه عمومی' : 'Public Page'),
    customizeLandingPage: getTranslation(dictionary, "settings.customizeLandingPage", locale === 'fa' ? 'صفحه ورود خود را سفارشی کنید' : 'Customize your landing page'),
    businessHours: getTranslation(dictionary, "settings.businessHours", locale === 'fa' ? 'ساعات کاری' : 'Business Hours'),
    setOperatingHours: getTranslation(dictionary, "settings.setOperatingHours", locale === 'fa' ? 'ساعات کاری را تنظیم کنید' : 'Set operating hours'),
    holidays: getTranslation(dictionary, "settings.holidays", locale === 'fa' ? 'تعطیلات' : 'Holidays'),
    configureTimeOff: getTranslation(dictionary, "settings.configureTimeOff", locale === 'fa' ? 'زمان استراحت را تنظیم کنید' : 'Configure time off'),
    quickAccess: getTranslation(dictionary, "settings.quickAccess", locale === 'fa' ? 'دسترسی سریع' : 'Quick access'),
    dashboard: getTranslation(dictionary, "settings.dashboard", locale === 'fa' ? 'داشبورد' : 'Dashboard'),
    calendar: getTranslation(dictionary, "settings.calendar", locale === 'fa' ? 'تقویم' : 'Calendar'),
    returnToMainDashboard: getTranslation(dictionary, "settings.returnToMainDashboard", locale === 'fa' ? 'بازگشت به داشبورد اصلی' : 'Return to main dashboard'),
    viewYourAppointments: getTranslation(dictionary, "settings.viewYourAppointments", locale === 'fa' ? 'نوبت‌های خود را مشاهده کنید' : 'View your appointments'),
    viewCalendar: getTranslation(dictionary, "settings.viewCalendar", locale === 'fa' ? 'مشاهده تقویم' : 'View calendar'),
    browseServices: getTranslation(dictionary, "settings.browseServices", locale === 'fa' ? 'خدمات را مرور کنید' : 'Browse services'),
    pro: locale === 'fa' ? 'حرفه‌ای' : 'Pro',
    services: getTranslation(dictionary, "service.title", locale === 'fa' ? 'خدمات' : 'Services'),
    serviceCategories: locale === 'fa' ? 'دسته‌بندی خدمات' : 'Service Categories',
    manageCategories: locale === 'fa' ? 'مدیریت دسته‌بندی خدمات' : 'Manage service categories',
    myServices: locale === 'fa' ? 'خدمات من' : 'My Services',
    manageMyServices: locale === 'fa' ? 'مدیریت خدمات من' : 'Manage my services',
    appointments: getTranslation(dictionary, "appointment.title", locale === 'fa' ? 'نوبت‌ها' : 'Appointments'),
    // New organization settings
    general: locale === 'fa' ? 'عمومی' : 'General',
    generalDesc: locale === 'fa' ? 'اطلاعات و جزئیات پایه' : 'Basic information and details',
    staffManagement: locale === 'fa' ? 'مدیریت کارکنان' : 'Staff Management',
    staffManagementDesc: locale === 'fa' ? 'مدیریت اعضای تیم' : 'Manage team members',
  };

  // Define settings categories
  const categories: SettingsCategory[] = [
    {
      title: t.profile,
      description: t.profileAndAccount,
      icon: User,
      href: `/${locale}/settings/profile`,
      roles: ["CLIENT", "STAFF", "MERCHANT", "MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: t.profile, description: t.profileDesc, href: `/${locale}/settings/profile`, key: "profile" },
        { title: t.account, description: t.accountDetails, href: `/${locale}/settings/profile`, key: "account" },
      ],
    },
    {
      title: t.security,
      description: t.securityAndPrivacy,
      icon: Shield,
      href: "/" + locale + "/settings/security",
      roles: ["CLIENT", "STAFF", "MERCHANT", "MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: t.security, description: t.securityDesc, href: "/" + locale + "/settings/security", key: "security" },
        { title: t.privacy, description: t.privacyDesc, href: "/" + locale + "/settings/security", key: "privacy" },
      ],
    },
    {
      title: t.theme,
      description: t.appearanceAndTheme,
      icon: Palette,
      href: `/${locale}/settings/theme`,
      roles: ["CLIENT", "STAFF", "MERCHANT", "MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: t.theme, description: t.themeDesc, href: `/${locale}/settings/theme` },
      ],
    },
    {
      title: t.team,
      description: t.teamAndStaffManagement,
      icon: Users,
      href: `/${locale}/settings/organization/staff`,
      roles: ["MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: t.staffManagement, description: t.staffManagementDesc, href: `/${locale}/settings/organization/staff`, key: "staff-members" },
        { title: t.rolesAndPermissions, description: t.configureAccessLevels, href: `/${locale}/settings/organization/staff`, key: "roles-permissions" },
        { title: t.inviteMembers, description: locale === 'fa' ? 'اعضای جدید تیم را اضافه کنید' : 'Add new team members', href: `/${locale}/settings/organization/staff`, badge: t.pro, key: "invite-members" },
      ],
    },
    {
      title: t.organization,
      description: t.organizationSettings,
      icon: Building2,
      href: `/${locale}/settings/organization`,
      roles: ["OWNER", "ADMIN"],
      items: [
        { title: t.general, description: t.generalDesc, href: `/${locale}/settings/organization/general`, key: "org-general" },
        { title: t.staffManagement, description: t.staffManagementDesc, href: `/${locale}/settings/organization/staff`, key: "org-staff" },
        { title: t.serviceCategories, description: t.manageCategories, href: `/${locale}/settings/organization/categories`, key: "org-categories" },
        { title: t.publicPage, description: t.customizeLandingPage, href: `/${locale}/settings/organization/public-page`, key: "org-public-page" },
      ],
    },
  ];

  // Add service category based on staff hierarchy
  if (staff) {
    // For OWNER hierarchy, add service categories management
    if (staff.hierarchy === "OWNER") {
      categories.push({
        title: t.serviceCategories,
        description: t.manageCategories,
        icon: Folder,
        href: `/${locale}/settings/organization/categories`,
        roles: ["OWNER", "ADMIN"],
        items: [
          { title: t.serviceCategories, description: t.manageCategories, href: `/${locale}/settings/organization/categories`, key: "service-categories" },
        ],
      });
    }
    // For Staffs add my services
    if (staff.hierarchy === "MERCHANT" || staff.hierarchy === "OWNER" || staff.hierarchy === "MANAGER") {
      categories.push({
        title: t.myServices,
        description: t.manageMyServices,
        icon: Building2,
        href: `/${locale}/settings/my-services`,
        roles: ["OWNER", "MANAGER", "MERCHANT"],
        items: [
          { title: t.myServices, description: t.manageMyServices, href: `/${locale}/settings/my-services`, key: "my-services" },
        ],
      });
    }
  }

  // Filter categories based on user role
  const accessibleCategories = categories.filter(cat => 
    cat.roles.includes(userRole)
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t.title}</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {t.description}
        </p>
      </div>

      {/* User Info Banner */}
      <div className="mb-8 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user.name || user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accessibleCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.href} href={category.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="mt-4">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.slice(0, 2).map((item) => (
                      <li key={item.key || item.href} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary/60" />
                        {item.title}
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.quickAccess}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickAccessCard 
            href={`/${locale}/dashboard`}
            icon={Settings}
            title={t.dashboard}
            description={t.returnToMainDashboard}
          />
          <QuickAccessCard 
            href={`/${locale}/appointments`}
            icon={Bell}
            title={t.appointments}
            description={t.viewYourAppointments}
          />
          <QuickAccessCard 
            href={`/${locale}/calendar`}
            icon={Globe}
            title={t.calendar}
            description={t.viewCalendar}
          />
          <QuickAccessCard 
            href={`/${locale}/services`}
            icon={Building2}
            title={t.services}
            description={t.browseServices}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Access Card Component
 */
function QuickAccessCard({ 
  href, 
  icon: Icon, 
  title, 
  description 
}: { 
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
