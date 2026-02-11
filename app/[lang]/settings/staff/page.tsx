/**
 * Staff Management Settings Page
 * 
 * Allows OWNER/MANAGER to view, edit, and manage staff members within their organization.
 * Provides a table view with sorting, filtering, and pagination capabilities.
 * 
 * Route: /[lang]/settings/staff
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { i18nConfig, type Locale } from "@/i18n-config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Shield,
  Edit,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
 * Interface for pagination params
 */
interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  hierarchy?: string;
  isActive?: string;
}

/**
 * Main staff management settings page component
 */
export default async function StaffSettingsPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    hierarchy?: string;
    isActive?: string;
  }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const locale = params.lang as Locale;

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Check authorization (only OWNER, MANAGER, or ADMIN can access)
  const userRole = session.user.role;
  if (!['OWNER', 'MANAGER', 'ADMIN'].includes(userRole)) {
    redirect(`/${locale}/dashboard`);
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get organization ID (for non-admin users)
  let organizationId: string | undefined;
  if (userRole !== 'ADMIN') {
    const staff = await prisma.staff.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    organizationId = staff?.organizationId;
  }

  // Parse pagination params
  const pagination: PaginationParams = {
    page: parseInt(searchParams.page || '1'),
    limit: parseInt(searchParams.limit || '10'),
    sortBy: searchParams.sortBy || 'createdAt',
    sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc',
    search: searchParams.search || '',
    hierarchy: searchParams.hierarchy,
    isActive: searchParams.isActive,
  };

  // Get dictionary for translations
  const dictionary = await getDictionary(locale) as Record<string, Record<string, unknown>>;
  const dict = dictionary;

  // Translations
  const t = {
    title: getTranslation(dictionary, "settings.staff.title", "Staff Management"),
    description: getTranslation(dictionary, "settings.staff.description", "Manage your team members and their access levels"),
    searchPlaceholder: getTranslation(dictionary, "settings.staff.search", "Search staff..."),
    filterBy: getTranslation(dictionary, "settings.staff.filterBy", "Filter by"),
    hierarchy: getTranslation(dictionary, "settings.staff.hierarchy", "Hierarchy"),
    status: getTranslation(dictionary, "settings.staff.status", "Status"),
    all: getTranslation(dictionary, "settings.staff.all", "All"),
    active: getTranslation(dictionary, "settings.staff.active", "Active"),
    inactive: getTranslation(dictionary, "settings.staff.inactive", "Inactive"),
    addStaff: getTranslation(dictionary, "settings.staff.addStaff", "Add Staff Member"),
    name: getTranslation(dictionary, "settings.staff.name", "Name"),
    email: getTranslation(dictionary, "settings.staff.email", "Email"),
    role: getTranslation(dictionary, "settings.staff.role", "Role"),
    contact: getTranslation(dictionary, "settings.staff.contact", "Contact"),
    joined: getTranslation(dictionary, "settings.staff.joined", "Joined"),
    actions: getTranslation(dictionary, "settings.staff.actions", "Actions"),
    noStaff: getTranslation(dictionary, "settings.staff.noStaff", "No staff members found"),
    previous: getTranslation(dictionary, "settings.pagination.previous", "Previous"),
    next: getTranslation(dictionary, "settings.pagination.next", "Next"),
    showing: getTranslation(dictionary, "settings.pagination.showing", "Showing"),
    of: getTranslation(dictionary, "settings.pagination.of", "of"),
    results: getTranslation(dictionary, "settings.pagination.results", "results"),
  };

  // Build where clause for database query
  const where: Record<string, unknown> = {};
  
  if (organizationId) {
    where.organizationId = organizationId;
  }
  
  if (pagination.search) {
    where.user = {
      OR: [
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { email: { contains: pagination.search, mode: 'insensitive' } },
        { username: { contains: pagination.search, mode: 'insensitive' } },
      ],
    };
  }
  
  if (pagination.hierarchy) {
    where.hierarchy = pagination.hierarchy;
  }
  
  if (pagination.isActive && pagination.isActive !== 'all') {
    where.isActive = pagination.isActive === 'active';
  }

  // Get total count for pagination
  const totalCount = await prisma.staff.count({ where });
  
  // Get staff members with pagination
  const staffMembers = await prisma.staff.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          image: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { [pagination.sortBy]: pagination.sortOrder },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  });

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pagination.limit);
  const startResult = (pagination.page - 1) * pagination.limit + 1;
  const endResult = Math.min(pagination.page * pagination.limit, totalCount);

  // Get hierarchy options
  const hierarchyLabels: Record<string, string> = {
    OWNER: (dict.admin as Record<string, Record<string, string>>)?.hierarchy?.OWNER || 'Owner',
    MANAGER: (dict.admin as Record<string, Record<string, string>>)?.hierarchy?.MANAGER || 'Manager',
    MERCHANT: (dict.admin as Record<string, Record<string, string>>)?.hierarchy?.MERCHANT || 'Merchant',
    STAFF: (dict.admin as Record<string, Record<string, string>>)?.hierarchy?.STAFF || 'Staff',
  };
  
  const hierarchyOptions = Object.entries(hierarchyLabels).map(([value, label]) => ({ value, label }));

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/${locale}/settings`} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t.title}</h1>
        </div>
        <p className="text-muted-foreground text-lg ml-9">
          {t.description}
        </p>
      </div>

      {/* Filters and Actions Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto flex-wrap">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <form>
                  <Input
                    name="search"
                    placeholder={t.searchPlaceholder}
                    defaultValue={pagination.search}
                    className="pl-9"
                  />
                </form>
              </div>

              {/* Hierarchy Filter */}
              <Select defaultValue={pagination.hierarchy || 'all'}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t.hierarchy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all} {t.hierarchy}</SelectItem>
                  {hierarchyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select defaultValue={pagination.isActive || 'all'}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Staff Button */}
            <Link href={`/${locale}/admin/staff/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t.addStaff}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{t.name}</CardTitle>
            <Badge variant="secondary">{totalCount} {t.results}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {staffMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-medium">{t.name}</th>
                    <th className="p-4 text-left font-medium">{t.contact}</th>
                    <th className="p-4 text-left font-medium">{t.role}</th>
                    <th className="p-4 text-left font-medium">{t.status}</th>
                    <th className="p-4 text-left font-medium">{t.joined}</th>
                    <th className="p-4 text-left font-medium">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staffMembers.map((staff) => {
                    const staffUser = staff.user;
                    return (
                      <tr key={staff.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {staffUser?.name?.charAt(0) || staffUser?.username?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {staffUser?.name || staffUser?.username || 'Unnamed'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {staffUser?.email || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {staffUser?.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {staffUser.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {staffUser?.email || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">
                              {hierarchyLabels[staff.hierarchy] || staff.hierarchy}
                            </Badge>
                            {staff.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {staff.isActive ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              {t.active}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              {t.inactive}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {staff.createdAt.toLocaleDateString(locale)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/${locale}/admin/staff/${staff.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/${locale}/admin/staff/${staff.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noStaff}</p>
              <Link href={`/${locale}/admin/staff/new`}>
                <Button variant="link" className="mt-2">
                  {t.addStaff}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {t.showing} {startResult}-{endResult} {t.of} {totalCount} {t.results}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/${locale}/settings/staff?page=${pagination.page - 1}`}
              className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
            >
              <Button variant="outline" size="sm" disabled={pagination.page <= 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t.previous}
              </Button>
            </Link>
            <Link
              href={`/${locale}/settings/staff?page=${pagination.page + 1}`}
              className={pagination.page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            >
              <Button variant="outline" size="sm" disabled={pagination.page >= totalPages}>
                {t.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-sm text-muted-foreground">Total Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {staffMembers.filter(s => s.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {staffMembers.filter(s => !s.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {staffMembers.filter(s => s.isDefault).length}
            </div>
            <p className="text-sm text-muted-foreground">Default Staff</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
