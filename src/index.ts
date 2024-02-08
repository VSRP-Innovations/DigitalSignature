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
