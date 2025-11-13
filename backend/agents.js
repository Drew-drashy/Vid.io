import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import data from "./data.js";
import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import z from "zod";
import { tool } from "langchain";



// 1️⃣ Initialize Gemini LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

// 2️⃣ Prepare documents and split into chunks
const docs = [new Document({ pageContent: data.content })];
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const chunks = await splitter.splitDocuments(docs);

// 3️⃣ Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});

// 4️⃣ Create an in-memory vector store
const vectorStore = new MemoryVectorStore(embeddings);
await vectorStore.addDocuments(chunks);

// // 5️⃣ Retrieve similar documents

// // 6️⃣ Create an agent (you can later add tools)
const agent = createReactAgent({
  llm,
  tools: [retrieveTool],
});
const retrieveTool = tool(async ({ query }) => {
  const retrievedDocs = await vectorStore.similaritySearch(query, 5);
  const serializedDocs = await retrievedDocs.map((docs)=>docs.pageContent).join("\n"); 
  return serializedDocs;
}, {
  name: "retrieve_tool",  // ✅ valid Gemini-safe name
  description: "Retrieve relevant chunks from transcript.",
  schema: z.object({
    query: z.string(),
  }),
});

// Optional: Run a query to test agent
const results = await agent.invoke({
  messages: [
    { role: "user", content: "Use the retrieve_tool to answer this: What did Nos finish first?" },
  ],
});

console.log(results);
// console.log("✅ Split Chunks:", chunks);
// console.log("🔍 Retrieved Docs:", retrievedDocs);
