import { agent } from "../rag/agent.js";

export async function askRAG(question, videoId) {
  return await agent.invoke({
    messages: [
      {
        role: "user",
        content: `Use retrieve_tool.\nvideoId: ${videoId}\nquestion: ${question}`
      }
    ]
  });
}
