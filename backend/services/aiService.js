// backend/services/aiService.js

const axios = require("axios");
const { isNonAnswer } = require("./scoringService");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODEL = "openai/gpt-oss-20b";

/*
 * Call Groq
 */
const callGroq = async function (prompt) {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        /*
         * Lower temperature makes evaluation more
         * deterministic and consistent.
         */
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.GROQ_API_KEY,
          "Content-Type": "application/json",
        },

        timeout: 30000,
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

/*
 * Safely parse JSON returned by the model.
 */
const safeParseJSON = function (text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    /*
     * Try to extract the first JSON object.
     */
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Could not parse AI response: " + text);
    }

    try {
      return JSON.parse(match[0]);
    } catch (parseError) {
      throw new Error("Could not parse AI JSON response");
    }
  }
};

/*
 * Validate score returned by AI.
 */
const score = function (value, field, maximum) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > maximum) {
    throw new Error("Invalid AI value for " + field);
  }

  return Math.round(number);
};

/*
 * Generate one interview question.
 */
const generateQuestion = async function (role) {
  const prompt =
    "You are a strict technical interviewer at a top technology company.\n\n" +
    "Generate ONE realistic technical interview question for a " +
    role +
    " developer position.\n\n" +
    "Requirements:\n" +
    "- The question should test actual technical understanding.\n" +
    "- It should be practical and challenging but fair.\n" +
    "- Avoid trivia.\n" +
    "- Do not provide the answer.\n\n" +
    "Return ONLY valid JSON in exactly this format:\n" +
    '{"question":"your question here"}';

  const text = await callGroq(prompt);

  const result = safeParseJSON(text);

  if (
    !result ||
    typeof result.question !== "string" ||
    !result.question.trim()
  ) {
    throw new Error("Invalid AI question response");
  }

  return {
    question: result.question.trim(),
  };
};

/*
 * Evaluate candidate answer.
 */
