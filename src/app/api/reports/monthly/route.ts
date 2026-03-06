import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const month = new URL(req.url).searchParams.get("month");
  if (!month) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const [year, m] = month.split("-").map(Number);

  const start = new Date(Date.UTC(year, m - 1, 1));
  const end = new Date(Date.UTC(year, m, 1));

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lt: end },
    },
    include: {
      adjustments: true,
      project: true,
    },
    orderBy: { startTime: "asc" },
  });

  const days: any = {};
  let totalMinutes = 0;

  for (const e of entries) {
    const dateKey = e.date.toISOString().slice(0, 10);

    const base = e.endTime
      ? (e.endTime.getTime() - e.startTime.getTime()) / 60000
      : 0;

    const adjust = e.adjustments.reduce((a, b) => a + b.minutes, 0);

    const minutes = base + adjust;

    totalMinutes += minutes;

    if (!days[dateKey]) {
      days[dateKey] = {
        date: dateKey,
        totalMinutes: 0,
        entries: [],
      };
    }

    days[dateKey].entries.push(e);
    days[dateKey].totalMinutes += minutes;
  }

  return NextResponse.json({
    success: true,
    data: {
      month,
      totalMinutes,
      totalHoursFormatted: formatMinutes(totalMinutes),
      days: Object.values(days),
    },
  });
}
