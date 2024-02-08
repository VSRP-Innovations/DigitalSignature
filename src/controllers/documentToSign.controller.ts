import { Request, Response } from "express";
import db from "../models/index";
import multerS3 from "multer-s3";
import multer from "multer";
import s3Client from "../aws/s3.config";

const { DocumentToSign, DocumentCoordinates } = db;

type Coordinate = {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "shopbot-aws-bucket",
    key: function (req: Request, file: any, cb: any) {
      cb(null, `documents/${file?.originalname}`);
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
  const transaction = await DocumentToSign.sequelize.transaction();
  try {
    uploadMiddleware(req, res, async (err: any) => {
      if (err) {
        console.log(err);
        await transaction.rollback();
        return res.status(500).json({ error: "Error uploading file to S3" });
      }

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
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error uploading file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const signDocument = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const documentId = body.id;

    const document = await DocumentToSign.findOne({
      where: { id: documentId },
    });
    if (!document) {
      return res.status(404).json({ message: "File not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export { createDocument, getDocuments, signDocument };
