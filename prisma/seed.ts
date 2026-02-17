/**
 * Comprehensive Database Seed Script
 * 
 * Creates organizations with:
 * - Owner account: {slug}_owner
 * - Staff accounts: {slug}_staff_1 to {slug}_staff_5-10
 * - Client accounts: {slug}_client_1 to {slug}_client_10-20
 * 
 * Run with: npm run db:seed
 * 
 * Environment Variables:
 * - SEED_LOG=true - Enable logging output
 * - SEED_LOG=false (default) - Suppress logging
 */

import "dotenv/config"

import { OrganizationType, ThemeMode, Hierarchy, FollowingTargetType } from "@/lib/generated/prisma/enums"
import bcrypt from "bcryptjs"

import prisma from "@/lib/db/prisma"

// ============================================
// Logging Utility
// ============================================

const SEED_LOG_ENABLED = process.env.SEED_LOG === "true"

const log = {
  log: (...args: unknown[]) => {
    if (SEED_LOG_ENABLED) console.log(...args)
  },
  info: (...args: unknown[]) => {
    if (SEED_LOG_ENABLED) console.info(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}


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

// Get avatar URL from pravatar.cc (using index for consistency)
function getAvatarUrl(index: number): string {
  return `https://i.pravatar.cc/300?img=${index}`
}

// ============================================
// Organization Data
// ============================================

interface ServiceData {
  name: string
  duration: number
  price: number
  color: string
}

interface CategoryData {
  name: string
  description: string
  services: ServiceData[]
}

interface ProductData {
  name: string
  price: number
}

interface ProductCategoryData {
  name: string
  products: ProductData[]
}

interface OrgData {
  name: string
  organizationType: OrganizationType
  description: string
  address: string
  phone: string
  email: string
  website: string
  categories: CategoryData[]
  productCategories?: ProductCategoryData[]
}

const ORGANIZATIONS: OrgData[] = [
  // RESTAURANT
  {
    name: "Tehran Garden Restaurant",
    organizationType: OrganizationType.RESTAURANT,
    description: "Traditional Persian cuisine in an elegant setting. Experience authentic flavors with modern presentation.",
    address: "123 Vali Asr Street, Tehran",
    phone: "021-88881234",
    email: "info@tehangarden.ir",
    website: "https://tehangarden.ir",
    categories: [
      { name: "Reservations", description: "Table booking services", services: [
        { name: "Table Reservation", duration: 15, price: 0, color: "#b45309" },
      ]},
      { name: "Special Events", description: "Private dining and catering", services: [
        { name: "Private Dining Room", duration: 180, price: 5000000, color: "#92400e" },
        { name: "Catering Service", duration: 240, price: 15000000, color: "#78350f" },
      ]},
    ],
    productCategories: [
      { name: "Appetizers", products: [
        { name: "Truffle Fries", price: 250000 },
        { name: "Bruschetta", price: 180000 },
        { name: "Calamari", price: 320000 },
        { name: "Soup of the Day", price: 150000 },
      ]},
      { name: "Main Courses", products: [
        { name: "Grilled Salmon", price: 850000 },
        { name: "Filet Mignon", price: 1200000 },
        { name: "Chicken Parmesan", price: 650000 },
        { name: "Kebab Komb", price: 950000 },
      ]},
      { name: "Desserts", products: [
        { name: "Tiramisu", price: 280000 },
        { name: "Chocolate Lava Cake", price: 320000 },
        { name: "Cheesecake", price: 250000 },
      ]},
      { name: "Beverages", products: [
        { name: "Fresh Orange Juice", price: 120000 },
        { name: "Espresso", price: 85000 },
        { name: "Soft Drinks", price: 45000 },
        { name: "Green Tea", price: 65000 },
      ]},
    ],
  },
  // MARKET
  {
    name: "Fresh Foods Supermarket",
    organizationType: OrganizationType.MARKET,
    description: "Quality groceries and fresh produce delivered to your door.",
    address: "456 Shariati Street, Tehran",
    phone: "021-55551234",
    email: "contact@freshfoods.ir",
    website: "https://freshfoods.ir",
    categories: [
      { name: "Order Services", description: "Online ordering and pickup", services: [
        { name: "Online Order Pickup", duration: 30, price: 0, color: "#22c55e" },
        { name: "Home Delivery", duration: 60, price: 150000, color: "#16a34a" },
      ]},
    ],
    productCategories: [
      { name: "Fruits & Vegetables", products: [
        { name: "Fresh Apples (1kg)", price: 150000 },
        { name: "Fresh Bananas (1kg)", price: 80000 },
        { name: "Organic Tomatoes (1kg)", price: 120000 },
        { name: "Fresh Lettuce", price: 90000 },
        { name: "Cucumbers", price: 65000 },
      ]},
      { name: "Dairy Products", products: [
        { name: "Whole Milk (1L)", price: 65000 },
        { name: "Greek Yogurt", price: 95000 },
        { name: "Cheese Block", price: 180000 },
        { name: "Butter (250g)", price: 75000 },
      ]},
      { name: "Bakery", products: [
        { name: "Sourdough Bread", price: 45000 },
        { name: "Croissants (4pcs)", price: 60000 },
        { name: "Bagels (6pcs)", price: 35000 },
        { name: "Baguette", price: 28000 },
      ]},
      { name: "Beverages", products: [
        { name: "Sparkling Water (6pcs)", price: 120000 },
        { name: "Natural Juice (1L)", price: 95000 },
        { name: "Tea Box", price: 85000 },
      ]},
    ],
  },
  // DOCTOR/DENTAL
  {
    name: "Dr. Karimi Dental Clinic",
    organizationType: OrganizationType.DOCTOR,
    description: "Professional dental care services including whitening, implants, and orthodontics.",
    address: "789 Motahhari Street, Tehran",
    phone: "021-33331234",
    email: "info@karimidental.ir",
    website: "https://karimidental.ir",
    categories: [
      { name: "Consultations", description: "Initial consultations and checkups", services: [
        { name: "Dental Consultation", duration: 30, price: 500000, color: "#3b82f6" },
        { name: "Orthodontic Consultation", duration: 45, price: 750000, color: "#8b5cf6" },
      ]},
      { name: "Cosmetic Dentistry", description: "Aesthetic dental treatments", services: [
        { name: "Teeth Whitening", duration: 60, price: 1500000, color: "#10b981" },
        { name: "Dental Veneers", duration: 90, price: 3500000, color: "#14b8a6" },
      ]},
      { name: "Surgical Procedures", description: "Surgical dental treatments", services: [
        { name: "Dental Implant", duration: 120, price: 8000000, color: "#f59e0b" },
        { name: "Root Canal", duration: 90, price: 2500000, color: "#f97316" },
      ]},
    ],
  },
  // SALON
  {
    name: "Elite Beauty Salon",
    organizationType: OrganizationType.SALON,
    description: "Premium hair and beauty services for all occasions.",
    address: "321 Vanak Square, Tehran",
    phone: "021-88881234",
    email: "booking@elitebeauty.ir",
    website: "https://elitebeauty.ir",
    categories: [
      { name: "Hair Services", description: "Hair styling and coloring", services: [
        { name: "Haircut & Styling", duration: 45, price: 350000, color: "#ec4899" },
        { name: "Hair Coloring", duration: 120, price: 1200000, color: "#f97316" },
        { name: "Hair Treatment", duration: 60, price: 450000, color: "#f43f5e" },
      ]},
      { name: "Nail Services", description: "Manicure and pedicure treatments", services: [
        { name: "Manicure", duration: 30, price: 250000, color: "#06b6d4" },
        { name: "Pedicure", duration: 45, price: 350000, color: "#0891b2" },
        { name: "Nail Art", duration: 60, price: 450000, color: "#0e7490" },
      ]},
      { name: "Makeup Services", description: "Professional makeup application", services: [
        { name: "Makeup Application", duration: 60, price: 800000, color: "#a855f7" },
        { name: "Bridal Makeup", duration: 120, price: 2500000, color: "#7c3aed" },
      ]},
    ],
  },
  // LAW FIRM
  {
    name: "Iran Legal Associates",
    organizationType: OrganizationType.LAWYER,
    description: "Comprehensive legal services for individuals and businesses.",
    address: "555 Keshavarz Blvd, Tehran",
    phone: "021-44441234",
    email: "info@iranlegal.ir",
    website: "https://iranlegal.ir",
    categories: [
      { name: "Consultations", description: "Legal consultation services", services: [
        { name: "Initial Consultation", duration: 60, price: 1000000, color: "#1e40af" },
        { name: "Emergency Consultation", duration: 30, price: 1500000, color: "#1e3a8a" },
      ]},
      { name: "Contract Services", description: "Contract review and drafting", services: [
        { name: "Contract Review", duration: 90, price: 2000000, color: "#3b82f6" },
        { name: "Contract Drafting", duration: 120, price: 3000000, color: "#2563eb" },
      ]},
      { name: "Court Representation", description: "Legal representation in court", services: [
        { name: "Court Representation", duration: 240, price: 5000000, color: "#1e3a8a" },
        { name: "Appeal Process", duration: 180, price: 4000000, color: "#172554" },
      ]},
    ],
  },
]

// ============================================
// Seed Functions
// ============================================

async function createUser(username: string, name: string, role: string, avatarIndex: number) {
  const hashedPassword = await bcrypt.hash("Password123!", 10)
  
  return await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      email: `${username}@example.com`,
      name,
      phone: generatePhone(),
      password: hashedPassword,
      role,
      locale: randomElement(["fa", "en"]),
      themeMode: randomElement([ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.SYSTEM]),
      image: getAvatarUrl(avatarIndex),
    },
  })
}

