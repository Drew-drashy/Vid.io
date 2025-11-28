import express from "express";
import ingest from "./ingest.routes.js";
import query from "./query.routes.js";
import job from './job.routes.js'

const router = express.Router();

router.use("/ingest", ingest);
router.use("/query", query);
router.use("/job",job )

export default router;
