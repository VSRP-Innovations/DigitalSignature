import express, { Router } from "express";
import {
  createDocument,
  getDocuments,
  signDocument,
} from "../controllers/documentToSign.controller";

const router: Router = express.Router();

router.route("/list").get(getDocuments);
router.route("/upload").post(createDocument);
router.route("/sign").post(signDocument);

export default router;
