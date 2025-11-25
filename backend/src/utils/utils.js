export function extractVideoId(url) {
  try {
    const parsed = new URL(url);

    // 1. watch?v=VIDEOID
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    // 2. youtu.be/VIDEOID
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.substring(1).split("/")[0];
    }

    // 3. /shorts/VIDEOID
    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1].split("?")[0];
    }

    // 4. /embed/VIDEOID
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1].split("?")[0];
    }

    return null;
  } catch {
    return null;
  }
}
