import z from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { tool } from "langchain";
import { searchSimilarChunks } from "./vectorStore.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash"
});

const retrieveTool = tool(
  async ({ query, videoId }) => {
    const results = await searchSimilarChunks(query, videoId);

    const contents = results
      .map(r => r.payload?.text || r.payload?.page_content || r.payload?.metadata?.text)
      .filter(Boolean);

    return contents.join("\n");
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