// Create admin user
async function createAdminUser() {
  const adminUsername = "admin"
  const adminName = "System Administrator"
  const hashedPassword = await bcrypt.hash("Password123!", 10)
  
  return await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      email: "admin@example.com",
      name: adminName,
      phone: "021-88880000",
      password: hashedPassword,
      role: "ADMIN",
      locale: "fa",
      themeMode: ThemeMode.SYSTEM,
      image: getAvatarUrl(100),
    },
  })
}

async function createOrganization(orgData: OrgData, index: number) {
  const slug = generateSlug(orgData.name)
  
  return await prisma.organization.upsert({
    where: { slug },
    update: {},
    create: {
      name: orgData.name,
      slug,
      organizationType: orgData.organizationType,
      description: orgData.description,
      address: orgData.address,
      phone: orgData.phone,
      email: orgData.email,
      website: orgData.website,
      logo: getAvatarUrl(index + 1),
      coverImage: getAvatarUrl(index + 20),
      avatarImage: getAvatarUrl(index + 1),
      timezone: "Asia/Tehran",
      locale: "fa",
      themeMode: ThemeMode.SYSTEM,
      primaryColor: randomElement(["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]),
      secondaryColor: "#64748b",
      isActive: true,
      workingHours: "شنبه تا چهارشنبه: 9:00 صبح - 6:00 عصر",
    },
  })
}

async function createStaffForOrganization(orgId: string, orgSlug: string, orgData: OrgData, ownerIndex: number, staffCount: number) {
  const staffMembers = []
  
  // Create owner
  const ownerUsername = `${orgSlug}_owner`
  const ownerName = `${orgData.name} Owner`
  const owner = await createUser(ownerUsername, ownerName, "STAFF", ownerIndex)
  
  const ownerStaff = await prisma.staff.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      organizationId: orgId,
      hierarchy: Hierarchy.OWNER,
      bio: `Owner of ${orgData.name}`,
      isActive: true,
      isDefault: true,
      avatarImage: getAvatarUrl(ownerIndex),
    },
  })
  staffMembers.push({ userId: owner.id, staffId: ownerStaff.id })
  
  // Create staff members
  for (let i = 1; i <= staffCount; i++) {
    const staffUsername = `${orgSlug}_staff_${i}`
    const staffName = `${orgData.name} Staff ${i}`
    const staff = await createUser(staffUsername, staffName, "STAFF", ownerIndex + i)
    
    const staffMember = await prisma.staff.upsert({
      where: { userId: staff.id },
      update: {},
      create: {
        userId: staff.id,
        organizationId: orgId,
        hierarchy: i <= 2 ? Hierarchy.MANAGER : Hierarchy.MERCHANT,
        bio: `Staff member at ${orgData.name}`,
        isActive: true,
        isDefault: false,
        avatarImage: getAvatarUrl(ownerIndex + i),
      },
    })
    staffMembers.push({ userId: staff.id, staffId: staffMember.id })
  }
  
  return staffMembers
}

