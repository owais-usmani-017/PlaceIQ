import { useState, useEffect } from "react";
import "./index.css";
import LandingScreen from "./screens/LandingScreen";
import AuthScreen from "./screens/AuthScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import InterviewScreen from "./screens/InterviewScreen";
import ResultsScreen from "./screens/ResultsScreen";
import DashboardScreen from "./screens/DashboardScreen";
import Toast from "./components/Toast";

function App() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [token, setToken] = useState(localStorage.getItem("placeiq_token"));
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("placeiq_user") || "null"),
  );
  const [selectedRole, setSelectedRole] = useState("");
  const [interviewMode, setInterviewMode] = useState("text");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [interviewResults, setInterviewResults] = useState(null);

  // Save auth data when user logs in
  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem("placeiq_token", data.token);
    localStorage.setItem("placeiq_user", JSON.stringify(data.user));
    showToast("Welcome, " + data.user.name + "! 👋", "success");
    setCurrentScreen("role");
  };

  // Logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("placeiq_token");
    localStorage.removeItem("placeiq_user");
    setCurrentScreen("landing");
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  // Auto-show dashboard if logged in
  useEffect(() => {
    if (token && currentUser && currentScreen === "landing") {
      setCurrentScreen("dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg">
      {currentScreen === "landing" && (
        <LandingScreen onGetStarted={() => setCurrentScreen("auth")} />
      )}

      {currentScreen === "auth" && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onBackClick={() => setCurrentScreen("landing")}
          showToast={showToast}
        />
      )}

      {currentScreen === "role" && (
        <RoleSelectionScreen
          currentUser={currentUser}
          onStartInterview={(role, mode) => {
            setSelectedRole(role);
            setInterviewMode(mode);
            setCurrentScreen("interview");
          }}
          onLogout={handleLogout}
          onDashboard={() => setCurrentScreen("dashboard")}
          showToast={showToast}
        />
      )}

      {currentScreen === "interview" && (
        <InterviewScreen
          token={token}
          currentUser={currentUser}
          selectedRole={selectedRole}
          interviewMode={interviewMode}
          onFinish={(results) => {
            setInterviewResults(results);
            setCurrentScreen("results");
          }}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {currentScreen === "results" && (
        <ResultsScreen
          token={token}
          currentUser={currentUser}
          interviewResults={interviewResults}
          selectedRole={selectedRole}
          interviewMode={interviewMode}
          onNewInterview={() => setCurrentScreen("role")}
          onDashboard={() => setCurrentScreen("dashboard")}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {currentScreen === "dashboard" && (
        <DashboardScreen
          token={token}
          currentUser={currentUser}
          onNewInterview={() => setCurrentScreen("role")}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}

export default App;
