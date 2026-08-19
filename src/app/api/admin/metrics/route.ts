import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { DEFAULT_AI_MODEL } from "@/lib/ai/openai-client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!session?.user || !isAdminEmail(email)) {
      // Return 404 for security so unauthorized users don't even know this endpoint exists
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Fetch all users with their accounts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        aoe2ProfileId: true,
        aoe2Name: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalUsers = users.length;
    const linkedUsers = users.filter((u) => u.aoe2ProfileId !== null).length;
    const unlinkedUsers = totalUsers - linkedUsers;
    const linkedPercentage = totalUsers > 0 ? Math.round((linkedUsers / totalUsers) * 1000) / 10 : 0;

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const sevenDaysAgo = new Date(now.getTime() - 7 * msPerDay);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * msPerDay);
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const usersLast7Days = users.filter((u) => new Date(u.createdAt) >= sevenDaysAgo).length;
    const usersLast30Days = users.filter((u) => new Date(u.createdAt) >= thirtyDaysAgo).length;
    const usersThisMonth = users.filter((u) => new Date(u.createdAt) >= startOfCurrentMonth).length;
    const usersPrevMonth = users.filter((u) => {
      const d = new Date(u.createdAt);
      return d >= startOfPrevMonth && d <= endOfPrevMonth;
    }).length;

    // Month-over-month growth percentage
    const momGrowth =
      usersPrevMonth > 0
        ? Math.round(((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 1000) / 10
        : usersThisMonth > 0
        ? 100
        : 0;

    // Provider distribution
    const providerCounts: Record<string, number> = {};
    for (const u of users) {
      if (u.accounts.length === 0) {
        providerCounts["unknown"] = (providerCounts["unknown"] || 0) + 1;
      } else {
        for (const acc of u.accounts) {
          const p = acc.provider.toLowerCase();
          providerCounts[p] = (providerCounts[p] || 0) + 1;
        }
      }
    }

    // Monthly signups history
    const monthlyMap = new Map<string, number>();
    for (const u of users) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }
    const monthlyHistory = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Daily signups for the last 30 days
    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * msPerDay);
      const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(
        dayDate.getDate()
      ).padStart(2, "0")}`;
      dailyMap.set(key, 0);
    }

    for (const u of users) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    }

    const dailyHistory = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    // Clean user rows for table
    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name || "Anonymous",
      email: u.email || "No email",
      image: u.image,
      createdAt: u.createdAt,
      aoe2ProfileId: u.aoe2ProfileId,
      aoe2Name: u.aoe2Name,
      provider: u.accounts[0]?.provider || "google",
    }));

    return NextResponse.json({
      kpis: {
        totalUsers,
        linkedUsers,
        unlinkedUsers,
        linkedPercentage,
        usersLast7Days,
        usersLast30Days,
        usersThisMonth,
        usersPrevMonth,
        momGrowth,
      },
      providers: providerCounts,
      charts: {
        monthlyHistory,
        dailyHistory,
      },
      users: formattedUsers,
      system: {
        model: DEFAULT_AI_MODEL,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV || "development",
        serverRegion: "eu-west-1",
      },
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
