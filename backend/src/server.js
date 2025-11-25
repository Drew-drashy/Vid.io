import "dotenv/config";
import { connectDB } from "./config/db.js";
import { initQdrant } from "./rag/qdrant.js";
import { app } from "./app.js";

(async () => {
  try {
    console.log("🚀 Starting backend...");

    // Connect Mongo
    await connectDB();

    // Connect Qdrant + ensure collection exists
    await initQdrant();

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1); 
  }
})();
