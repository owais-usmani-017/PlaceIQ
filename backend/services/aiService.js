const axios = require("axios");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

const callGroq = async function (prompt) {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.GROQ_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.log(
      "GROQ ERROR:",
      err.response?.status,
      JSON.stringify(err.response?.data),
    );
    throw err;
  }
};

const safeParseJSON = function (text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse AI response: " + text);
  }
};

const score = function (value, field, maximum) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > maximum) {
    throw new Error("Invalid AI value for " + field);
  }

  return Math.round(number);
};

const generateQuestion = async function (role) {
  const prompt =
    "You are a strict technical interviewer at a top tech company.\n" +
    "Generate ONE realistic interview question for a " +
    role +
    " developer position.\n" +
    "Make it practical and challenging but fair.\n" +
    "Return ONLY this JSON, nothing else:\n" +
    '{"question": "your question here"}';

  const text = await callGroq(prompt);
  const result = safeParseJSON(text);

  if (
    !result ||
    typeof result.question !== "string" ||
    !result.question.trim()
  ) {
    throw new Error("Invalid AI question response");
  }

  return { question: result.question.trim() };
};

const evaluateAnswer = async function (question, answer, role) {
  const prompt =
    "You are a senior technical interviewer evaluating a " +
    role +
    " developer candidate.\n\n" +
    "Question: " +
    question +
    "\n" +
    "Candidate Answer: " +
    answer +
    "\n\n" +
    "Evaluate honestly. If the answer is very short or wrong, give low scores.\n" +
    "If the answer is confident but wrong, set confidenceGap high (40-60).\n\n" +
    "Return ONLY this JSON:\n" +
    "{\n" +
    '  "technical": 7,\n' +
    '  "clarity": 6,\n' +
    '  "depth": 5,\n' +
    '  "confidenceGap": 20,\n' +
    '  "feedback": "one specific sentence of feedback"\n' +
    "}";

  const text = await callGroq(prompt);
  const result = safeParseJSON(text);

  if (!result || typeof result.feedback !== "string") {
    throw new Error("Invalid AI evaluation response");
  }

  return {
    technical: score(result.technical, "technical", 10),
    clarity: score(result.clarity, "clarity", 10),
    depth: score(result.depth, "depth", 10),
    confidenceGap: score(result.confidenceGap, "confidenceGap", 100),
    feedback: result.feedback.trim(),
  };
};

const generateRoadmap = async function (role, weakAreas) {
  const prompt =
    "You are a placement mentor helping a " +
    role +
    " developer improve.\n\n" +
    "Their weak areas from interview: " +
    weakAreas +
    "\n\n" +
    "Generate exactly 5 specific, actionable improvement steps.\n" +
    "Return ONLY this JSON:\n" +
    '{"steps": ["step1", "step2", "step3", "step4", "step5"]}';

  const text = await callGroq(prompt);
  const result = safeParseJSON(text);

  if (
    !result ||
    !Array.isArray(result.steps) ||
    result.steps.length === 0 ||
    result.steps.some((step) => typeof step !== "string" || !step.trim())
  ) {
    throw new Error("Invalid AI roadmap response");
  }

  return { steps: result.steps.slice(0, 5).map((step) => step.trim()) };
};

module.exports = { generateQuestion, evaluateAnswer, generateRoadmap };
