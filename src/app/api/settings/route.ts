import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { monthlyGoalHours: true, monthlySalary: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      monthlyGoalHours: user?.monthlyGoalHours ?? null,
      monthlySalary: user?.monthlySalary ? Number(user.monthlySalary) : null,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { monthlyGoalHours, monthlySalary } = body;

  if (
    monthlyGoalHours !== null &&
    monthlyGoalHours !== undefined &&
    (typeof monthlyGoalHours !== "number" || monthlyGoalHours <= 0)
  ) {
    return NextResponse.json(
      { success: false, message: "Monthly goal hours must be a positive number" },
      { status: 400 },
    );
  }

  if (
    monthlySalary !== null &&
    monthlySalary !== undefined &&
    (typeof monthlySalary !== "number" || monthlySalary < 0)
  ) {
    return NextResponse.json(
      { success: false, message: "Monthly salary must be a positive number" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      monthlyGoalHours: monthlyGoalHours ?? null,
      monthlySalary: monthlySalary ?? null,
    },
    select: { monthlyGoalHours: true, monthlySalary: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      monthlyGoalHours: updated.monthlyGoalHours ?? null,
      monthlySalary: updated.monthlySalary ? Number(updated.monthlySalary) : null,
    },
  });
}
