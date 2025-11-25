import express from "express";
import { queryController } from "../controllers/query.controller.js";

const router = express.Router();
router.post("/", queryController);

export default router;
