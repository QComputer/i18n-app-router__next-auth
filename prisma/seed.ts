/**
 * Database Seed Script
 * 
 * This script populates the database with realistic fake data
 * for testing the admin dashboard and all its features.
 * 
 * Run with: npm run db:seed
 */

import "dotenv/config"

import { OrganizationType, ThemeMode, Hierarchy } from "@/lib/generated/prisma/enums"
import bcrypt from "bcryptjs"

import { PrismaClient } from "@/lib/generated/prisma/client"
import { syncAllUsersStaff, syncAllUsersStaffByPrisma } from "@/lib/sync/user-staff-sync"

// Prevent multiple instances of Prisma Client in development
const prisma = new PrismaClient({

  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
})

// ============================================
// Helper Functions
// ============================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePhone(): string {
  return `09${randomBetween(10, 99)}${randomBetween(1000000, 9999999)}`
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ============================================
// Data Arrays
// ============================================

const NAMES = {
  first: ["Ahmad", "Mohammad", "Reza", "Sara", "Mahsa", "Fatemeh", "Ali", "Hossein", "Maryam", "Nasim"],
  last: ["Karimi", "Hosseini", "Rahimi", "Mohammadi", "Abbasi", "Sadeghi", "Tehrani", "Shirazi", "Esfahani"],
}

interface OrgData {
  name: string
  type: OrganizationType
  description: string
  services: Array<{ name: string; duration: number; price: number; color: string }>
}

const ORGANIZATION_DATA: OrgData[] = [
  {
    name: "Dr. Karimi Dental Clinic",
    type: OrganizationType.DOCTOR,
    description: "Professional dental care services including whitening, implants, and orthodontics.",
    services: [
      { name: "Dental Consultation", duration: 30, price: 500000, color: "#3b82f6" },
      { name: "Teeth Whitening", duration: 60, price: 1500000, color: "#10b981" },
      { name: "Dental Implant", duration: 120, price: 8000000, color: "#f59e0b" },
      { name: "Orthodontic Consultation", duration: 45, price: 750000, color: "#8b5cf6" },
    ],
  },
  {
    name: "Elite Beauty Salon",
    type: OrganizationType.SALON,
    description: "Premium hair and beauty services for all occasions.",
    services: [
      { name: "Haircut & Styling", duration: 45, price: 350000, color: "#ec4899" },
      { name: "Hair Coloring", duration: 120, price: 1200000, color: "#f97316" },
      { name: "Manicure & Pedicure", duration: 60, price: 450000, color: "#06b6d4" },
      { name: "Makeup Application", duration: 60, price: 800000, color: "#a855f7" },
    ],
  },
  {
    name: "Iran Legal Associates",
    type: OrganizationType.LAWYER,
    description: "Comprehensive legal services for individuals and businesses.",
    services: [
      { name: "Initial Consultation", duration: 60, price: 1000000, color: "#1e40af" },
      { name: "Contract Review", duration: 90, price: 2000000, color: "#3b82f6" },
      { name: "Court Representation", duration: 240, price: 5000000, color: "#1e3a8a" },
    ],
  },
  {
    name: "Fresh Foods Supermarket",
    type: OrganizationType.SUPERMARKET,
    description: "Quality groceries and fresh produce.",
    services: [
      { name: "Online Order Pickup", duration: 30, price: 0, color: "#22c55e" },
      { name: "Home Delivery", duration: 60, price: 150000, color: "#16a34a" },
    ],
  },
  {
    name: "Tehran Garden Restaurant",
    type: OrganizationType.RESTAURANT,
    description: "Traditional Persian cuisine in an elegant setting.",
    services: [
      { name: "Table Reservation", duration: 15, price: 0, color: "#b45309" },
      { name: "Private Dining", duration: 120, price: 5000000, color: "#92400e" },
      { name: "Catering Service", duration: 240, price: 15000000, color: "#78350f" },
    ],
  },
  {
    name: "TechCare IT Solutions",
    type: OrganizationType.OTHER,
    description: "IT consulting and technical support services.",
    services: [
      { name: "IT Consultation", duration: 60, price: 1500000, color: "#6366f1" },
      { name: "Network Setup", duration: 180, price: 5000000, color: "#4f46e5" },
      { name: "System Maintenance", duration: 120, price: 2000000, color: "#4338ca" },
    ],
  },
]

