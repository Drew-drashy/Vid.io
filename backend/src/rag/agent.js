import z from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "langchain";
import { getVectorStore } from "./vectorStore.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash"
});

const retrieveTool = tool(
  async ({ query, videoId }) => {
    const store = await getVectorStore();
    const docs = await store.similaritySearch(query, 5, {
      videoId
    });
    return docs.map(d => d.pageContent).join("\n");
  },
  {
    name: "retrieve_tool",
    description: "Retrieve transcript chunks",
    schema: z.object({
      query: z.string(),
      videoId: z.string()
    })
  }
);

export const agent = createReactAgent({
  llm,
  tools: [retrieveTool],
  checkpointer: new MemorySaver()
});
