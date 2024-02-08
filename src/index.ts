import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connect";
import documentToSignRouter from "./routes/documentToSign";

dotenv.config();

// const pdfPath = "./Frontend Product Engineer Intern.pdf";
// const signaturePath = "./sign_image.png";
// const x = 400; // X coordinate
// const y = 500; // Y coordinate
// const pageNumber = 0; // Page number, starting from 0

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
  x: number,
  y: number,
  page = 0
) {
  try {
    // Load the existing PDF asynchronously
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Load the signature image asynchronously
    const signatureBytes = await fs.readFile(signaturePath);
    const signatureImage = await pdfDoc.embedPng(signatureBytes);

    // Add the signature to the specified page
    const pages = pdfDoc.getPages();
    const currentPage = pages[page];

    currentPage.drawImage(signatureImage, {
      x: x,
      y: y,
      width: signatureImage.width,
      height: signatureImage.height,
    });

    // Serialize the PDF to bytes
    const modifiedPdfBytes = await pdfDoc.save();

    // Write the modified PDF to a file asynchronously
    await fs.writeFile("signed_pdf.pdf", modifiedPdfBytes);
  } catch (error) {
    console.error("Error adding signature to PDF:", error);
  }
}

// async function addWatermarkToPDF() {}

// addSignaturesToPDF(pdfPath, signaturePath, x, y, pageNumber).then(() => {
//   console.log("Signature added to the PDF");
// });

const PORT: string | number = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/document", documentToSignRouter);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
