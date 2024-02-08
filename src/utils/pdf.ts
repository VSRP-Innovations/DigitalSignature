import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import { Coordinate } from "../types";

/**
 *
 * @param {string} pdfPath Pass the pdf file path
 * @param {string} signaturePath Pass the signature file path
 * @param {number} x
 * @param {number} y
 * @param {number} page
 * @returns {Promise<void>}
 */
async function addSignaturesToPDF(
  pdfPath: string,
  signaturePath: string,
  coordinates: Coordinate[]
) {
  try {
    // Load the existing PDF asynchronously
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Load the signature image asynchronously
    const signatureBytes = await fs.readFile(signaturePath);
    const signatureImage = await pdfDoc.embedPng(signatureBytes);

    coordinates.forEach((coordinate) => {
      const { x, y, height, width, page } = coordinate;
      const pages = pdfDoc.getPages();
      const currentPage = pages[page];
      // Add the signature to the specified page

      currentPage.drawImage(signatureImage, {
        x: x,
        y: y,
        width: signatureImage.width,
        height: signatureImage.height,
      });
    });

    // Serialize the PDF to bytes
    const modifiedPdfBytes = await pdfDoc.save();

    // Write the modified PDF to a file asynchronously
    await fs.writeFile("signed_pdf.pdf", modifiedPdfBytes);
  } catch (error) {
    console.error("Error adding signature to PDF:", error);
  }
}

export { addSignaturesToPDF };