async function createClientsForOrganization(orgId: string, orgSlug: string, clientStartIndex: number, clientCount: number) {
  const clientNames = [
    "Zahra Amiri", "Hassan Najafi", "Samira Rahmati", "Mehdi Ghasemi", 
    "Leila Karimian", "Amir Hosseini", "Niloufar Mosavi", "Ehsan Shakeri",
    "Mina Sadeghi", "Morteza Akhavan", "Sara Farhadi", "Ali Akbarpour",
    "Roxana Hedayati", "Kambiz Farzad", "Maryam Gholami", "Reza Tavakoli",
    "Fatemeh Nosrati", "Hamed Soleimani", "Javad Ahmadi", "Parviz Mika"
  ]
  
  const clients = []
  for (let i = 0; i < clientCount; i++) {
    const clientUsername = `${orgSlug}_client_${i + 1}`
    const nameIndex = (clientStartIndex + i) % clientNames.length
    const clientName = `${clientNames[nameIndex]} ${i + 1}`
    
    const client = await createUser(clientUsername, clientName, "CLIENT", clientStartIndex + 50 + i)
    clients.push({ userId: client.id, username: client.username })
  }
  
  return clients
}

async function createServiceCategoriesAndServices(orgId: string, orgData: OrgData, staffMembers: Array<{staffId: string}>) {
  for (const categoryData of orgData.categories) {
    const category = await prisma.serviceCategory.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        organizationId: orgId,
      },
    })
    
    for (const serviceData of categoryData.services) {
      const assignedStaff = randomElement(staffMembers)
      
      await prisma.service.create({
        data: {
          name: serviceData.name,
          description: `Professional ${serviceData.name.toLowerCase()} service`,
          duration: serviceData.duration,
          price: serviceData.price,
          currency: "IRR",
          color: serviceData.color,
          isActive: true,
          staffId: assignedStaff.staffId,
          serviceCategoryId: category.id,
        },
      })
    }
  }
}

