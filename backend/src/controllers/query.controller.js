import { askRAG } from "../services/rag.service.js";

export const queryController = async (req, res) => {
  const { question, videoId } = req.body;

  const result = await askRAG(question, videoId);
  const answer = normalizeAnswer(result);

  res.json({ answer });
};

function normalizeAnswer(result) {
  if (!result) return "No answer returned.";

  // If agent already returned plain text
  if (typeof result === "string") return result;
  if (typeof result?.content === "string") return result.content;

  // LangChain AgentExecutor often returns { messages: [...] }
  if (Array.isArray(result?.messages) && result.messages.length > 0) {
    const last = result.messages[result.messages.length - 1];
    if (typeof last?.content === "string") return last.content;

    // Some responses use a content array; stringify for now
    if (Array.isArray(last?.content)) {
      try {
        return last.content
          .map((c) => (typeof c === "string" ? c : JSON.stringify(c)))
          .join("\n");
      } catch {
        /* fallthrough */
      }
    }
  }

  // Fallback: compact JSON so UI shows something human-readable
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return "Unable to parse answer.";
  }
}
