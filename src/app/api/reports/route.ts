import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const projectId = searchParams.get("projectId");
    const workspace = searchParams.get("workspace");

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      // Default to last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateFilter = {
        gte: start,
        lte: end,
      };
    }

    // Build where clause
    const where: any = {
      userId: session.user.id,
      date: dateFilter,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (workspace && workspace !== "ALL") {
      where.workspace = workspace;
    }

    // Fetch time entries
    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: true,
        adjustments: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Process entries for response
    const processedEntries = entries.map((entry) => {
      const start = new Date(entry.startTime);
      const end = entry.endTime ? new Date(entry.endTime) : null;

      // Calculate duration including adjustments
      let durationMs = end ? end.getTime() - start.getTime() : 0;
      const adjustmentsTotal = entry.adjustments.reduce(
        (sum, adj) => sum + adj.minutes,
        0,
      );
      durationMs += adjustmentsTotal * 60 * 1000;

      const durationHours = durationMs / (1000 * 60 * 60);

      return {
        id: entry.id,
        date: format(new Date(entry.date), "yyyy-MM-dd"),
        startTime: format(start, "HH:mm"),
        endTime: end ? format(end, "HH:mm") : null,
        duration: formatDuration(durationMs),
        durationHours: Number(durationHours.toFixed(2)),
        description: entry.description,
        workspace: entry.workspace,
        project: entry.project
          ? {
              id: entry.project.id,
              name: entry.project.name,
              type: entry.project.type,
            }
          : null,
      };
    });

    // Calculate summary statistics
    const totalDurationMs = processedEntries.reduce(
      (sum, e) => sum + e.durationHours * 60 * 60 * 1000,
      0,
    );
    const totalHours = (totalDurationMs / (1000 * 60 * 60)).toFixed(1);

    // Group by date for daily breakdown
    const entriesByDate = processedEntries.reduce((acc: any, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = {
          date: entry.date,
          entries: [],
          totalHours: 0,
        };
      }
      acc[entry.date].entries.push(entry);
      acc[entry.date].totalHours += entry.durationHours;
      return acc;
    }, {});

    const dailyBreakdown = Object.values(entriesByDate).map((day: any) => ({
      ...day,
      totalHours: day.totalHours.toFixed(1) + "h",
    }));

    // Prepare chart data
    const chartData = processedEntries.reduce((acc: any, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          name: date.slice(5), // MM-DD format
          hours: 0,
        };
      }
      acc[date].hours += entry.durationHours;
      return acc;
    }, {});

    // Get unique projects
    const projects = new Set(
      processedEntries.map((e) => e.project?.name).filter(Boolean),
    );

    const response = {
      success: true,
      entries: processedEntries,
      dailyBreakdown,
      chartData: Object.values(chartData),
      summary: {
        totalEntries: processedEntries.length,
        totalDays: Object.keys(entriesByDate).length,
        totalHours: totalHours + "h",
        averagePerDay:
          (
            totalDurationMs /
            (1000 * 60 * 60) /
            Math.max(Object.keys(entriesByDate).length, 1)
          ).toFixed(1) + "h",
        totalProjects: projects.size,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
