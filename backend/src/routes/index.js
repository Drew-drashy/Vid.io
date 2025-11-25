import express from "express";
import ingest from "./ingest.routes.js";
import query from "./query.routes.js";

const router = express.Router();

router.use("/ingest", ingest);
router.use("/query", query);

export default router;
