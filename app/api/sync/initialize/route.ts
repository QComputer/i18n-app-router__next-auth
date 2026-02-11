/**
 * API Route to Initialize User-Staff Sync Handler
 * 
 * This endpoint initializes the event-based sync system on app startup.
 * It's called automatically when the Next.js app starts.
 */

import { initializeUserStaffSync } from "@/lib/sync/user-staff-sync"
import { syncAllUsersStaff } from "@/lib/sync/user-staff-sync"
import { NextResponse } from "next/server"

let initialized = false

export async function GET() {
  // Prevent multiple initializations
  if (initialized) {
    return NextResponse.json({ 
      status: "already_initialized",
      message: "User-Staff sync handler already initialized",
    })
  }

  try {
    console.log("[API] Initializing User-Staff sync handler...")
    
    // Initialize event listeners
    const cleanup = initializeUserStaffSync()
    
    // Store cleanup function for potential shutdown
    if (typeof global !== 'undefined') {
      (global as any).__userStaffSyncCleanup = cleanup
    }
    
    initialized = true
    
    console.log("[API] User-Staff sync handler initialized successfully")
    
    return NextResponse.json({ 
      status: "initialized",
      message: "User-Staff sync handler initialized",
    })
  } catch (error) {
    console.error("[API] Failed to initialize User-Staff sync handler:", error)
    return NextResponse.json({ 
      status: "error",
      message: "Failed to initialize sync handler",
      error: String(error),
    }, { status: 500 })
  }
}

/**
 * POST: Trigger a full sync of all users
 */
export async function POST() {
  try {
    console.log("[API] Triggering full user-staff sync...")
    
    await syncAllUsersStaff()
    
    return NextResponse.json({ 
      status: "success",
      message: "Full sync completed",
    })
  } catch (error) {
    console.error("[API] Failed to sync users:", error)
    return NextResponse.json({ 
      status: "error",
      message: "Failed to sync users",
      error: String(error),
    }, { status: 500 })
  }
}