const CLIENT_NAMES = [
  "Zahra Amiri",
  "Hassan Najafi",
  "Samira Rahmati",
  "Mehdi Ghasemi",
  "Leila Karimian",
  "Amir Hosseini",
  "Niloufar Mosavi",
  "Ehsan Shakeri",
  "Mina Sadeghi",
  "Morteza Akhavan",
  "Sara Farhadi",
  "Ali Akbarpour",
  "Roxana Hedayati",
  "Kambiz Farzad",
  "Maryam Gholami",
]

const HOLIDAYS = [
  { name: "Nowruz", isRecurring: true },
  { name: "Yalda Night", isRecurring: true },
  { name: "Birthday Celebration", isRecurring: false },
  { name: "Annual Party", isRecurring: false },
]

interface CreatedUser {
  id: string
  username: string
  role: string
  name: string | null
}

interface CreatedStaff {
  id: string
  userId: string | null
  organizationId: string | null
  hierarchy: string
  name: string | null
  bio: string | null
}

interface CreatedService {
  id: string
  name: string
  duration: number
}

interface CreatedOrg {
  id: string
  name: string
  slug: string
  type: string
  services: CreatedService[]
}

// ============================================
// Seed Functions
// ============================================

async function createAdminUser() {
  console.log("Creating admin user...")
  
  const hashedPassword = await bcrypt.hash("Admin@123!", 10)
  
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      name: "System Administrator",
      phone: generatePhone(),
      password: hashedPassword,
      role: "ADMIN",
      locale: "fa",
      themeMode: ThemeMode.SYSTEM,
    },
  })
  
  console.log(`Created admin user: ${admin.username}`)
  return admin as CreatedUser
}

async function createTestUsers() {
  console.log("Creating test users with specific roles...")
  
  const testUsers = [
    { username: "owner", name: "Organization Owner", role: "OWNER", hierarchy: Hierarchy.OWNER },
    { username: "manager", name: "Manager User", role: "MANAGER", hierarchy: Hierarchy.MANAGER },
    { username: "staff", name: "Staff User", role: "STAFF", hierarchy: Hierarchy.MERCHANT },
    { username: "client", name: "Client User", role: "CLIENT", hierarchy: null },
  ]
  
  const createdUsers: CreatedUser[] = []
  
  for (const testUser of testUsers) {
    const hashedPassword = await bcrypt.hash("Password123!", 10)
    
    const user = await prisma.user.upsert({
      where: { username: testUser.username },
      update: {},
      create: {
        username: testUser.username,
        email: `${testUser.username}@example.com`,
        name: testUser.name,
        phone: generatePhone(),
        password: hashedPassword,
        role: testUser.role,
        locale: "fa",
        themeMode: ThemeMode.SYSTEM,
      },
    })
    
    createdUsers.push({ id: user.id, username: user.username, name: user.name, role: user.role })
    console.log(`Created test user: ${user.username} (${user.role})`)
  }
  
  return createdUsers
}

