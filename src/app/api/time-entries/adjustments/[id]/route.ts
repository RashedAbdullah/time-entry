import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await req.json();
    const { minutes, reason } = body;

    if (minutes === 0) {
      return NextResponse.json(
        { success: false, message: "minutes cannot be 0" },
        { status: 400 },
      );
    }

    const adjustment = await prisma.timeAdjustment.findFirst({
      where: {
        id,
        timeEntry: {
          userId: session.user.id,
        },
      },
    });

    if (!adjustment) {
      return NextResponse.json(
        { success: false, message: "Adjustment not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.timeAdjustment.update({
      where: { id },
      data: {
        minutes,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const adjustment = await prisma.timeAdjustment.findFirst({
      where: {
        id,
        timeEntry: {
          userId: session.user.id,
        },
      },
    });

    if (!adjustment) {
      return NextResponse.json(
        { success: false, message: "Adjustment not found" },
        { status: 404 },
      );
    }

    await prisma.timeAdjustment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Adjustment removed",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
