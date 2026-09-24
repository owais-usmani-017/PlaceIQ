import { useState, useEffect, useRef, useCallback } from "react";
import Navigation from "../components/Navigation";
import { apiCall, analyzeVoiceConfidence } from "../utils/api";

export default function InterviewScreen({
  token,
  currentUser,
  selectedRole,
  interviewMode,
  onFinish,
  onLogout,
  showToast,
}) {
  const [questionNumber, setQuestionNumber] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceMetrics, setVoiceMetrics] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const recognitionRef = useRef(null);
  const recordingStartRef = useRef(null);
  const waveformRef = useRef(null);
  const initialQuestionLoadedRef = useRef(false);

  // Load first question
  const loadNextQuestion = useCallback(async () => {
    setQuestionNumber((prev) => prev + 1);
    setTextAnswer("");
    setVoiceTranscript("");
    setVoiceMetrics(null);
    setShowEvaluation(false);

    setLoading(true);
    try {
      const data = await apiCall(
        "/interview/question",
        "POST",
        { role: selectedRole },
        token,
      );
      setCurrentQuestion(data.question);
    } catch {
      showToast("Failed to load question", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedRole, token, showToast]);

  useEffect(() => {
    if (!initialQuestionLoadedRef.current) {
      initialQuestionLoadedRef.current = true;
      loadNextQuestion();
    }

    return () => recognitionRef.current?.stop();
  }, [loadNextQuestion]);

  useEffect(() => {
    if (!waveformRef.current) return undefined;

    let animationFrame;
    const bars = waveformRef.current.querySelectorAll(".waveform-bar");
    const animate = () => {
      bars.forEach((bar) => {
        bar.style.height = `${Math.random() * 40 + 4}px`;
      });
      animationFrame = requestAnimationFrame(animate);
    };

    if (isRecording) animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [isRecording]);

  // Setup voice recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const submitTextAnswer = async () => {
    if (!textAnswer.trim()) {
      showToast("Please write an answer", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall(
        "/interview/evaluate",
        "POST",
        {
          question: currentQuestion,
          answer: textAnswer,
          role: selectedRole,
        },
        token,
      );

      setCurrentEvaluation(data);
      setAnswers((prev) => [
        ...prev,
        {
          ...data,
          question: currentQuestion,
          answer: textAnswer,
        },
      ]);
      setShowEvaluation(true);
    } catch {
      showToast("Evaluation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!SpeechRecognition) {
      showToast("Speech recognition not supported in your browser", "error");
      return;
    }

    setIsRecording(true);
    recordingStartRef.current = Date.now();
    setVoiceTranscript("");

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        }
      }
      setVoiceTranscript((prev) => prev + final);
    };

    recognitionRef.current.onerror = (e) => {
      if (e.error !== "no-speech") {
        showToast(`Mic error: ${e.error}`, "error");
      }
      stopRecording();
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const submitVoiceAnswer = async () => {
    if (!voiceTranscript.trim()) {
      showToast("No answer recorded", "error");
      return;
    }

    stopRecording();
    const duration = (Date.now() - recordingStartRef.current) / 1000;
    const metrics = analyzeVoiceConfidence(voiceTranscript, duration);
    setVoiceMetrics(metrics);

    setLoading(true);
    try {
      const data = await apiCall(
        "/interview/evaluate",
        "POST",
        {
          question: currentQuestion,
          answer: voiceTranscript,
          role: selectedRole,
        },
        token,
      );

      setCurrentEvaluation(data);
      setAnswers((prev) => [
        ...prev,
        {
          ...data,
          question: currentQuestion,
          answer: voiceTranscript,
          voiceConfidence: metrics.overall,
        },
      ]);
      setShowEvaluation(true);
    } catch {
      showToast("Evaluation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = () => {
    const nextAnswers = [
      ...answers,
      {
        question: currentQuestion,
        answer: "",
        technical: 0,
        clarity: 0,
        depth: 0,
        confidenceGap: 0,
        feedback: "Skipped.",
      },
    ];

    setAnswers(nextAnswers);
    advanceToNextQuestion(nextAnswers);
  };

  const advanceToNextQuestion = (nextAnswers = answers) => {
    if (nextAnswers.length >= 5) {
      finishInterview(nextAnswers);
    } else {
      setShowEvaluation(false);
      loadNextQuestion();
    }
  };

  const finishInterview = async (answersToSubmit = answers) => {
    setLoading(true);
    try {
      const data = await apiCall(
        "/interview/finish",
        "POST",
        {
          role: selectedRole,
          answers: answersToSubmit,
        },
        token,
      );
      onFinish(data.interview);
    } catch (error) {
      showToast(error.message || "Failed to save interview", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation
        user={currentUser}
        onLogout={onLogout}
        showDashboardBtn={false}
      />

      <main className="flex-1 flex flex-col px-6 py-8">
        {/* Progress bar */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < questionNumber
                  ? "bg-accent-cyan"
                  : i === questionNumber
                    ? "bg-accent-cyan ring-2 ring-accent-cyan/50"
                    : "bg-dark-border"
              }`}
            />
          ))}
        </div>

        {/* Interview content */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="max-w-2xl w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="badge mb-2">Question {questionNumber}/5</div>
                <div className="badge">
                  {interviewMode === "voice" ? "🎙️ Voice" : "⌨️ Text"}
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="card mb-8 min-h-32 flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-text-muted">
                    Generating question...
                  </span>
                </div>
              ) : (
                <p className="text-xl text-text-light">{currentQuestion}</p>
              )}
            </div>

            {/* Text Mode */}
            {interviewMode === "text" && (
              <div className="space-y-4">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here... [Minimum 50 words recommended]"
                  className="w-full h-32 input-field"
                />
                <div className="flex gap-3">
                  <button
                    onClick={submitTextAnswer}
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    Submit Answer →
                  </button>
                  <button
                    onClick={skipQuestion}
                    className="btn-secondary flex-1"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Voice Mode */}
            {interviewMode === "voice" && (
              <div className="space-y-4">
                {/* Waveform */}
                <div
                  ref={waveformRef}
                  className="flex items-center justify-center gap-1 h-16 bg-dark-card border border-dark-border rounded-lg p-4"
                >
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar flex-1 transform origin-bottom"
                    />
                  ))}
                </div>

                {/* Transcript */}
                <div className="card min-h-20 p-4 text-text-muted">
                  {voiceTranscript || "Press microphone to start speaking..."}
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 btn-primary ${isRecording ? "bg-status-danger" : ""}`}
                  >
                    {isRecording ? "⏹️ Stop" : "🎤 Start Recording"}
                  </button>
                  <button
                    onClick={submitVoiceAnswer}
                    disabled={!voiceTranscript || isRecording || loading}
                    className="btn-secondary flex-1"
                  >
                    Submit Answer →
                  </button>
                  <button onClick={skipQuestion} className="btn-secondary">
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Modal */}
        {showEvaluation && currentEvaluation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="card max-w-md w-full mx-4 animate-slide-in">
              <h3 className="text-2xl font-heading font-bold mb-6">
                Evaluation
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Technical", value: currentEvaluation.technical },
                  { label: "Clarity", value: currentEvaluation.clarity },
                  { label: "Depth", value: currentEvaluation.depth },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-heading font-bold text-accent-cyan">
                      {item.value}/10
                    </div>
                    <div className="text-sm text-text-muted">{item.label}</div>
                  </div>
                ))}
              </div>

              {voiceMetrics && (
                <div className="mb-6 p-3 bg-dark-bg rounded-lg">
                  <div className="text-sm font-semibold text-text-muted mb-2">
                    Voice Confidence
                  </div>
                  <div className="text-2xl font-bold text-accent-cyan">
                    {voiceMetrics.overall}%
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-dark-bg rounded-lg">
                <h4 className="font-semibold mb-2">Feedback</h4>
                <p className="text-text-muted text-sm">
                  {currentEvaluation.feedback}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  questionNumber >= 5
                    ? finishInterview()
                    : advanceToNextQuestion()
                }
                className="btn-primary w-full"
              >
                {questionNumber >= 5 ? "View Results →" : "Next Question →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
