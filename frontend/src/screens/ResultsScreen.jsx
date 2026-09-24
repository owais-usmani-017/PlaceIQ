import Navigation from "../components/Navigation";

export default function ResultsScreen({
  currentUser,
  interviewResults,
  selectedRole,
  interviewMode,
  onNewInterview,
  onDashboard,
  onLogout,
}) {
  const results = interviewResults || {
    finalScore: 0,
    technicalScore: 0,
    clarityScore: 0,
    depthScore: 0,
    confidenceGap: 0,
    riskLevel: "Medium",
    roadmap: [],
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "Low":
        return "text-status-success";
      case "Medium":
        return "text-status-warn";
      case "High":
        return "text-status-danger";
      default:
        return "text-text-light";
    }
  };

  const getRiskBg = (level) => {
    switch (level) {
      case "Low":
        return "bg-status-success/10 border-status-success/30";
      case "Medium":
        return "bg-status-warn/10 border-status-warn/30";
      case "High":
        return "bg-status-danger/10 border-status-danger/30";
      default:
        return "bg-dark-card";
    }
  };

  return (
    <>
      <Navigation
        user={currentUser}
        onDashboard={onDashboard}
        onLogout={onLogout}
        showDashboardBtn={true}
      />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-heading font-bold mb-2">
              Your Interview Results
            </h1>
            <p className="text-text-muted">
              {selectedRole} Interview •{" "}
              {interviewMode === "voice" ? "🎙️ Voice" : "⌨️ Text"} Mode
            </p>
          </div>

          {/* Main Score Card */}
          <div
            className={`card text-center mb-8 p-12 border-2 ${getRiskBg(results.riskLevel)}`}
          >
            <div className="text-6xl font-heading font-bold mb-4">
              <span className={getRiskColor(results.riskLevel)}>
                {results.finalScore}
              </span>
              <span className="text-2xl text-text-muted">/100</span>
            </div>

            <div className="inline-block badge mb-6">
              {results.riskLevel === "Low" && "✅"}
              {results.riskLevel === "Medium" && "⚠️"}
              {results.riskLevel === "High" && "🚨"}
              {" " + results.riskLevel.toUpperCase() + " RISK"}
            </div>

            {results.confidenceGap > 25 && (
              <div className="mt-6 p-4 bg-status-warn/10 border border-status-warn/30 rounded-lg text-left">
                <div className="text-status-warn font-semibold mb-2">
                  ⚠️ Confidence Gap Alert
                </div>
                <p className="text-sm text-text-muted">
                  You answered with confidence but accuracy lagged by{" "}
                  {results.confidenceGap} points. This is the #1 reason
                  candidates fail technical rounds despite feeling prepared.
                </p>
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                label: "Technical Accuracy",
                value: results.technicalScore,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Clarity",
                value: results.clarityScore,
                color: "from-purple-500 to-pink-500",
              },
              {
                label: "Depth",
                value: results.depthScore,
                color: "from-green-500 to-emerald-500",
              },
            ].map((item, i) => (
              <div key={i} className="card">
                <div className="text-sm text-text-muted font-semibold mb-3">
                  {item.label}
                </div>
                <div className="relative w-full h-2 bg-dark-bg rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full bg-linear-to-r ${item.color} transition-all duration-1000`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <div className="text-3xl font-heading font-bold">
                  {item.value}%
                </div>
              </div>
            ))}
          </div>

          {/* Roadmap */}
          {results.roadmap && results.roadmap.length > 0 && (
            <div className="card mb-8">
              <h3 className="font-heading font-bold text-xl mb-6">
                📝 Improvement Roadmap
              </h3>
              <div className="space-y-4">
                {results.roadmap.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-accent-cyan text-dark-bg font-heading font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 py-2">
                      <p className="text-text-light">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={onNewInterview} className="btn-primary">
              🔄 Retake Interview
            </button>
            <button onClick={onDashboard} className="btn-secondary">
              📊 View Dashboard
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