async function createProductCategoriesAndProducts(orgId: string, orgData: OrgData) {
  if (!orgData.productCategories) return
  
  for (const categoryData of orgData.productCategories) {
    const category = await prisma.productCategory.create({
      data: {
        name: categoryData.name,
        description: `${categoryData.name} at ${orgData.name}`,
      },
    })
    
    for (const productData of categoryData.products) {
      await prisma.product.create({
        data: {
          name: productData.name,
          price: productData.price,
          currency: "IRR",
          isActive: true,
          organizationId: orgId,
          productCategoryId: category.id,
          image: getAvatarUrl(randomBetween(1, 40)),
        },
      })
    }
  }
}

async function createFollows(orgId: string, clients: Array<{userId: string}>, staffMembers: Array<{staffId: string}>, services: Array<{id: string}>) {
  // Each client follows 2-5 organizations, staff, and services
  for (const client of clients) {
    const followOrgCount = randomBetween(2, 5)
    const followServiceCount = randomBetween(3, 7)
    const followStaffCount = randomBetween(1, 3)
    
    // Follow organizations
    for (let i = 0; i < followOrgCount; i++) {
      const randomOrg = ORGANIZATIONS[randomBetween(0, ORGANIZATIONS.length - 1)]
      const orgSlug = generateSlug(randomOrg.name)
      
      try {
        await prisma.following.create({
          data: {
            userId: client.userId,
            targetId: orgSlug, // We'll need to look up the actual org ID
            TargetType: FollowingTargetType.ORGANIZATION,
          },
        })
      } catch (e) {
        // Ignore duplicate follows
      }
    }
    
    // Follow services
    for (let i = 0; i < followServiceCount; i++) {
      if (services.length === 0) break
      const randomService = randomElement(services)
      
      try {
        await prisma.following.create({
          data: {
            userId: client.userId,
            targetId: randomService.id,
            TargetType: FollowingTargetType.SERVICE,
          },
        })
      } catch (e) {
        // Ignore
      }
    }
    
    // Follow staff
    for (let i = 0; i < followStaffCount; i++) {
      if (staffMembers.length === 0) break
      const randomStaff = randomElement(staffMembers)
      
      try {
        await prisma.following.create({
          data: {
            userId: client.userId,
            targetId: randomStaff.staffId,
            TargetType: FollowingTargetType.STAFF,
          },
        })
      } catch (e) {
        // Ignore
      }
    }
  }
}

// ============================================
// Main Seed Function
// ============================================

