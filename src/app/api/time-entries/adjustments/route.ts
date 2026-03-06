import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();
    const { timeEntryId, minutes, reason } = body;

    if (!timeEntryId || minutes === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    const entry = await prisma.timeEntry.findFirst({
      where: {
        id: timeEntryId,
        userId: session.user.id,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    const adjustment = await prisma.timeAdjustment.create({
      data: {
        timeEntryId,
        minutes,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}