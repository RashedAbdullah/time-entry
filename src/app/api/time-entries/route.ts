import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { normalizeDate, timeStringToDate } from "@/lib/date-formatters";

function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);

  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));

  return { start, end };
}

/* ==========================================
   GET /api/time-entries
========================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const projectId = searchParams.get("projectId");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    let where: any = {
      userId: session.user.id,
    };

    console.log("Log date ", date);
    // Filter by specific date
    if (date) {
      where.date = normalizeDate(date);
    }

    // Filter by month
    if (month) {
      const { start, end } = getMonthRange(month);
      where.date = {
        gte: start,
        lt: end,
      };
    }

    // Filter by project
    if (projectId) {
      where.projectId = projectId;
    }

    const [entries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true, type: true },
          },
          adjustments: true,
        },
        orderBy: { startTime: "desc" },
        skip,
        take: limit,
      }),
      prisma.timeEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("GET TIME ENTRIES ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch time entries" },
      { status: 500 },
    );
  }
}

/* ==========================================
   POST /api/time-entries
========================================== */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const { date, startTime, endTime, projectId, workspace, description } =
      body;

    /* -------------------------------
       Basic Validation
    -------------------------------- */

    if (!date || !startTime) {
      return NextResponse.json(
        { success: false, message: "Date and startTime are required" },
        { status: 400 },
      );
    }

    console.log("startTime ", startTime);
    const parsedStart = timeStringToDate(startTime, normalizeDate(date));
    console.log("parsedStart ", parsedStart);
    const parsedEnd = endTime
      ? timeStringToDate(endTime, normalizeDate(date))
      : null;

    if (parsedEnd && parsedEnd <= parsedStart) {
      return NextResponse.json(
        { success: false, message: "endTime must be greater than startTime" },
        { status: 400 },
      );
    }

    /* -------------------------------
       Validate Project Ownership
    -------------------------------- */

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { success: false, message: "Invalid project" },
          { status: 400 },
        );
      }
    }

    /* -------------------------------
       Create Time Entry
    -------------------------------- */

    const entry = await prisma.timeEntry.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        date: normalizeDate(date),
        startTime: parsedStart,
        endTime: parsedEnd,
        workspace: workspace || "OFFICE",
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: entry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE TIME ENTRY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create time entry" },
      { status: 500 },
    );
  }
}
