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
  Check
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
  };

  // Define settings categories
  const categories: SettingsCategory[] = [
    {
      title: t.profile,
      description: "Profile & Account",
      icon: User,
      href: `/${locale}/settings/profile`,
      roles: ["CLIENT", "STAFF", "MERCHANT", "MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: t.profile, description: t.profileDesc, href: `/${locale}/settings/profile`, key: "profile" },
        { title: "Account", description: "Manage your account details", href: `/${locale}/settings/profile`, key: "account" },
      ],
    },
    {
      title: t.security,
      description: "Security & Privacy",
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
      description: "Appearance & Theme",
      icon: Palette,
      href: `/${locale}/settings/theme`,
      roles: ["CLIENT", "STAFF", "MERCHANT", "MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: t.theme, description: t.themeDesc, href: `/${locale}/settings/theme` },
      ],
    },
    {
      title: t.team,
      description: "Team & Staff Management",
      icon: Users,
      href: `/${locale}/settings/staff`,
      roles: ["MANAGER", "OWNER", "ADMIN"],
      items: [
        { title: "Staff Members", description: "View and manage staff", href: `/${locale}/settings/staff`, key: "staff-members" },
        { title: "Roles & Permissions", description: "Configure access levels", href: `/${locale}/settings/staff`, key: "roles-permissions" },
        { title: "Invite Members", description: "Add new team members", href: `/${locale}/settings/staff`, badge: "Pro", key: "invite-members" },
      ],
    },
    {
      title: t.organization,
      description: "Organization Settings",
      icon: Building2,
      href: `/${locale}/settings/organization`,
      roles: ["OWNER", "ADMIN"],
      items: [
        { title: t.organization, description: t.organizationDesc, href: `/${locale}/settings/organization`, key: "org-basic" },
        { title: "Public Page", description: "Customize your landing page", href: `/${locale}/settings/organization/public-page`, key: "org-public-page" },
        { title: "Business Hours", description: "Set operating hours", href: `/${locale}/settings/organization`, key: "org-hours" },
        { title: "Holidays", description: "Configure time off", href: `/${locale}/settings/organization`, key: "org-holidays" },
      ],
    },
  ];

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
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickAccessCard 
            href={`/${locale}/dashboard`}
            icon={Settings}
            title="Dashboard"
            description="Return to main dashboard"
          />
          <QuickAccessCard 
            href={`/${locale}/appointments`}
            icon={Bell}
            title="Appointments"
            description="View your appointments"
          />
          <QuickAccessCard 
            href={`/${locale}/calendar`}
            icon={Globe}
            title="Calendar"
            description="View calendar"
          />
          <QuickAccessCard 
            href={`/${locale}/services`}
            icon={Building2}
            title="Services"
            description="Browse services"
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
