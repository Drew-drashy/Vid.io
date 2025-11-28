import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema({
  videoId: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Transcript", transcriptSchema);
