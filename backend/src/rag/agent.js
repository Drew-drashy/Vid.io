import z from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, tool } from "langchain";
import { getVectorStore } from "./vectorStore.js";
import { embedQueryPython } from "../services/embedding.service.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash"
});

const retrieveTool = tool(
  async ({ query, videoId }) => {
    try {
      const store = await getVectorStore();

      // Make sure query is valid
      if (!query || typeof query !== "string") {
        throw new Error("Query must be a non-empty string.");
      }

      // Embed the question
      const queryEmbedding = await embedQueryPython(query);

      if (!Array.isArray(queryEmbedding)) {
        throw new Error("Embedding service returned invalid format.");
      }

      console.log("Embedding:", queryEmbedding);
      console.log("Filtering by videoId:", videoId);
      const filter = {
  "must": [
      { "key": "videoId", "match": { "value": videoId } },
  ]
};

      // Perform filtered search
      const docs = await store.similaritySearchVectorWithScore(
        queryEmbedding,
        5,
        filter
      );

      console.log("RESULTS:", docs);

      if (!docs || docs.length === 0) {
        return "No transcript found for this video.";
      }

      return docs.map(d => d[0].pageContent).join("\n");

    } catch (err) {
      console.error("❌ retrieve_tool error:", err);

      return `Error: ${err.message || "Something went wrong in retrieve_tool."}`;
    }
  },
  {
    name: "retrieve_tool",
    description: `
Retrieve transcript for ANY question about the video.
Always call this tool.
`,
    schema: z.object({
      query: z.string(),
      videoId: z.string()
    })
  }
);



export const agent = createAgent({
  model: llm,                  // REQUIRED
  tools: [retrieveTool],       // REQUIRED
  // optional but useful — ensures tool is always used
  messageModifier: (input) => ({
    ...input,
    content: `Always use retrieve_tool to answer questions.\n${input.content}`,
  }),
});
