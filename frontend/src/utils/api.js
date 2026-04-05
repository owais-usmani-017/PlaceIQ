// API configuration
const API_BASE = "https://placeiq-backend-pivf.onrender.com/api";

export async function apiCall(
  endpoint,
  method = "GET",
  body = null,
  token = null,
) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API error");
  }

  return data;
}

// Voice analysis functions
const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
  "literally",
  "sort of",
  "kind of",
  "i mean",
  "right",
  "okay",
  "so",
];

export function analyzeVoiceConfidence(transcript, durationSeconds) {
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      overall: 0,
      fluency: 0,
      pace: "Slow",
      vocabRichness: 0,
      completeness: 0,
      fillerPct: 0,
      fillerCount: 0,
      wpm: 0,
    };
  }

  // Count filler words
  const lowerTranscript = transcript.toLowerCase();
  let fillerCount = 0;
  FILLER_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerTranscript.match(regex);
    if (matches) fillerCount += matches.length;
  });

  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")),
  );
  const vocabRichness = Math.min(
    100,
    Math.round((uniqueWords.size / wordCount) * 100 * 1.2),
  );

  // Calculate WPM and pace
  const wpm =
    durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
  let pace = "Normal",
    paceScore = 85;
  if (wpm < 80) {
    pace = "Too Slow";
    paceScore = 40;
  } else if (wpm < 120) {
    pace = "Good";
    paceScore = 85;
  } else if (wpm < 160) {
    pace = "Ideal";
    paceScore = 100;
  } else if (wpm < 200) {
    pace = "Fast";
    paceScore = 75;
  } else {
    pace = "Too Fast";
    paceScore = 45;
  }

  const completeness = Math.min(100, Math.round((wordCount / 80) * 100));
  const fillerPct = Math.min(100, Math.round((fillerCount / wordCount) * 100));
  const fluency = Math.max(
    0,
    Math.round(100 - fillerPct * 2.5 + vocabRichness * 0.2),
  );

  const overall = Math.round(
    paceScore * 0.25 +
      Math.max(0, 100 - fillerPct * 3) * 0.3 +
      vocabRichness * 0.25 +
      completeness * 0.2,
  );

  return {
    overall: Math.min(100, overall),
    fluency: Math.min(100, fluency),
    pace,
    paceScore,
    vocabRichness,
    completeness,
    fillerPct,
    fillerCount,
    wpm,
  };
}
