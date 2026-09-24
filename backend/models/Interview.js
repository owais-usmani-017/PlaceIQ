const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: { type: String },
  answer: { type: String },
  technical: { type: Number, default: 0 },
  clarity: { type: Number, default: 0 },
  depth: { type: Number, default: 0 },
  confidenceGap: { type: Number, default: 0 },
  feedback: { type: String },
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: { type: String, required: true, trim: true },
  answers: [answerSchema],
  finalScore: { type: Number, default: 0, min: 0, max: 100 },
  technicalScore: { type: Number, default: 0, min: 0, max: 100 },
  clarityScore: { type: Number, default: 0, min: 0, max: 100 },
  depthScore: { type: Number, default: 0, min: 0, max: 100 },
  confidenceGap: { type: Number, default: 0, min: 0, max: 100 },
  riskLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  roadmap: [String],
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

interviewSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model("Interview", interviewSchema);