async function createClientUsers(): Promise<CreatedUser[]> {
  console.log("Creating client users...")
  
  const clientUsers: CreatedUser[] = []
  
  for (let i = 0; i < 20; i++) {
    const firstName = randomElement(NAMES.first)
    const lastName = randomElement(NAMES.last)
    const username = generateSlug(`${firstName}${lastName}${i}`)
    const hashedPassword = await bcrypt.hash("Password123!", 10)
    
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${username}@example.com`,
        name: `${firstName} ${lastName}`,
        phone: generatePhone(),
        password: hashedPassword,
        role: "CLIENT",
        locale: randomElement(["fa", "en", "ar"]),
        themeMode: randomElement([ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.SYSTEM]),
      },
    })
    
    clientUsers.push({ id: user.id, username: user.username, name: user.name, role: user.role })
  }
  
  console.log(`Created ${clientUsers.length} client users`)
  return clientUsers
}

async function convertClientsToStaff(clientUsers: CreatedUser[], organizations: CreatedOrg[]): Promise<CreatedUser[]> {
  console.log("Converting some CLIENT users to STAFF and creating Staff records...")
  
  const staffUsers: CreatedUser[] = []
  
  // Convert 8 random clients to staff
  const staffCount = Math.min(8, clientUsers.length)
  const shuffled = [...clientUsers].sort(() => Math.random() - 0.5)
  const selectedClients = shuffled.slice(0, staffCount)
  
  for (let i = 0; i < selectedClients.length; i++) {
    const client = selectedClients[i]
    const orgIndex = i % organizations.length
    const organization = organizations[orgIndex]
    
    // Determine hierarchy based on index
    const hierarchy = i === 0 ? Hierarchy.OWNER as string : 
                     i <= 2 ? Hierarchy.MANAGER as string : 
                     Hierarchy.MERCHANT as string
    
    // Update user's role to STAFF
    const updatedUser = await prisma.user.update({
      where: { id: client.id },
      data: { role: "STAFF" },
    })
    
    // Create Staff record linked to User and Organization
    await prisma.staff.upsert({
      where: { userId: client.id },
      update: {
        organizationId: organization.id,
        hierarchy,
      },
      create: {
        userId: client.id,
        organizationId: organization.id,
        hierarchy,
        isActive: true,
        isDefault: i === 0,
        bio: `${client.name} is a staff member at ${organization.name}`,
      },
    })
    
    staffUsers.push({ 
      id: updatedUser.id, 
      username: updatedUser.username, 
      name: updatedUser.name, 
      role: updatedUser.role 
    })
    
    console.log(`Converted client ${client.username} to STAFF with hierarchy ${hierarchy} for ${organization.name}`)
  }
  
  console.log(`Converted ${staffUsers.length} clients to staff`)
  return staffUsers
}

async function createOrganizations(): Promise<CreatedOrg[]> {
  console.log("Creating organizations...")
  
  const createdOrgs: CreatedOrg[] = []
  
  for (const orgData of ORGANIZATION_DATA) {
    const slug = generateSlug(orgData.name)
    
    const organization = await prisma.organization.upsert({
      where: { slug },
      update: {},
      create: {
        name: orgData.name,
        slug,
        type: orgData.type,
        description: orgData.description,
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${slug}`,
        website: `https://${slug}.com`,
        phone: generatePhone(),
        email: `contact@${slug}.com`,
        address: `${randomBetween(1, 999)} ${randomElement(NAMES.last)} Street, Tehran, Iran`,
        timezone: "Asia/Tehran",
        locale: "fa",
        themeMode: ThemeMode.SYSTEM,
        primaryColor: randomElement(["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]),
        secondaryColor: randomElement(["#64748b", "#475569", "#334155"]),
        isActive: true,
        // Public Page Configuration
        heroTitle: orgData.type === OrganizationType.LAWYER 
          ? "تجربه. صداقت. نتیجه."
          : "Professional Services, Excellent Results",
        heroSubtitle: orgData.type === OrganizationType.LAWYER
          ? "وکلای مجرب ما با تلاش بی‌وقفه از منافع شما دفاع می‌کنند"
          : "Experience our premium services and dedicated team",
        aboutEnabled: true,
        aboutContent: orgData.description,
        practiceAreasEnabled: true,
        attorneysEnabled: true,
        testimonialsEnabled: true,
        caseResultsEnabled: true,
        awardsEnabled: true,
        faqEnabled: true,
        contactEnabled: true,
        appointmentEnabled: true,
        // SEO Configuration
        seoTitle: `${orgData.name} - Professional Services`,
        seoDescription: orgData.description,
        seoKeywords: `${orgData.type.toLowerCase()}, services, professional`,
        // Contact Info
        mapUrl: "https://maps.google.com",
        workingHours: "شنبه تا چهارشنبه: 8:00 صبح - 6:00 عصر",
        emergencyPhone: generatePhone(),
        // Social Links
        facebookUrl: `https://facebook.com/${slug}`,
        twitterUrl: `https://twitter.com/${slug}`,
        instagramUrl: `https://instagram.com/${slug}`,
        linkedinUrl: `https://linkedin.com/company/${slug}`,
        telegramUrl: `https://t.me/${slug}`,
      },
    })
    
    createdOrgs.push({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      type: organization.type,
      services: [],
    })
  }
  
  console.log(`Created ${createdOrgs.length} organizations`)
  return createdOrgs
}

async function createServices(organizations: CreatedOrg[]) {
  console.log("Creating services...")
  
  for (const orgData of ORGANIZATION_DATA) {
    const org = organizations.find((o) => o.slug === generateSlug(orgData.name))
    if (!org) continue
    
    for (const serviceData of orgData.services) {
      const service = await prisma.service.create({
        data: {
          name: serviceData.name,
          description: `Professional ${serviceData.name.toLowerCase()} service`,
          duration: serviceData.duration,
          price: serviceData.price,
          currency: "IRR",
          color: serviceData.color,
          slotInterval: randomElement([15, 30, 45, 60]),
          isActive: true,
          organizationId: org.id,
        },
      })
      
      const orgIndex = organizations.findIndex((o) => o.id === org.id)
      organizations[orgIndex].services.push({
        id: service.id,
        name: service.name,
        duration: service.duration,
      })
    }
  }
  
  console.log("Services created")
}

