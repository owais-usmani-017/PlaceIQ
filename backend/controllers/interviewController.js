const Interview = require("../models/Interview"); // CLEAN FILE - no duplicates
const aiService = require("../services/aiService");
const scoringService = require("../services/scoringService");

const startInterview = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    return res.json({ message: "Interview started", role });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const getQuestion = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    const result = await aiService.generateQuestion(role);
    return res.json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to generate question", error: err.message });
  }
};

const evaluateSingleAnswer = async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Question and answer are required" });
    }
    const result = await aiService.evaluateAnswer(
      question,
      answer,
      role || "General",
    );
    return res.json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to evaluate answer", error: err.message });
  }
};

const finishInterview = async (req, res) => {
  try {
    const { role, answers } = req.body;
    const userId = req.user._id;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "No answers provided" });
    }

    const scores = scoringService.calculateScores(answers);

    const weakAreas =
      "Technical: " +
      scores.technical +
      "%, Clarity: " +
      scores.clarity +
      "%, Depth: " +
      scores.depth +
      "%";
    const roadmapData = await aiService.generateRoadmap(role, weakAreas);

    const interview = await Interview.create({
      userId,
      role,
      answers,
      finalScore: scores.finalScore,
      technicalScore: scores.technical,
      clarityScore: scores.clarity,
      depthScore: scores.depth,
      confidenceGap: scores.confidenceGap,
      riskLevel: scores.riskLevel,
      roadmap: roadmapData.steps || [],
    });

    return res.json({ interview });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to save interview", error: err.message });
  }
};

const getResult = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    return res.json({ interview });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(10);

    const totalInterviews = interviews.length;

    const avgScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce((a, b) => a + b.finalScore, 0) / totalInterviews,
          )
        : 0;

    const bestScore =
      totalInterviews > 0
        ? Math.max(
            ...interviews.map(function (i) {
              return i.finalScore;
            }),
          )
        : 0;

    return res.json({
      interviews,
      stats: { totalInterviews, avgScore, bestScore },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  startInterview,
  getQuestion,
  evaluateSingleAnswer,
  finishInterview,
  getResult,
  getDashboard,
};
