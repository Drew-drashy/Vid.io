import { askRAG } from "../services/rag.service.js";

export const queryController = async (req, res) => {
  const { question, videoId } = req.body;

  const answer = await askRAG(question, videoId);

  res.json({ answer });
};
