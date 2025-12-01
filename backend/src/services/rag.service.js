import { agent } from "../rag/agent.js";

/**
 * Invokes the RAG agent to ask a question based on a video ID.
 * @param {string} question The question to ask the RAG agent.
 * @param {string} videoId The ID of the video to retrieve context from.
 * @returns {Promise<any>} The result of the agent invocation, or an error object.
 */
export async function askRAG(question, videoId) {
  try {
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Use retrieve_tool.\nvideoId: ${videoId}\nquestion: ${question}`
        }
      ]
    }, {
      configurable: { thread_id: "vidio-" + Date.now() }
    });

   
    return result;

  } catch (error) {
    console.error(`❌ Error in askRAG for videoId ${videoId}:`, error);
    return {
      error: true,
      message: "Failed to invoke the RAG agent.",
      details: error.message,
    };
  }
}