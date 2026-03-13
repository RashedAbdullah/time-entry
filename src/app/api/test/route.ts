import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET(req: NextRequest) {
  try {
    const doc = new PDFDocument();
    
    const stream = new ReadableStream({
      start(controller) {
        doc.on("data", (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        doc.on("end", () => {
          controller.close();
        });
        doc.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    doc.text("Hello world");
    doc.end();

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