async function createBusinessHours(organizations: CreatedOrg[]) {
  console.log("Creating business hours...")
  
  for (const org of organizations) {
    for (let day = 0; day < 7; day++) {
      if (day === 6) {
        await prisma.businessHours.upsert({
          where: {
            organizationId_dayOfWeek: {
              organizationId: org.id,
              dayOfWeek: day,
            },
          },
          update: {},
          create: {
            dayOfWeek: day,
            startTime: "00:00",
            endTime: "00:00",
            isActive: false,
            organizationId: org.id,
          },
        })
        continue
      }
      
      const startHour = randomBetween(8, 10)
      const endHour = randomBetween(17, 20)
      
      await prisma.businessHours.upsert({
        where: {
          organizationId_dayOfWeek: {
            organizationId: org.id,
            dayOfWeek: day,
          },
        },
        update: {},
        create: {
          dayOfWeek: day,
          startTime: `${startHour.toString().padStart(2, "0")}:00`,
          endTime: `${endHour.toString().padStart(2, "0")}:00`,
          isActive: true,
          organizationId: org.id,
        },
      })
    }
  }
  
  console.log("Business hours created")
}

async function createHolidays(organizations: CreatedOrg[]) {
  console.log("Creating holidays...")
  
  for (const org of organizations) {
    for (const holidayData of HOLIDAYS) {
      const date = new Date()
      date.setDate(date.getDate() + randomBetween(1, 365))
      
      await prisma.holiday.create({
        data: {
          date,
          name: holidayData.name,
          isRecurring: holidayData.isRecurring,
          organizationId: org.id,
        },
      })
    }
  }
  
  console.log("Holidays created")
}

async function createStaffMembers(staffUsers: CreatedUser[], organizations: CreatedOrg[]) {
  console.log("Creating staff members from converted staff users...")
  
  let staffCreated = 0
  const usedStaff = new Set<string>()
  
  for (const org of organizations) {
    // Assign 2-4 staff members per organization
    const staffCount = randomBetween(2, 4)
    
    // Get available staff not already assigned to this organization
    const availableStaff = staffUsers.filter(s => !usedStaff.has(s.id))
    const selectedStaff = availableStaff.slice(0, staffCount)
    
    for (let i = 0; i < selectedStaff.length; i++) {
      const user = selectedStaff[i]
      
      // Check if staff already exists
      const existingStaff = await prisma.staff.findUnique({
        where: { userId: user.id },
      })
      
      if (!existingStaff) {
        await prisma.staff.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            organizationId: org.id,
            hierarchy: i === 0 ? Hierarchy.OWNER as string : randomElement([Hierarchy.MANAGER, Hierarchy.MERCHANT]) as string,
            bio: `${user.name} is a staff member at ${org.name}`,
            isActive: true,
            isDefault: i === 0,
          },
        })
        usedStaff.add(user.id)
        staffCreated++
        console.log(`Created staff member ${user.username} for ${org.name}`)
      }
    }
  }
  
  console.log(`Created ${staffCreated} staff members`)
}

 async function createAppointments(staffUsers: CreatedUser[], organizations: CreatedOrg[]) {
  console.log("Creating appointments...")
  
  let appointmentCount = 0
  const statuses: string[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
  
  for (const org of organizations) {
    if (org.services.length === 0) continue
    
    // Create appointments for different time periods
    const dateRanges = [
      { daysAgo: 14, daysAhead: 7, label: "Past and current" },
      { daysAgo: 0, daysAhead: 14, label: "Current and near future" },
      { daysAgo: -7, daysAhead: 30, label: "Future appointments" },
    ]
    
    for (const range of dateRanges) {
      const appointmentCountRange = randomBetween(8, 15)
      
      for (let i = 0; i < appointmentCountRange; i++) {
        const service = randomElement(org.services)
        const status = randomElement(statuses)
        const client = randomElement(CLIENT_NAMES)
        const clientNameParts = client.split(" ")
        
        const startTime = new Date()
        startTime.setDate(startTime.getDate() + randomBetween(range.daysAgo, range.daysAhead))
        startTime.setHours(randomBetween(9, 18), randomBetween(0, 59), 0, 0)
        
        // Skip weekends
        if (startTime.getDay() === 6) {
          startTime.setDate(startTime.getDate() + 1)
        }
        
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + service.duration)
        
        // Get a random staff member for this organization
        const staff = await prisma.staff.findFirst({
          where: { organizationId: org.id },
        })
        
        await prisma.appointment.create({
          data: {
            startTime,
            endTime,
            status,
            notes: status === "CANCELLED" ? "Customer requested cancellation" : "Appointment booked for service",
            clientName: client,
            clientEmail: `${clientNameParts[0].toLowerCase()}.${clientNameParts[1].toLowerCase()}@email.com`,
            clientPhone: generatePhone(),
            cancellationReason: status === "CANCELLED" ? "Customer requested cancellation" : null,
            organizationId: org.id,
            serviceId: service.id,
            staffId: staff?.id || null,
            clientId: randomBetween(0, 1) === 0 ? staffUsers[randomBetween(0, staffUsers.length - 1)]?.id : null,
          },
        })
        
        appointmentCount++
      }
    }
  }
  
  console.log(`Created ${appointmentCount} appointments`)
  return appointmentCount
}