export default async function main() {
  log.log("========================================")
  log.log("Comprehensive Database Seed")
  log.log("========================================\n")

  try {
    // Clean existing data
    log.log("Cleaning existing data...")
    await prisma.following.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.product.deleteMany()
    await prisma.productCategory.deleteMany()
    await prisma.service.deleteMany()
    await prisma.serviceCategory.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.organization.deleteMany()
    await prisma.driver.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()
    log.log("Existing data cleaned\n")

    // Create admin user
    log.log("Creating admin user...")
    await createAdminUser()
    log.log("  - Admin user created: admin / Password123!\n")

    // Track all created entities
    const allStaff: Array<{orgId: string; staffId: string}> = []
    const allClients: Array<{orgId: string; userId: string}> = []
    const allServices: Array<{orgId: string; id: string}> = []
    const organizationMap: Record<string, string> = {}

    // Create organizations with owners, staff, and clients
    for (let i = 0; i < ORGANIZATIONS.length; i++) {
      const orgData = ORGANIZATIONS[i]
      const orgSlug = generateSlug(orgData.name)
      
      log.log(`Creating ${orgData.name}...`)
      
      // Create organization
      const org = await createOrganization(orgData, i)
      organizationMap[orgSlug] = org.id
      log.log(`  - Organization created: ${org.name} (${org.organizationType})`)
      
      // Create staff (owner + 5-10 staff members)
      const staffCount = randomBetween(5, 10)
      const staffMembers = await createStaffForOrganization(org.id, orgSlug, orgData, i * 15, staffCount)
      log.log(`  - Created ${staffMembers.length} staff members`)
      
      for (const staff of staffMembers) {
        allStaff.push({ orgId: org.id, staffId: staff.staffId })
      }
      
      // Create clients (10-20 clients)
      const clientCount = randomBetween(10, 20)
      const clients = await createClientsForOrganization(org.id, orgSlug, i * 25, clientCount)
      log.log(`  - Created ${clients.length} client accounts`)
      
      for (const client of clients) {
        allClients.push({ orgId: org.id, userId: client.userId })
      }
      
      // Create service categories and services
      await createServiceCategoriesAndServices(org.id, orgData, staffMembers)
      log.log(`  - Created service categories and services`)
      
      // Get created services for follows
      const services = await prisma.service.findMany({
        where: { staff: { organizationId: org.id } },
        select: { id: true }
      })
      for (const svc of services) {
        allServices.push({ orgId: org.id, id: svc.id })
      }
      
      // Create product categories and products for MARKET and RESTAURANT
      if (orgData.productCategories) {
        await createProductCategoriesAndProducts(org.id, orgData)
        log.log(`  - Created product categories and products`)
      }
      
      log.log("")
    }

    // Create follows
    log.log("Creating follows...")
    let followCount = 0
    for (const orgData of ORGANIZATIONS) {
      const orgSlug = generateSlug(orgData.name)
      const orgId = organizationMap[orgSlug]
      
      // Get clients for this organization
      const orgClients = allClients.filter(c => c.orgId === orgId)
      const orgStaff = allStaff.filter(s => s.orgId === orgId)
      const orgServices = allServices.filter(s => s.orgId === orgId)
      
      for (const client of orgClients.slice(0, 10)) { // Use first 10 clients to follow
        // Track followed targets for this client
        const followedServices = new Set<string>()
        const followedStaff = new Set<string>()
        
        // Follow the organization
        try {
          await prisma.following.create({
            data: {
              userId: client.userId,
              targetId: orgId,
              TargetType: FollowingTargetType.ORGANIZATION,
            },
          })
          followCount++
        } catch (e) {}
        
        // Follow 2-4 random services (avoid duplicates)
        const serviceFollowCount = randomBetween(2, 4)
        for (let i = 0; i < serviceFollowCount; i++) {
          if (orgServices.length === 0) break
          const randomSvc = randomElement(orgServices)
          if (followedServices.has(randomSvc.id)) continue
          followedServices.add(randomSvc.id)
          try {
            await prisma.following.create({
              data: {
                userId: client.userId,
                targetId: randomSvc.id,
                TargetType: FollowingTargetType.SERVICE,
              },
            })
            followCount++
          } catch (e) {}
        }
        
        // Follow 1-2 random staff (avoid duplicates)
        const staffFollowCount = randomBetween(1, 2)
        for (let i = 0; i < staffFollowCount; i++) {
          if (orgStaff.length === 0) break
          const randomStaff = randomElement(orgStaff)
          if (followedStaff.has(randomStaff.staffId)) continue
          followedStaff.add(randomStaff.staffId)
          try {
            await prisma.following.create({
              data: {
                userId: client.userId,
                targetId: randomStaff.staffId,
                TargetType: FollowingTargetType.STAFF,
              },
            })
            followCount++
          } catch (e) {}
        }
      }
    }
    log.log(`  - Created ${followCount} follows\n`)

    // Summary
    const orgCount = ORGANIZATIONS.length
    const totalStaff = allStaff.length
    const totalClients = allClients.length
    
    log.log("========================================")
    log.log("Seed Complete!")
    log.log("========================================")
    log.log(`Organizations: ${orgCount}`)
    log.log(`Staff Members: ${totalStaff}`)
    log.log(`Client Accounts: ${totalClients}`)
    log.log(`Follows: ${followCount}`)
    log.log("\nTest Accounts:")
    for (const orgData of ORGANIZATIONS) {
      const slug = generateSlug(orgData.name)
      log.log(`  ${orgData.name}:`)
      log.log(`    Owner: ${slug}_owner / Password123!`)
      log.log(`    Staff: ${slug}_staff_1 / Password123!`)
      log.log(`    Client: ${slug}_client_1 / Password123!`)
    }
    log.log("========================================\n")
  } catch (error) {
    log.error("Error seeding database:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

await main().catch((e) => {
  log.error(e)
  process.exit(1)
})
