export async function embedQueryPython(text) {
  const resp = await fetch(process.env.EMBEDDING_SERVICE_URL + "/embed-query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await resp.json();
  if (!data.embedding) throw new Error("Python returned no embedding");

  return data.embedding; // float[768]
}