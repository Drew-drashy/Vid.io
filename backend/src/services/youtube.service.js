import fetch from "node-fetch";
import  Transcript from "../models/transcript.model.js";

export async function getSupadata(videoId) {
    const youtubeUrl = `https://youtu.be/${videoId}`;
  const url = new URL("https://api.supadata.ai/v1/transcript");
  url.searchParams.append("url", youtubeUrl);
  url.searchParams.append("lang", "en");
  url.searchParams.append("format", "json");
  url.searchParams.append("text", "true");


  const headers = {
    "x-api-key": process.env.SUPADATA_API_KEY,
  };

  try {
    console.log("📡 Supadata Request:", url.toString());

    const response = await fetch(url.toString(), { headers });
    const json = await response.json();
    console.log(json);

    // if (!response.ok || json.status !== "success") {
    //   throw new Error(
    //     `Supadata Error: ${json.message || response.statusText}`
    //   );
    // }

    return json?.content; 

  } catch (err) {
    console.error("❌ Supadata request failed:", err.message);
    throw err;
  }
}

export async function fetchTranscript(videoId) {
  const data = await getSupadata(videoId);
  return data;
}
