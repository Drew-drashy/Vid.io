import { Router } from "express";
import { updateJobStatus } from "../controllers/job.controller.js";

const router = Router()
router.use("/status", updateJobStatus)
export default router