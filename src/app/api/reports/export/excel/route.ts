import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
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

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = session.user.name || "TimeTracker User";
    workbook.created = new Date();

    // Summary sheet
    const summarySheet = workbook.addWorksheet("Summary");

    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 20 },
      { header: "Value", key: "value", width: 15 },
    ];

    const totalMinutes = entries.reduce((sum, e) => {
      if (e.endTime) {
        return (
          sum + (e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60)
        );
      }
      return sum;
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    const uniqueDays = new Set(
      entries.map((e) => format(new Date(e.date), "yyyy-MM-dd")),
    ).size;

    summarySheet.addRow([
      "Report Period",
      `${startDate ? format(new Date(startDate), "PPP") : "All time"} - ${endDate ? format(new Date(endDate), "PPP") : "Present"}`,
    ]);
    summarySheet.addRow(["Generated", format(new Date(), "PPP HH:mm")]);
    summarySheet.addRow(["Total Entries", entries.length]);
    summarySheet.addRow(["Total Time", `${totalHours}h ${remainingMinutes}m`]);
    summarySheet.addRow(["Days with Entries", uniqueDays]);
    summarySheet.addRow([
      "Average per Day",
      entries.length > 0
        ? `${(totalMinutes / uniqueDays / 60).toFixed(1)}h`
        : "0h",
    ]);

    // Style header row
    summarySheet.getRow(1).font = { bold: true };

    // Details sheet
    const detailsSheet = workbook.addWorksheet("Time Entries");

    detailsSheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Project", key: "project", width: 20 },
      { header: "Description", key: "description", width: 30 },
      { header: "Workspace", key: "workspace", width: 12 },
      { header: "Start Time", key: "startTime", width: 10 },
      { header: "End Time", key: "endTime", width: 10 },
      { header: "Duration", key: "duration", width: 15 },
      { header: "Adjustments", key: "adjustments", width: 12 },
    ];

    // Style header
    detailsSheet.getRow(1).font = { bold: true };
    detailsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    detailsSheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // Add data
    entries.forEach((entry) => {
      const start = new Date(entry.startTime);
      const end = entry.endTime ? new Date(entry.endTime) : null;

      let duration = "";
      let durationMinutes = 0;
      if (end) {
        durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const hours = Math.floor(durationMinutes / 60);
        const mins = Math.floor(durationMinutes % 60);
        duration = `${hours}h ${mins}m`;
      } else {
        duration = "In progress";
      }

      const adjustmentsTotal = entry.adjustments.reduce(
        (sum, adj) => sum + adj.minutes,
        0,
      );

      detailsSheet.addRow({
        date: format(new Date(entry.date), "PP"),
        project: entry.project?.name || "-",
        description: entry.description || "-",
        workspace: entry.workspace,
        startTime: format(start, "HH:mm"),
        endTime: end ? format(end, "HH:mm") : "-",
        duration: duration,
        adjustments:
          adjustmentsTotal !== 0
            ? `${adjustmentsTotal > 0 ? "+" : ""}${adjustmentsTotal}m`
            : "-",
      });
    });

    // Projects summary sheet
    const projectsSheet = workbook.addWorksheet("Projects Summary");

    const projectStats = entries.reduce((acc: any, entry) => {
      if (entry.project) {
        if (!acc[entry.project.id]) {
          acc[entry.project.id] = {
            name: entry.project.name,
            type: entry.project.type,
            totalMinutes: 0,
            entryCount: 0,
          };
        }
        if (entry.endTime) {
          const minutes =
            (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60);
          acc[entry.project.id].totalMinutes += minutes;
        }
        acc[entry.project.id].entryCount++;
      }
      return acc;
    }, {});

    projectsSheet.columns = [
      { header: "Project", key: "project", width: 25 },
      { header: "Type", key: "type", width: 15 },
      { header: "Entries", key: "entries", width: 10 },
      { header: "Total Hours", key: "hours", width: 15 },
    ];

    projectsSheet.getRow(1).font = { bold: true };

    Object.values(projectStats).forEach((stat: any) => {
      const hours = Math.floor(stat.totalMinutes / 60);
      const minutes = Math.floor(stat.totalMinutes % 60);
      projectsSheet.addRow({
        project: stat.name,
        type: stat.type,
        entries: stat.entryCount,
        hours: `${hours}h ${minutes}m`,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="time-report-${format(new Date(), "yyyy-MM-dd")}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 },
    );
  }
}
