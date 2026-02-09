import seed from "@/prisma/seed";
import { NextResponse } from "next/server";

export async function GET() {
    await seed();
    return NextResponse.json({ message: "Database seeded successfully" });
}