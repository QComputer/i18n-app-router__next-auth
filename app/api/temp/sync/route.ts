import { syncAllUsersStaff } from "@/lib/sync/user-staff-sync";
import { NextResponse } from "next/server";

export async function GET() {
  syncAllUsersStaff()
  return NextResponse.json({ message: "User-Staff sync succed" });
    
}