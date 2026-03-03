import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------
   Helpers
------------------------------------------- */

function normalizeDateFromDateTime(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/* ==========================================
   GET /api/time-entries/[entryId]
========================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

/* ==========================================
   PATCH /api/time-entries/[entryId]
========================================== */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const {
      startTime,
      endTime,
      projectId,
      workspace,
      description,
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
        { status: 404 }
      );
    }

    /* ---------------------------------
       Validate Time Logic
    ---------------------------------- */

    let parsedStart = existingEntry.startTime;
    let parsedEnd = existingEntry.endTime;

    if (startTime) parsedStart = new Date(startTime);
    if (endTime) parsedEnd = new Date(endTime);

    if (parsedEnd && parsedEnd <= parsedStart) {
      return NextResponse.json(
        { success: false, message: "endTime must be greater than startTime" },
        { status: 400 }
      );
    }

    /* ---------------------------------
       Validate Project Ownership
    ---------------------------------- */

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
          { status: 400 }
        );
      }
    }

    /* ---------------------------------
       Update Entry
    ---------------------------------- */

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        startTime: parsedStart,
        endTime: parsedEnd,
        projectId: projectId ?? existingEntry.projectId,
        workspace: workspace ?? existingEntry.workspace,
        description:
          description !== undefined
            ? description
            : existingEntry.description,
        date: normalizeDateFromDateTime(parsedStart),
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
      { status: 500 }
    );
  }
}

/* ==========================================
   DELETE /api/time-entries/[entryId]
========================================== */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
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
        { status: 404 }
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
      { status: 500 }
    );
  }
}