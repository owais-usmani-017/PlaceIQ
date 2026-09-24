import { useState } from "react";
import Navigation from "../components/Navigation";

const ROLES = [
  {
    id: "Frontend",
    icon: "🎨",
    title: "Frontend Developer",
    desc: "React, CSS, JS, browser APIs",
  },
  {
    id: "Backend",
    icon: "⚙️",
    title: "Backend Developer",
    desc: "APIs, databases, system design",
  },
  {
    id: "Machine Learning",
    icon: "🧠",
    title: "ML Engineer",
    desc: "Models, training, feature engineering",
  },
  {
    id: "DSA",
    icon: "🔢",
    title: "DSA / Problem Solving",
    desc: "Algorithms, data structures, complexity",
  },
];

export default function RoleSelectionScreen({
  currentUser,
  onStartInterview,
  onLogout,
  onDashboard,
  showToast,
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedMode, setSelectedMode] = useState("text");

  const handleStart = () => {
    if (!selectedRole) {
      showToast("Please select a role", "error");
      return;
    }
    onStartInterview(selectedRole, selectedMode);
  };

  return (
    <>
      <Navigation
        user={currentUser}
        onDashboard={onDashboard}
        onLogout={onLogout}
      />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-3">
              Set up your interview
            </h2>
            <p className="text-text-muted text-lg">
              Choose your role and how you want to answer.
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-12">
            <h3 className="text-text-muted font-heading font-bold text-sm uppercase tracking-wide mb-4">
              Answer Mode
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "text", icon: "⌨️", label: "Type Answers" },
                { id: "voice", icon: "🎙️", label: "Speak Answers" },
              ].map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`card p-6 text-center transition-all ${
                    selectedMode === mode.id
                      ? "border-accent-cyan bg-dark-surface"
                      : "hover:border-dark-border"
                  }`}
                >
                  <div className="text-4xl mb-3">{mode.icon}</div>
                  <div className="font-heading font-bold">{mode.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <h3 className="text-text-muted font-heading font-bold text-sm uppercase tracking-wide mb-4">
              Target Role
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {ROLES.map((role) => (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`card p-6 text-center transition-all cursor-pointer ${
                    selectedRole === role.id
                      ? "border-accent-cyan bg-dark-surface ring-2 ring-accent-cyan/30"
                      : "hover:border-accent-cyan hover:scale-105"
                  }`}
                >
                  <div className="text-4xl mb-3">{role.icon}</div>
                  <h4 className="font-heading font-bold text-sm mb-2">
                    {role.title}
                  </h4>
                  <p className="text-xs text-text-muted">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleStart}
              disabled={!selectedRole}
              className="btn-primary text-lg px-10 py-4"
            >
              Start Interview →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
