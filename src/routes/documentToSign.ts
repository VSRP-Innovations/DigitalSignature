import express, { Router } from "express";
import {
  createDocument,
  getDocuments,
  signDocument,
} from "../controllers/documentToSign.controller";

const router: Router = express.Router();

router.route("/").get(getDocuments).post(createDocument);
router.route("/sign").post(signDocument);
// router
//   .route("/:id")
//   .get(getDocument)
//   .put(upload.single("image"));

export default router;
