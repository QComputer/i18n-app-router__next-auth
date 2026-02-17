import { NextResponse } from "next/server";

// Dynamic import for seed module
async function runSeed() {
  if (process.env.NODE_ENV === 'development' && process.env.SEED === 'true') {
    try {
      (await import("@/prisma/seed")).default
      return { success: true }
    } catch (e) {
      console.error(e)
      process.exit(1)
      return { success: false, error: String(e) }
    }
  }
  return { success: false, message: "Seed not enabled (set SEED=true in development)" }
}

export async function GET() {
  const result = await runSeed()
  
  if (result.success) {
    return NextResponse.json({ message: "Database seeded successfully" })
  }
  
  return NextResponse.json({ 
    message: result.message || "Seed completed",
    error: result.error 
  })
}
