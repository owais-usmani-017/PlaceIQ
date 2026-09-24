// backend/services/scoringService.js

const NON_ANSWER_PATTERNS = [
  // I don't know variations
  /^(i\s+)?do\s*not\s+know(?:\s+the)?(?:\s+answer)?[.!?]*$/i,
  /^(i\s+)?don't\s+know(?:\s+the)?(?:\s+answer)?[.!?]*$/i,
  /^(i\s+)?dont\s+know(?:\s+the)?(?:\s+answer)?[.!?]*$/i,
  /^(i\s+)?do\s*n't\s+know(?:\s+the)?(?:\s+answer)?[.!?]*$/i,

  // No idea
  /^(i\s+)?have\s+no\s+idea[.!?]*$/i,
  /^no\s+idea[.!?]*$/i,

  // Cannot answer
  /^(i\s+)?cannot\s+answer[.!?]*$/i,
  /^(i\s+)?can't\s+answer[.!?]*$/i,
  /^(i\s+)?cant\s+answer[.!?]*$/i,

  // Common interview skips
  /^(idk|i\.d\.k\.|n\/a|na|not\s+sure|pass|skip)[.!?]*$/i,

  // Empty/generic answers
  /^(?:the\s+)?answer(?:\s+is\s+(?:answer|this))?[.!?]*$/i,
  /^(?:this\s+is\s+)?(?:an?\s+)?answer[.!?]*$/i,

  // Yes/no without explanation
  /^(yes|no|maybe|okay|ok)[.!?]*$/i,
];

function normalizeAnswer(answer) {
  if (typeof answer !== "string") return "";

  return answer.trim().replace(/\s+/g, " ").toLowerCase();
}

function isNonAnswer(answer) {
  const normalized = normalizeAnswer(answer);

  if (!normalized) {
    return true;
  }

  return NON_ANSWER_PATTERNS.some((pattern) => pattern.test(normalized));
}

function boundedScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(10, Math.round(number)));
}

function boundedConfidenceGap(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}

function calculateScores(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return {
      finalScore: 0,
      technical: 0,
      clarity: 0,
      depth: 0,
      confidenceGap: 0,
      riskLevel: "High",
    };
  }

  /*
   * IMPORTANT:
   * Non-answers should NOT participate in the average.
   *
   * Example:
   * 9, 8, 7, 3, "I don't know"
   *
   * The non-answer is ignored here because it has already
   * received 0 during evaluation.
   *
   * This prevents the number of skipped questions from
   * artificially changing the average of answered questions.
   */

  const validAnswers = answers.filter((answer) => !isNonAnswer(answer?.answer));

  if (validAnswers.length === 0) {
    return {
      finalScore: 0,
      technical: 0,
      clarity: 0,
      depth: 0,
      confidenceGap: 0,
      riskLevel: "High",
    };
  }

  let technicalSum = 0;
  let claritySum = 0;
  let depthSum = 0;
  let confidenceGapSum = 0;

  for (const answer of validAnswers) {
    technicalSum += boundedScore(answer.technical);
    claritySum += boundedScore(answer.clarity);
    depthSum += boundedScore(answer.depth);
    confidenceGapSum += boundedConfidenceGap(answer.confidenceGap);
  }

  const count = validAnswers.length;

  const technical = Math.round((technicalSum / count) * 10);
  const clarity = Math.round((claritySum / count) * 10);
  const depth = Math.round((depthSum / count) * 10);
  const confidenceGap = Math.round(confidenceGapSum / count);

  /*
   * Final score:
   * Technical = 50%
   * Clarity   = 25%
   * Depth     = 25%
   */
  const finalScore = Math.round(
    technical * 0.5 + clarity * 0.25 + depth * 0.25,
  );

  let riskLevel;

  if (confidenceGap > 35 || finalScore < 60) {
    riskLevel = "High";
  } else if (finalScore >= 80 && confidenceGap <= 20) {
    riskLevel = "Low";
  } else {
    riskLevel = "Medium";
  }

  return {
    finalScore,
    technical,
    clarity,
    depth,
    confidenceGap,
    riskLevel,
  };
}

module.exports = {
  calculateScores,
  isNonAnswer,
};
