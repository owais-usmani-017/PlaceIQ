import { useState, useEffect, useRef } from "react";
import "./index.css";
import LandingScreen from "./screens/LandingScreen";
import AuthScreen from "./screens/AuthScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import InterviewScreen from "./screens/InterviewScreen";
import ResultsScreen from "./screens/ResultsScreen";
import DashboardScreen from "./screens/DashboardScreen";
import Toast from "./components/Toast";

const VALID_SCREENS = [
  "landing",
  "auth",
  "role",
  "interview",
  "results",
  "dashboard",
];

const PROTECTED_SCREENS = new Set([
  "role",
  "interview",
  "results",
  "dashboard",
]);

function getScreenFromHash() {
  const hash = window.location.hash.replace("#", "");

  return VALID_SCREENS.includes(hash) ? hash : "landing";
}

function getInitialScreen() {
  const screen = getScreenFromHash();
  const hasSession =
    Boolean(localStorage.getItem("placeiq_token")) &&
    Boolean(localStorage.getItem("placeiq_user"));

  if (screen === "landing" && hasSession) {
    return "dashboard";
  }

  if (PROTECTED_SCREENS.has(screen) && !hasSession) {
    return "auth";
  }

  return screen;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState(getInitialScreen);

  const [token, setToken] = useState(localStorage.getItem("placeiq_token"));

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("placeiq_user") || "null"),
  );

  const [selectedRole, setSelectedRole] = useState("");
  const [interviewMode, setInterviewMode] = useState("text");

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const toastTimeoutRef = useRef(null);

  const [interviewResults, setInterviewResults] = useState(null);

  // Navigate to a new screen and create browser history
  const navigate = (screen) => {
    if (!VALID_SCREENS.includes(screen)) {
      return;
    }

    window.history.pushState({ screen }, "", `#${screen}`);
    setCurrentScreen(screen);
  };

  // Handle Chrome/browser Back and Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const screen = getScreenFromHash();
      const hasSession =
        Boolean(localStorage.getItem("placeiq_token")) &&
        Boolean(localStorage.getItem("placeiq_user"));

      setCurrentScreen(
        PROTECTED_SCREENS.has(screen) && !hasSession ? "auth" : screen,
      );
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Save auth data when user logs in
  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setCurrentUser(data.user);

    localStorage.setItem("placeiq_token", data.token);
    localStorage.setItem("placeiq_user", JSON.stringify(data.user));

    showToast("Welcome, " + data.user.name + "! 👋", "success");

    navigate("role");
  };

  // Logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);

    localStorage.removeItem("placeiq_token");
    localStorage.removeItem("placeiq_user");

    navigate("landing");
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(message);
    setToastType(type);

    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage("");
      setToastType("");
      toastTimeoutRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg">
      {currentScreen === "landing" && (
        <LandingScreen
          onGetStarted={() => navigate("auth")}
          onLogin={() => navigate("auth")}
        />
      )}

      {currentScreen === "auth" && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onBackClick={() => navigate("landing")}
          showToast={showToast}
        />
      )}

      {currentScreen === "role" && (
        <RoleSelectionScreen
          currentUser={currentUser}
          onStartInterview={(role, mode) => {
            setSelectedRole(role);
            setInterviewMode(mode);
            navigate("interview");
          }}
          onLogout={handleLogout}
          onDashboard={() => navigate("dashboard")}
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
            navigate("results");
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
          onNewInterview={() => navigate("role")}
          onDashboard={() => navigate("dashboard")}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {currentScreen === "dashboard" && (
        <DashboardScreen
          token={token}
          currentUser={currentUser}
          onNewInterview={() => navigate("role")}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}

export default App;
