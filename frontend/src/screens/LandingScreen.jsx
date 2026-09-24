import Navigation from "../components/Navigation";

export default function LandingScreen({ onGetStarted, onLogin }) {
  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 border-b border-dark-border bg-dark-bg/90 backdrop-blur-md">
        <div className="text-2xl font-heading font-bold">
          <span className="text-accent-cyan">Place</span>
          <span className="text-text-light">IQ</span>
        </div>

        <div className="flex gap-3">
          <button onClick={onLogin} className="btn-ghost">
            Log In
          </button>

          <button onClick={onGetStarted} className="btn-primary">
            Get Started →
          </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center animate-fade-in">
          {/* Badge */}
          <div className="badge mb-8 justify-center">
            <span className="inline-block w-2 h-2 bg-accent-cyan rounded-full animate-pulse-dot"></span>
            AI-Powered Interview Intelligence
          </div>

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
            Know if you'll pass <br />
            <span className="text-accent-cyan">before</span> you{" "}
            <span className="text-accent-purple">fail.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-text-muted mb-12 max-w-xl mx-auto">
            PlaceIQ simulates real placement interviews, evaluates your answers
            with AI, and measures your vocal confidence — the hidden metric
            interviewers always notice.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: "🎙️",
                title: "Voice Answers",
                desc: "Speak your answers like a real interview.",
              },
              {
                icon: "📈",
                title: "Confidence Score",
                desc: "Measures your vocal pace, fluency and certainty.",
              },
              {
                icon: "📊",
                title: "Risk Report",
                desc: "Full placement readiness breakdown.",
              },
              {
                icon: "⚡",
                title: "Confidence Gap™",
                desc: "Finds when confident tone hides weak answers.",
              },
            ].map((feature, i) => (
              <div key={i} className="card">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-heading font-bold mb-1">{feature.title}</h4>
                <p className="text-sm text-text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onGetStarted}
            className="btn-primary text-lg px-10 py-4"
          >
            Start Free Interview →
          </button>
        </div>
      </main>
    </>
  );
}
