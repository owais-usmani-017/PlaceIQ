const calculateScores = function (answers) {
  var total = answers.length;
  if (total === 0) {
    return {
      finalScore: 0,
      technical: 0,
      clarity: 0,
      depth: 0,
      confidenceGap: 0,
      riskLevel: "High",
    };
  }

  var techSum = 0;
  var claritySum = 0;
  var depthSum = 0;
  var gapSum = 0;

  for (var i = 0; i < answers.length; i++) {
    techSum += answers[i].technical || 0;
    claritySum += answers[i].clarity || 0;
    depthSum += answers[i].depth || 0;
    gapSum += answers[i].confidenceGap || 0;
  }

  var technical = Math.round((techSum / total) * 10);
  var clarity = Math.round((claritySum / total) * 10);
  var depth = Math.round((depthSum / total) * 10);
  var confidenceGap = Math.round(gapSum / total);

  var finalScore = Math.round(technical * 0.5 + clarity * 0.25 + depth * 0.25);

  var riskLevel;
  if (confidenceGap > 35 || finalScore < 60) {
    riskLevel = "High";
  } else if (finalScore >= 80 && confidenceGap <= 20) {
    riskLevel = "Low";
  } else {
    riskLevel = "Medium";
  }

  return { finalScore, technical, clarity, depth, confidenceGap, riskLevel };
};

module.exports = { calculateScores };
