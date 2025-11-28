
const videoJob = new mongoose.schema({
    videoId: String,
 status: {
    type: String,
    default: "pending", // pending | processing | completed | failed
  },
  createdAt: { type: Date, default: Date.now }
})
export default mongoose.model("Job", videoJob);