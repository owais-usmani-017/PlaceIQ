import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { apiCall } from "../utils/api";

export default function DashboardScreen({
  token,
  currentUser,
  onNewInterview,
  onLogout,
  showToast,
}) {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    bestScore: 0,
  });
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const data = await apiCall("/interview/dashboard", "GET", null, token);
        if (!cancelled) {
          setStats(data.stats);
          setInterviews(data.interviews || []);
        }
      } catch {
        if (!cancelled) showToast("Failed to load dashboard", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
    // The token controls when dashboard data changes. The toast callback is only
    // used for failures and must not restart this request on every App render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getRiskColor = (level) => {
    switch (level) {
      case "Low":
        return { text: "text-status-success", bg: "bg-status-success/10" };
      case "Medium":
        return { text: "text-status-warn", bg: "bg-status-warn/10" };
      case "High":
        return { text: "text-status-danger", bg: "bg-status-danger/10" };
      default:
        return { text: "text-text-light", bg: "bg-dark-card" };
    }
  };

  return (
    <>
      <Navigation
        user={currentUser}
        onLogout={onLogout}
        showDashboardBtn={false}
      />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-heading font-bold mb-2">
                Dashboard
              </h1>
              <p className="text-text-muted">
                Track your interview performance
              </p>
            </div>
            <button onClick={onNewInterview} className="btn-primary">
              + New Interview
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                label: "Total Interviews",
                value: stats.totalInterviews,
                icon: "🎯",
              },
              {
                label: "Average Score",
                value: stats.avgScore || "—",
                icon: "📊",
              },
              {
                label: "Best Score",
                value: stats.bestScore || "—",
                icon: "🏆",
              },
            ].map((stat, i) => (
              <div key={i} className="card">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-text-muted text-sm font-semibold mb-2">
                  {stat.label}
                </div>
                <div className="text-4xl font-heading font-bold text-accent-cyan">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Interviews */}
          <div className="card">
            <h2 className="text-2xl font-heading font-bold mb-6">
              Recent Interviews
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  No interviews yet
                </h3>
                <p className="text-text-muted mb-6">
                  Take your first AI interview to see results here.
                </p>
                <button onClick={onNewInterview} className="btn-primary">
                  Start Interview
                </button>
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {interviews.map((interview, idx) => {
                  const riskColor = getRiskColor(interview.riskLevel);
                  const date = new Date(
                    interview.completedAt,
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-4 hover:bg-dark-bg/50 px-3 rounded transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-text-light">
                          {interview.role} Interview
                        </div>
                        <div className="text-sm text-text-muted">
                          {date} • {interview.answers?.length || 5} questions
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-heading font-bold text-accent-cyan">
                          {interview.finalScore}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg font-semibold text-sm ${riskColor.bg} ${riskColor.text}`}
                        >
                          {interview.riskLevel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
