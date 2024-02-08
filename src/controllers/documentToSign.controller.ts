import { Request, Response } from "express";
import db from "../models/index";
import multerS3 from "multer-s3";
import multer from "multer";
import s3Client from "../aws/s3.config";
import { v4 as uuidv4 } from "uuid";
import { downloadDocumentInTemporaryFolder } from "../s3";
import { Coordinate } from "../types";
import { addSignaturesToPDF } from "../utils/pdf";

const { DocumentToSign, DocumentCoordinates } = db;

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "shopbot-aws-bucket",
    key: function (req: Request, file: any, cb: any) {
      cb(null, `documents/${uuidv4()}-${file?.originalname}`);
    },
  }),
});

const uploadMiddleware = upload.single("document");

const getDocuments = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.body;
    console.log(req.body);
    const offset = (page - 1) * limit;

    const documents = await DocumentToSign.findAll({
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    const totalCount = await DocumentToSign.count();

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: documents,
      currentPage: page,
      totalPages: totalPages,
      totalDocuments: totalCount,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

const createDocument = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (err: any) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error uploading file to S3" });
    }

    const transaction = await DocumentToSign.sequelize.transaction();
    try {
      const { key } = req.file as any;

      const document = await DocumentToSign.create(
        { s3Key: key },
        { transaction }
      );

      const { coordinates }: { coordinates: Coordinate[] } = req.body;

      const coordinatesToStore = coordinates.map((coordinate) => {
        return {
          ...coordinate,
          documentId: document.dataValues.id,
        };
      });

      await DocumentCoordinates.bulkCreate(coordinatesToStore, { transaction });
      await document.save();
      await transaction.commit();

      return res.status(200).json({ message: "File uploaded successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error("Error uploading file:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

const signDocument = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const documentId = body.id;

    console.log(req.body);
    console.log(req.file);
    const document = await DocumentToSign.findOne({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ message: "File not found!" });
    }

    const { s3Key } = document;

    console.log(s3Key);

    const coordinates: Coordinate[] = await DocumentCoordinates.findAll({
      where: { id: documentId },
    });

    const filePath = await downloadDocumentInTemporaryFolder(s3Key);

    if (!filePath) {
      return res.status(400).json({ message: "File not found!" });
    }

    await addSignaturesToPDF(filePath, "", coordinates);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export { createDocument, getDocuments, signDocument };
