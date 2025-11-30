import { Router } from "express";
import { getJobStatus, updateJobStatus } from "../controllers/job.controller.js";

const router = Router()
router.post("/status", updateJobStatus)
router.get("/status/:jobId", getJobStatus)
export default router