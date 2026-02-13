import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  //adapter: new PrismaPg({
  //  connectionString: process.env.DATABASE_URL,
  //}),
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
})

export default prisma

// Hot reload fix: reassign global in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
