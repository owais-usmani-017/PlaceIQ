import { useState } from "react";
import { apiCall } from "../utils/api";

export default function AuthScreen({ onAuthSuccess, onBackClick, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall("/auth/login", "POST", {
        email: formData.email,
        password: formData.password,
      });
      onAuthSuccess(data);
    } catch (error) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast("Please fill in all fields", "error");
      return;
    }
    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall("/auth/register", "POST", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      onAuthSuccess(data);
    } catch (error) {
      showToast(error.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 border-b border-dark-border bg-dark-bg/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBackClick}
          className="text-2xl font-heading font-bold"
        >
          <span className="text-accent-cyan">Place</span>
          <span className="text-text-light">IQ</span>
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md card animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-text-muted mb-8">
            {isLogin ? "Log in to continue." : "Start your journey for free."}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-dark-bg rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                isLogin ? "bg-accent-cyan text-dark-bg" : "text-text-muted"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                !isLogin ? "bg-accent-cyan text-dark-bg" : "text-text-muted"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          <form
            onSubmit={isLogin ? handleLogin : handleSignup}
            className="space-y-4"
          >
            {!isLogin && (
              <div>
                <label className="block text-text-muted text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-text-muted text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-text-muted text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isLogin ? "••••••••" : "Min 6 characters"}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? "..." : isLogin ? "Log In →" : "Create Account →"}
            </button>
          </form>

          <p className="text-text-muted text-sm mt-6 text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-cyan hover:underline font-semibold"
            >
              {isLogin ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>
      </main>
    </>
  );
}