// ============================================
// Main Seed Function
// ============================================

export default async function main() {
  console.log("========================================")
  console.log("Database Seed Script")
  console.log("========================================\n")

  try {
    console.log("Cleaning existing data...")
    await prisma.appointment.deleteMany()
    await prisma.holiday.deleteMany()
    await prisma.businessHours.deleteMany()
    await prisma.service.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.organization.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()
    console.log("Existing data cleaned\n")

    // Step 1: Create admin user
    const admin = await createAdminUser()
    
    // Step 1.5: Create test users
    const testUsers = await createTestUsers()
    
    // Step 2: Create organizations (needed for staff creation)
    const organizations = await createOrganizations()
    
    // Step 3: Create client users
    const clientUsers = await createClientUsers()
    
    // Step 4: Convert some clients to staff and create Staff records
    const staffUsers = await convertClientsToStaff(clientUsers, organizations)
    
    // Step 5: Create services
    await createServices(organizations)
    
    // Step 6: Create business hours
    await createBusinessHours(organizations)
    
    // Step 7: Create holidays
    await createHolidays(organizations)
    
    // Step 8: Create staff members (sync with existing staff users)
    await createStaffMembers(staffUsers, organizations)
    await syncAllUsersStaff()
    //await syncAllUsersStaffByPrisma(prisma)
    
    
    // Step 8.5: Create staff for test users (first organization)
    console.log("Creating staff members from test users...")
    if (organizations.length > 0) {
      const org = organizations[0]
      for (let i = 0; i < testUsers.length; i++) {
        const testUser = testUsers[i]
        if (testUser.role === "OWNER" || testUser.role === "MANAGER" || testUser.role === "MERCHANT"|| testUser.role === "STAFF") {
          await prisma.staff.upsert({
            where: { userId: testUser.id },
            update: {},
            create: {
              userId: testUser.id,
              organizationId: org.id,
              hierarchy: testUser.role === "OWNER" ? Hierarchy.OWNER as string : 
                         testUser.role === "MANAGER" ? Hierarchy.MANAGER as string : 
                         Hierarchy.MERCHANT as string,
              bio: `${testUser.name} - Test ${testUser.role}`,
              isActive: true,
              isDefault: testUser.role === "OWNER",
            },
          })
          console.log(`Created staff member for test user: ${testUser.username}`)
        }
      }
    }
    
    // Step 9: Create appointments
    const appointmentCount = await createAppointments(staffUsers, organizations)

    console.log("\n========================================")
    console.log("Seed Complete!")
    console.log("========================================")
    console.log(`- Admin User: admin / Admin@123!`)
    console.log(`- Test Users: owner / Password123!, manager / Password123!, staff / Password123!, client / Password123!`)
    console.log(`- Organizations: ${organizations.length}`)
    console.log(`- Client Users: ${clientUsers.length}`)
    console.log(`- Converted to Staff: ${staffUsers.length}`)
    console.log(`- Appointments: ${appointmentCount}`)
    console.log("========================================\n")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

await main().catch((e) => {
  console.error(e)
  process.exit(1)
})