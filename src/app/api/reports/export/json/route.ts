import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch data
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        project: true,
        adjustments: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate statistics
    const projectStats = entries.reduce((acc, entry) => {
      if (entry.project) {
        if (!acc[entry.project.id]) {
          acc[entry.project.id] = {
            projectId: entry.project.id,
            projectName: entry.project.name,
            totalDuration: 0,
            entryCount: 0,
          };
        }
        if (entry.endTime) {
          acc[entry.project.id].totalDuration +=
            entry.endTime.getTime() - entry.startDateTime.getTime();
        }
        acc[entry.project.id].entryCount++;
      }
      return acc;
    }, {});

    // Format data for export
    const exportData = {
      metadata: {
        generated: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        period: {
          start: startDate || "all time",
          end: endDate || "present",
        },
      },
      summary: {
        totalEntries: entries.length,
        totalTime: entries.reduce((sum, e) => {
          if (e.endTime) {
            return sum + (e.endTime.getTime() - e.startDateTime.getTime());
          }
          return sum;
        }, 0),
        uniqueDays: new Set(
          entries.map((e) => format(new Date(e.date), "yyyy-MM-dd")),
        ).size,
      },
      entries: entries.map((entry) => ({
        id: entry.id,
        date: entry.date,
        startDateTime: entry.startDateTime,
        endTime: entry.endTime,
        description: entry.description,
        workspace: entry.workspace,
        project: entry.project
          ? {
              id: entry.project.id,
              name: entry.project.name,
              type: entry.project.type,
            }
          : null,
        adjustments: entry.adjustments.map((adj) => ({
          minutes: adj.minutes,
          reason: adj.reason,
          createdAt: adj.createdAt,
        })),
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
      statistics: {
        byProject: Object.values(projectStats),
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="time-report-${format(new Date(), "yyyy-MM-dd")}.json"`,
      },
    });
  } catch (error) {
    console.error("JSON export error:", error);
    return NextResponse.json(
      { error: "Failed to generate JSON" },
      { status: 500 },
    );
  }
}
