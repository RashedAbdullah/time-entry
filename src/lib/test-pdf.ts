import PDFDocument from 'pdfkit';
import * as fs from 'fs';

try {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('./output-test.pdf'));
  doc.font("Helvetica");
  doc.text("Test PDF generated.");
  doc.end();
  console.log("PDF generation finished successfully.");
} catch (error) {
  console.error(error);
}
