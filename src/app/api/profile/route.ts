import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompanionProfile } from "@/lib/api/relic";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`profile:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aoe2ProfileId: true, aoe2Name: true },
    });

    if (!user?.aoe2ProfileId) {
      return NextResponse.json({ linked: false });
    }

    return NextResponse.json({
      linked: true,
      profileId: user.aoe2ProfileId,
      name: user.aoe2Name,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`profile:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }

    const body = await req.json();
    const { profileId } = body;

    if (!profileId || typeof profileId !== "number" || !Number.isInteger(profileId)) {
      return NextResponse.json(
        { error: "Valid integer profileId is required" },
        { status: 400 },
      );
    }

    const companionProfile = await getCompanionProfile(profileId);

    const userId = (session.user as Record<string, unknown>).id as string;
    await prisma.user.update({
      where: { id: userId },
      data: {
        aoe2ProfileId: profileId,
        aoe2Name: companionProfile.name,
      },
    });

    return NextResponse.json({
      linked: true,
      profileId,
      name: companionProfile.name,
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