const evaluateAnswer = async function (question, answer, role) {
  /*
   * CRITICAL:
   *
   * Detect non-answers BEFORE calling the AI.
   *
   * This guarantees that:
   *
   * "I don't know"
   * "idk"
   * "no idea"
   * "pass"
   * "skip"
   *
   * never receive accidental AI scores such as 1/10
   * or 3/10.
   */
  if (isNonAnswer(answer)) {
    return {
      technical: 0,
      clarity: 0,
      depth: 0,
      confidenceGap: 0,
      feedback:
        "No answer was provided. Give a specific explanation related to the question.",
    };
  }

  const prompt = `
You are a strict senior technical interviewer evaluating a candidate for a ${role} developer position.

Your job is to evaluate ONLY what the candidate actually demonstrated.

QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

==================================================
SCORING RUBRIC
==================================================

TECHNICAL SCORE — 0 to 10

10:
Exceptional answer. Completely correct, optimal where optimization matters, technically precise, and demonstrates strong understanding.

9:
Excellent answer. Correct and essentially complete, with strong reasoning and no meaningful technical errors.

8:
Strong correct answer. Solves the problem correctly but may have a minor omission, minor inefficiency, or incomplete explanation.

7:
Good answer. Mostly correct and demonstrates solid understanding, but has a meaningful limitation, missing justification, or non-optimal approach.

6:
Reasonably correct or partially correct. The main idea is present, but an important part is missing or the solution is noticeably incomplete/non-optimal.

5:
Basic partial understanding. Some correct concepts are demonstrated, but important technical details or parts of the solution are missing.

4:
Significant partial understanding. The candidate has some relevant ideas but the solution contains major errors or cannot fully solve the problem.

3:
Mostly incorrect. Some relevant knowledge is present, but the proposed solution has major technical problems.

2:
Very limited understanding. The answer contains little technically useful information.

1:
Almost no meaningful technical understanding.

0:
No meaningful answer or completely irrelevant answer.


IMPORTANT TECHNICAL RULE:

A solution can be CORRECT but NON-OPTIMAL.

For example:

If the expected optimal solution is O(n), but the candidate provides a correct O(n log n) solution:

- Do NOT mark it as wrong.
- Give substantial technical credit.
- Usually score around 7 or 8 depending on the question and explanation.
- Score 9 or 10 only when the solution is both correct and appropriately optimal/complete.

If the candidate gives an incorrect solution that claims to meet the required complexity, penalize the technical score accordingly.


==================================================
CLARITY SCORE — 0 to 10
==================================================

10:
Extremely clear, structured, precise explanation.

9:
Very clear and easy to follow.

8:
Clear explanation with only minor communication issues.

7:
Generally clear and understandable.

6:
Understandable but somewhat incomplete, vague, or poorly structured.

5:
Basic explanation but difficult to follow in places.

4:
Confusing explanation with significant gaps.

3:
Very difficult to understand.

2:
Almost impossible to follow.

1:
Barely understandable.

0:
No explanation.


==================================================
DEPTH SCORE — 0 to 10
==================================================

10:
Comprehensive understanding, including reasoning, edge cases, complexity, and important implementation details where relevant.

9:
Very deep and well-reasoned answer.

8:
Strong depth with good reasoning and relevant details.

7:
Good understanding with useful reasoning but some missing details.

6:
Adequate understanding but limited explanation or missing important details.

5:
Basic understanding with limited reasoning.

4:
Shallow understanding.

3:
Very shallow understanding.

2:
Minimal useful depth.

1:
Almost no depth.

0:
No meaningful content.


==================================================
CONFIDENCE GAP — 0 to 100
==================================================

This measures whether the candidate appears confident despite being technically wrong.

0:
No meaningful confidence/technical mismatch.

1-20:
Very small mismatch.

21-35:
Noticeable mismatch.

36-60:
Substantial mismatch — candidate appears confident while making significant technical errors.

61-100:
Extreme mismatch — candidate confidently presents fundamentally incorrect information.

Do NOT infer confidence merely because the candidate writes confidently.

Only use a high confidenceGap when the answer clearly presents incorrect claims as certain.


==================================================
IMPORTANT EVALUATION RULES
==================================================

1. Evaluate the answer against the actual question.

2. Do not reward confident wording for technical correctness.

3. Do not punish a correct concise answer merely because it is short.

4. Do not invent information that is not present in the candidate's answer.

5. Do not assume the candidate knows something they did not demonstrate.

6. A correct but non-optimal solution deserves substantial credit, but should score below an equally correct optimal solution.

7. A partially correct idea should receive partial credit rather than being treated as completely wrong.

8. A technically incorrect solution must not receive a high technical score simply because the explanation sounds professional.

9. Pay attention to required time and space complexity when the question explicitly specifies them.

10. Check edge cases when they are relevant to correctness.

11. If the candidate provides working code, evaluate both the algorithm and the claimed complexity.

12. If the candidate gives a correct implementation but an incomplete explanation, reduce clarity/depth more than technical correctness.

13. If the candidate gives a wrong implementation but correctly identifies the intended approach, give partial technical credit.

14. Never give a high score simply because keywords from the expected solution appear.

15. Judge the actual reasoning and implementation.


==================================================
FEEDBACK
==================================================

Provide exactly ONE concise sentence.

The feedback must identify the most important strength or weakness.

Examples:

"Correct solution, but the explanation does not justify why the greedy approach is optimal."

"Good approach, but the implementation is O(n log n) instead of the optimal O(n)."

"The solution correctly identifies the two cases required for maximum path sum."

"The proposed iterator operations are O(n), violating the required O(log n) bound."


==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not use Markdown.

Do not include explanations outside JSON.

Use exactly these fields:

{
  "technical": 7,
  "clarity": 6,
  "depth": 5,
  "confidenceGap": 10,
  "feedback": "One concise sentence."
}
`;

  const text = await callGroq(prompt);

  const result = safeParseJSON(text);

  if (!result || typeof result.feedback !== "string") {
    throw new Error("Invalid AI evaluation response");
  }

  const evaluation = {
    technical: score(result.technical, "technical", 10),

    clarity: score(result.clarity, "clarity", 10),

    depth: score(result.depth, "depth", 10),

    confidenceGap: score(result.confidenceGap, "confidenceGap", 100),

    feedback: result.feedback.trim(),
  };

  return evaluation;
};

/*
 * Generate learning roadmap.
 */
const generateRoadmap = async function (role, weakAreas) {
  const prompt =
    "You are a senior technical mentor.\n\n" +
    "Create a practical learning roadmap for a " +
    role +
    " developer based on these weak areas:\n" +
    JSON.stringify(weakAreas) +
    "\n\n" +
    "Return ONLY valid JSON in exactly this format:\n" +
    "{\n" +
    '  "steps": [\n' +
    '    {"title":"Topic","description":"What to learn and practice"}\n' +
    "  ]\n" +
    "}\n\n" +
    "Provide 5 specific steps.";

  const text = await callGroq(prompt);

  const result = safeParseJSON(text);

  if (!result || !Array.isArray(result.steps)) {
    throw new Error("Invalid AI roadmap response");
  }

  return result;
};

module.exports = {
  generateQuestion,
  evaluateAnswer,
  generateRoadmap,
};
