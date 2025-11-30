import fetch from "node-fetch";

const EMBEDDING_SERVICE_URL =
  process.env.EMBEDDING_SERVICE_URL || "http://localhost:5050/embed";
const SPLIT_EMBED_URL =
  process.env.SPLIT_EMBED_URL || "http://localhost:5050/split-embed";

export async function embedTexts(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("texts array is required to embed");
  }

  const response = await fetch(EMBEDDING_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Embedding service error (${response.status}): ${message || "unknown"}`
    );
  }

  const data = await response.json();
  if (!Array.isArray(data.vectors)) {
    throw new Error("Invalid embedding service response");
  }

  return data.vectors;
}

export async function splitAndEmbed(text, options = {}) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("text is required to split and embed");
  }

  const response = await fetch(SPLIT_EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      chunkSize: options.chunkSize,
      chunkOverlap: options.chunkOverlap
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Split-embed service error (${response.status}): ${message || "unknown"}`
    );
  }

  const data = await response.json();
  if (!Array.isArray(data.vectors) || !Array.isArray(data.chunks)) {
    throw new Error("Invalid split-embed service response");
  }

  return data;
}
