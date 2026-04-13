import { NextResponse } from "next/server";
import { getTournaments } from "@/lib/api/liquipedia";

export async function GET() {
  try {
    const tournaments = await getTournaments();
    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error("Tournaments error:", error);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}
