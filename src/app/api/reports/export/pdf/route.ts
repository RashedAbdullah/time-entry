import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { TimeEntry } from "@prisma/client";

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
      },
      orderBy: {
        date: "asc",
      },
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text("Time Tracking Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Generated: ${format(new Date(), "PPP")}`, { align: "center" });
    doc.text(
      `Period: ${startDate ? format(new Date(startDate), "PPP") : "All time"} - ${endDate ? format(new Date(endDate), "PPP") : "Present"}`,
    );
    doc.moveDown();

    // Summary
    const totalMinutes = entries.reduce((sum: number, e: TimeEntry) => {
      if (e.endTime) {
        return (
          sum + (e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60)
        );
      }
      return sum;
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.floor(totalMinutes % 60);

    doc.fontSize(14).text("Summary");
    doc.fontSize(10).text(`Total Entries: ${entries.length}`);
    doc.text(`Total Time: ${totalHours}h ${remainingMinutes}m`);
    doc.text(
      `Days with Entries: ${new Set(entries.map((e) => format(new Date(e.date), "yyyy-MM-dd"))).size}`,
    );
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const itemHeight = 20;
    const colWidths = [100, 150, 100, 80];

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Date", 50, tableTop);
    doc.text("Project", 150, tableTop);
    doc.text("Description", 300, tableTop);
    doc.text("Duration", 450, tableTop);
    doc.moveDown();

    // Table rows
    doc.font("Helvetica");
    let y = tableTop + itemHeight;

    entries.forEach((entry) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const duration = entry.endTime
        ? `${Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60))}m`
        : "In progress";

      doc.text(format(new Date(entry.date), "PP"), 50, y);
      doc.text(entry.project?.name || "-", 150, y, { width: 140 });
      doc.text(entry.description?.substring(0, 30) || "-", 300, y, {
        width: 140,
      });
      doc.text(duration, 450, y);

      y += itemHeight;
    });

    // Finalize PDF using Web Streams API
    const stream = new ReadableStream({
      start(controller) {
        doc.on("data", (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        doc.on("end", () => {
          controller.close();
        });
        doc.on("error", (err) => {
          console.error("PDF generation stream error:", err);
          controller.error(err);
        });
      },
    });

    doc.end();

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="time-report-${format(new Date(), "yyyy-MM-dd")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message, stack: error.stack },
      { status: 500 },
    );
  }
}
