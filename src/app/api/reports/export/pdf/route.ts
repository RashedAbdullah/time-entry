import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

export async function GET() {
  const doc = new PDFDocument();

  const chunks: any[] = [];

  doc.on("data", (c) => chunks.push(c));

  doc.text("Monthly Time Report");

  doc.end();

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="report.pdf"',
    },
  });
}