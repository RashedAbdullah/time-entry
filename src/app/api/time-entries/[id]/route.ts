import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { normalizeDate, timeStringToDate } from "@/lib/date-formatters";

/* ==========================================
   GET /api/time-entries/[id]
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

    const { id } = await params;

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: session.user.id, // 🔐 ownership check
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        adjustments: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Time entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("GET SINGLE ENTRY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch entry" },
      { status: 500 },
    );
  }
}

/* ==========================================
   PATCH /api/time-entries/[id]
========================================== */

export async function PATCH(
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

    const { id } = await params;
    const body = await req.json();

    const {
      startDateTime,
      endTime,
      projectId,
      workspace,
      description,
      date,
      excluded,
    } = body;

    /* ---------------------------------
       Check Entry Ownership
    ---------------------------------- */

    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, message: "Time entry not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       Validate Time Logic
    ---------------------------------- */

    // The calendar day the new start/end times should be anchored to. Fall
    // back to the entry's existing day if the client didn't send one, so a
    // partial update (e.g. only changing the project) never re-derives the
    // wrong date from an undefined value.
    const dayForTimes = date ? normalizeDate(date) : existingEntry.date;

    let parsedStart = existingEntry.startDateTime;
    let parsedEnd = existingEntry.endTime;

    if (startDateTime) parsedStart = timeStringToDate(startDateTime, dayForTimes);
    if (endTime) parsedEnd = timeStringToDate(endTime, dayForTimes);

    if (parsedEnd && parsedEnd <= parsedStart) {
      return NextResponse.json(
        { success: false, message: "End time must be after start time" },
        { status: 400 },
      );
    }

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

    /* ---------------------------------
       Update Entry
    ---------------------------------- */

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        date: dayForTimes,
        startDateTime: parsedStart,
        endTime: parsedEnd,
        projectId: projectId !== undefined ? projectId : existingEntry.projectId,
        workspace: workspace ?? existingEntry.workspace,
        description:
          description !== undefined ? description : existingEntry.description,
        excluded: excluded !== undefined ? Boolean(excluded) : existingEntry.excluded,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE ENTRY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update entry" },
      { status: 500 },
    );
  }
}

/* ==========================================
   DELETE /api/time-entries/[entryId]
========================================== */

export async function DELETE(
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

    const { id } = await params;

    /* ---------------------------------
       Ensure Ownership
    ---------------------------------- */

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Time entry not found" },
        { status: 404 },
      );
    }

    /* ---------------------------------
       Delete Entry
       (Adjustments cascade automatically
       if onDelete: Cascade in schema)
    ---------------------------------- */

    await prisma.timeEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Time entry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ENTRY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete entry" },
      { status: 500 },
    );
  }
}
