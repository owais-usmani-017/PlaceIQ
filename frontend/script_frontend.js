const API = "https://place-iq-know-before-you-get-placed.onrender.com/api";
let token = localStorage.getItem("placeiq_token");
let currentUser = JSON.parse(localStorage.getItem("placeiq_user") || "null");
let selectedRole = "";
let interviewMode = "text";
let currentQuestion = "";
let questionNumber = 0;
let allAnswers = [];
let radarChartInstance = null;

let recognition = null;
let isRecording = false;
let spokenTranscript = "";
let voiceMetricsPerQ = [];
let recordingStartTime = 0;
let interimWordCount = 0;
let fillerCount = 0;
let waveAnimId = null;
let audioCtx = null;
let analyser = null;
let micStream = null;

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

window.onload = () => {
  if (token && currentUser) {
    updateNavUser();
    showScreen("screen-dashboard");
    loadDashboard();
  }
  buildWaveform();
};

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function updateNavUser() {
  if (!currentUser) return;
  ["nav-user-name", "dash-user-name"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = currentUser.name;
  });
}

function showAuth(tab) {
  showScreen("screen-auth");
  switchAuthTab(tab);
}

function switchAuthTab(tab) {
  document.getElementById("form-login").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("form-signup").style.display =
    tab === "signup" ? "block" : "none";
  document
    .getElementById("tab-login")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("tab-signup")
    .classList.toggle("active", tab === "signup");
  document.getElementById("auth-title").textContent =
    tab === "login" ? "Welcome back" : "Create account";
  document.getElementById("auth-subtitle").textContent =
    tab === "login" ? "Log in to continue." : "Start your journey for free.";
  document.getElementById("auth-footer-text").innerHTML =
    tab === "login"
      ? "Don't have an account? <a onclick=\"switchAuthTab('signup')\">Sign up free</a>"
      : "Already have an account? <a onclick=\"switchAuthTab('login')\">Log in</a>";
  document.getElementById("auth-error").style.display = "none";
}

async function handleLogin() {
  const email = document.getElementById("login-email").value.trim(),
    password = document.getElementById("login-password").value;
  if (!email || !password) return showAuthError("Please fill in all fields.");
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return showAuthError(data.message || "Login failed");
    saveAuth(data);
  } catch (e) {
    showAuthError("Could not connect to server.");
  }
}

async function handleSignup() {
  const name = document.getElementById("signup-name").value.trim(),
    email = document.getElementById("signup-email").value.trim(),
    password = document.getElementById("signup-password").value;
  if (!name || !email || !password)
    return showAuthError("Please fill in all fields.");
  if (password.length < 6)
    return showAuthError("Password must be at least 6 characters.");
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return showAuthError(data.message || "Signup failed");
    saveAuth(data);
  } catch (e) {
    showAuthError("Could not connect to server.");
  }
}

function saveAuth(data) {
  token = data.token;
  currentUser = data.user;
  localStorage.setItem("placeiq_token", token);
  localStorage.setItem("placeiq_user", JSON.stringify(currentUser));
  updateNavUser();
  showScreen("screen-role");
  showToast("Welcome, " + currentUser.name + "! 👋", "success");
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.style.display = "block";
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("placeiq_token");
  localStorage.removeItem("placeiq_user");
  showScreen("screen-landing");
}

function selectMode(mode) {
  interviewMode = mode;
  document
    .getElementById("mode-text")
    .classList.toggle("selected", mode === "text");
  document
    .getElementById("mode-voice")
    .classList.toggle("selected", mode === "voice");
}

function selectRole(el, role) {
  document
    .querySelectorAll(".role-card")
    .forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
  selectedRole = role;
  document.getElementById("start-btn").disabled = false;
}

function buildWaveform() {
  const wrap = document.getElementById("waveform-wrap");
  if (!wrap) return;
  wrap.innerHTML = "";
  for (let i = 0; i < 32; i++) {
    const bar = document.createElement("div");
    bar.className = "waveform-bar";
    bar.style.height = "8px";
    wrap.appendChild(bar);
  }
}

function animateWaveform(active) {
  const wrap = document.getElementById("waveform-wrap");
  const bars = wrap?.querySelectorAll(".waveform-bar");
  if (!bars) return;
  if (!active) {
    wrap.className = "waveform-wrap waveform-idle";
    bars.forEach((b) => {
      b.style.height = "8px";
    });
    if (waveAnimId) {
      cancelAnimationFrame(waveAnimId);
      waveAnimId = null;
    }
    return;
  }
  wrap.className = "waveform-wrap waveform-active";
  const animate = () => {
    bars.forEach((b) => {
      const h = Math.random() * 44 + 4;
      b.style.height = h + "px";
    });
    waveAnimId = requestAnimationFrame(() => setTimeout(animate, 80));
  };
  animate();
}

function analyzeVoiceConfidence(transcript, durationSeconds) {
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;
  if (wordCount === 0)
    return {
      overall: 0,
      fluency: 0,
      pace: "Slow",
      vocabRichness: 0,
      completeness: 0,
      fillerPct: 0,
      fillerCount: 0,
    };

  const lowerTranscript = transcript.toLowerCase();
  let fc = 0;
  FILLER_WORDS.forEach((f) => {
    const regex = new RegExp("\\b" + f + "\\b", "gi");
    const matches = lowerTranscript.match(regex);
    if (matches) fc += matches.length;
  });

  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")),
  );
  const vocabRichness = Math.min(
    100,
    Math.round((uniqueWords.size / wordCount) * 100 * 1.2),
  );

  const wpm =
    durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
  let pace = "Normal";
  let paceScore = 85;
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
  const fillerPct = Math.min(100, Math.round((fc / wordCount) * 100));
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
    fillerCount: fc,
    wpm,
  };
}

function startInterview() {
  if (!selectedRole) return;
  allAnswers = [];
  voiceMetricsPerQ = [];
  spokenTranscript = "";
  questionNumber = 0;
  document.getElementById("interview-role-label").textContent =
    selectedRole + " Interview";
  document.getElementById("interview-mode-badge").textContent =
    interviewMode === "voice" ? "🎙️ Voice" : "⌨️ Text";
  document.getElementById("text-mode-ui").style.display =
    interviewMode === "text" ? "block" : "none";
  const vui = document.getElementById("voice-mode-ui");
  interviewMode === "voice"
    ? vui.classList.add("active")
    : vui.classList.remove("active");
  showScreen("screen-interview");
  loadNextQuestion();
}

async function loadNextQuestion() {
  questionNumber++;
  updateProgressDots();
  document.getElementById("q-num").textContent = questionNumber;
  if (interviewMode === "text") {
    document.getElementById("answer-input").value = "";
    document.getElementById("submit-btn").disabled = false;
  }
  spokenTranscript = "";
  fillerCount = 0;
  if (interviewMode === "voice") {
    resetVoiceUI();
  }
  const box = document.getElementById("question-box");
  box.className = "question-box loading";
  box.innerHTML =
    '<div class="spinner"></div><span>Generating question...</span>';
  try {
    const res = await fetch(`${API}/interview/question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ role: selectedRole }),
    });
    const data = await res.json();
    currentQuestion = data.question;
    box.className = "question-box";
    box.textContent = currentQuestion;
  } catch (e) {
    box.className = "question-box";
    box.textContent = "Could not load question. Check your connection.";
  }
}

function updateProgressDots() {
  document.querySelectorAll(".progress-dot").forEach((dot, i) => {
    dot.classList.remove("done", "active");
    if (i < questionNumber - 1) dot.classList.add("done");
    else if (i === questionNumber - 1) dot.classList.add("active");
  });
}

function resetVoiceUI() {
  document.getElementById("transcript-text").innerHTML =
    '<span class="transcript-placeholder">Press 🎤 and speak your answer clearly...</span>';
  document.getElementById("voice-submit-btn").disabled = true;
  document.getElementById("mic-btn").disabled = false;
  document.getElementById("mic-btn").classList.remove("recording");
  document.getElementById("mic-btn").textContent = "🎤";
  document.getElementById("mic-status").className = "mic-status";
  document.getElementById("mic-status").textContent = "Press to start speaking";
  document.getElementById("conf-live-val").textContent = "0%";
  document.getElementById("conf-live-fill").style.width = "0%";
  animateWaveform(false);
}

function toggleMic() {
  isRecording ? stopRecording() : startRecording();
}

function clearRecording() {
  stopRecording();
  setTimeout(() => {
    spokenTranscript = "";
    resetVoiceUI();
  }, 100);
}

function startRecording() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR)
    return showToast("Speech recognition needs Chrome browser.", "error");
  spokenTranscript = "";
  fillerCount = 0;
  recordingStartTime = Date.now();
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isRecording = true;
    document.getElementById("mic-btn").classList.add("recording");
    document.getElementById("mic-btn").textContent = "⏹️";
    document.getElementById("mic-status").className = "mic-status listening";
    document.getElementById("mic-status").textContent =
      "Listening... speak now";
    animateWaveform(true);
  };

  recognition.onresult = (event) => {
    let interim = "",
      final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal)
        final += event.results[i][0].transcript + " ";
      else interim += event.results[i][0].transcript;
    }
    spokenTranscript += final;
    const display =
      spokenTranscript +
      (interim ? '<em style="color:var(--muted)">' + interim + "</em>" : "");
    document.getElementById("transcript-text").innerHTML =
      display || '<span class="transcript-placeholder">Listening...</span>';

    const elapsed = (Date.now() - recordingStartTime) / 1000;
    const liveMetrics = analyzeVoiceConfidence(
      spokenTranscript + (interim || ""),
      elapsed,
    );
    const conf = liveMetrics.overall;
    document.getElementById("conf-live-val").textContent = conf + "%";
    const fill = document.getElementById("conf-live-fill");
    fill.style.width = conf + "%";
    fill.style.background =
      conf >= 70
        ? "var(--success)"
        : conf >= 45
          ? "var(--warn)"
          : "var(--danger)";

    if (spokenTranscript.trim().length > 0)
      document.getElementById("voice-submit-btn").disabled = false;
  };

  recognition.onerror = (e) => {
    stopRecording();
    if (e.error !== "no-speech") showToast("Mic error: " + e.error, "error");
  };
  recognition.onend = () => {
    if (isRecording) stopRecording();
  };
  recognition.start();
}

function stopRecording() {
  isRecording = false;
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  animateWaveform(false);
  document.getElementById("mic-btn").classList.remove("recording");
  document.getElementById("mic-btn").textContent = "🎤";
  if (spokenTranscript.trim()) {
    document.getElementById("mic-status").className = "mic-status done";
    document.getElementById("mic-status").textContent =
      "✓ Answer recorded — submit or re-record";
    document.getElementById("voice-submit-btn").disabled = false;
  } else {
    document.getElementById("mic-status").className = "mic-status";
    document.getElementById("mic-status").textContent =
      "Nothing heard. Try again.";
  }
}

async function submitAnswer() {
  const answer = document.getElementById("answer-input").value.trim();
  if (!answer) return showToast("Please write an answer first.", "error");
  document.getElementById("submit-btn").disabled = true;
  await evaluateAndStore(answer, null);
  document.getElementById("submit-btn").textContent = "Submit Answer →";
}

async function submitVoiceAnswer() {
  const answer = spokenTranscript.trim();
  if (!answer)
    return showToast("No answer recorded. Press the mic and speak.", "error");
  if (isRecording) stopRecording();
  document.getElementById("voice-submit-btn").disabled = true;
  document.getElementById("mic-btn").disabled = true;
  document.getElementById("mic-status").textContent = "Evaluating...";

  const durationSeconds = (Date.now() - recordingStartTime) / 1000;
  const voiceMetrics = analyzeVoiceConfidence(answer, durationSeconds);
  voiceMetricsPerQ.push(voiceMetrics);

  await evaluateAndStore(answer, voiceMetrics);
  document.getElementById("mic-btn").disabled = false;
}

async function evaluateAndStore(answer, voiceMetrics) {
  try {
    const res = await fetch(`${API}/interview/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        question: currentQuestion,
        answer,
        role: selectedRole,
      }),
    });
    const data = await res.json();
    data.question = currentQuestion;
    data.answer = answer;
    if (voiceMetrics) data.voiceConfidence = voiceMetrics.overall;
    allAnswers.push(data);
    showEvalOverlay(data, voiceMetrics);
  } catch (e) {
    showToast("Evaluation failed. Skipping.", "error");
    await proceedAfterAnswer();
  }
}

function skipQuestion() {
  if (isRecording) stopRecording();
  allAnswers.push({
    question: currentQuestion,
    answer: "",
    technical: 1,
    clarity: 1,
    depth: 1,
    confidenceGap: 0,
    feedback: "Skipped.",
    voiceConfidence: 0,
  });
  if (interviewMode === "voice")
    voiceMetricsPerQ.push({
      overall: 0,
      fluency: 0,
      pace: "—",
      vocabRichness: 0,
      completeness: 0,
      fillerPct: 0,
      fillerCount: 0,
    });
  proceedAfterAnswer();
}

function showEvalOverlay(data, voiceMetrics) {
  document.getElementById("eval-tech").textContent = data.technical + "/10";
  document.getElementById("eval-clarity").textContent = data.clarity + "/10";
  document.getElementById("eval-depth").textContent = data.depth + "/10";
  const vcChip = document.getElementById("eval-voice-conf");
  if (voiceMetrics) {
    vcChip.textContent = voiceMetrics.overall + "%";
    vcChip.closest(".eval-score-chip").style.display = "block";
  } else {
    vcChip.closest(".eval-score-chip").style.display = "none";
  }
  document.getElementById("eval-feedback").textContent =
    data.feedback || "Good effort.";
  document.getElementById("eval-overlay").classList.add("show");
}

function nextQuestion() {
  document.getElementById("eval-overlay").classList.remove("show");
  proceedAfterAnswer();
}

async function proceedAfterAnswer() {
  if (allAnswers.length >= 5) await finishInterview();
  else await loadNextQuestion();
}

async function finishInterview() {
  showScreen("screen-results");
  document.getElementById("final-score-display").textContent = "...";
  document.getElementById("risk-pill").textContent = "Calculating...";

  try {
    const res = await fetch(`${API}/interview/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ role: selectedRole, answers: allAnswers }),
    });
    const data = await res.json();
    renderResults(data.interview);
  } catch (e) {
    const avg = (key) =>
      allAnswers.reduce((a, b) => a + (b[key] || 0), 0) / allAnswers.length;
    const t = Math.round(avg("technical") * 10),
      c = Math.round(avg("clarity") * 10),
      d = Math.round(avg("depth") * 10),
      g = Math.round(avg("confidenceGap"));
    const f = Math.round(t * 0.5 + c * 0.25 + d * 0.25);
    const r = g > 35 || f < 60 ? "High" : f >= 80 && g <= 20 ? "Low" : "Medium";
    renderResults({
      finalScore: f,
      technicalScore: t,
      clarityScore: c,
      depthScore: d,
      confidenceGap: g,
      riskLevel: r,
      roadmap: [],
    });
  }
}

function renderResults(iv) {
  const {
    finalScore,
    technicalScore,
    clarityScore,
    depthScore,
    confidenceGap,
    riskLevel,
    roadmap,
  } = iv;

  const se = document.getElementById("final-score-display");
  se.textContent = finalScore;
  se.className = "big-score " + riskLevel.toLowerCase();

  const pill = document.getElementById("risk-pill");
  const emoji = { Low: "✅", Medium: "⚠️", High: "🚨" }[riskLevel] || "—";
  pill.textContent = emoji + " " + riskLevel.toUpperCase() + " RISK";
  pill.className = "risk-pill " + riskLevel.toLowerCase();

  if (confidenceGap > 25) {
    document.getElementById("confidence-alert").style.display = "block";
    document.getElementById("confidence-alert-text").textContent =
      "You answered with confidence but accuracy lagged by " +
      confidenceGap +
      " points. This is the #1 reason candidates fail technical rounds despite feeling prepared.";
  }

  if (interviewMode === "voice" && voiceMetricsPerQ.length > 0) {
    document.getElementById("voice-confidence-card").style.display = "block";
    const avgMetric = (key) =>
      Math.round(
        voiceMetricsPerQ.reduce((a, b) => a + (b[key] || 0), 0) /
          voiceMetricsPerQ.length,
      );
    const avgOverall = avgMetric("overall");
    const avgFluency = avgMetric("fluency");
    const avgVocab = avgMetric("vocabRichness");
    const avgComplete = avgMetric("completeness");
    const avgFiller = avgMetric("fillerPct");
    const paces = voiceMetricsPerQ.map((m) => m.pace);
    const paceMode = paces
      .sort(
        (a, b) =>
          paces.filter((v) => v === a).length -
          paces.filter((v) => v === b).length,
      )
      .pop();

    document.getElementById("vc-overall").textContent = avgOverall + "%";
    document.getElementById("vc-fluency").textContent = avgFluency + "%";
    document.getElementById("vc-pace").textContent = paceMode || "—";
    document.getElementById("vc-vocab-val").textContent = avgVocab + "%";
    document.getElementById("vc-vocab-fill").style.width = avgVocab + "%";
    document.getElementById("vc-complete-val").textContent = avgComplete + "%";
    document.getElementById("vc-complete-fill").style.width = avgComplete + "%";
    document.getElementById("vc-filler-val").textContent = avgFiller + "%";
    document.getElementById("vc-filler-fill").style.width =
      Math.min(100, avgFiller * 3) + "%";

    let insight = "";
    if (avgFiller > 20)
      insight =
        "<strong>High filler word usage (" +
        avgFiller +
        '%)</strong> — words like "um", "uh", and "like" reduce perceived confidence. Practice pausing silently instead of filling gaps.';
    else if (avgOverall >= 75)
      insight =
        "<strong>Strong vocal presence!</strong> Your speech was fluent and well-paced. Focus on deepening technical accuracy to match your confident delivery.";
    else if (avgComplete < 50)
      insight =
        "<strong>Answers were too brief.</strong> Interviewers expect 60-120 word responses for technical questions. Aim to elaborate more on each point.";
    else if (paceMode === "Too Fast")
      insight =
        "<strong>Speaking too fast</strong> signals nervousness. Slow down to 120-150 words per minute — it projects confidence and gives you time to think.";
    else
      insight =
        "<strong>Moderate confidence detected.</strong> Work on reducing hesitations and expanding your vocabulary to sound more authoritative in technical discussions.";
    document.getElementById("vc-insight").innerHTML = insight;
  }

  if (radarChartInstance) radarChartInstance.destroy();
  radarChartInstance = new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: ["Technical", "Clarity", "Depth"],
      datasets: [
        {
          label: "You",
          data: [technicalScore, clarityScore, depthScore],
          backgroundColor: "rgba(0,229,255,0.15)",
          borderColor: "#00e5ff",
          pointBackgroundColor: "#00e5ff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { color: "#5a6070", stepSize: 20 },
          grid: { color: "#1e2130" },
          pointLabels: { color: "#e8eaf0", font: { size: 12 } },
        },
      },
      plugins: { legend: { display: false } },
      animation: { duration: 1000 },
    },
  });

  const bars = document.getElementById("score-bars");
  bars.innerHTML = "";
  [
    ["Technical Accuracy", technicalScore],
    ["Clarity", clarityScore],
    ["Depth", depthScore],
  ].forEach(([label, value]) => {
    bars.innerHTML +=
      '<div class="score-bar-row"><div class="score-bar-label"><span>' +
      label +
      "</span><span>" +
      value +
      '%</span></div><div class="score-bar-track"><div class="score-bar-fill" style="width:' +
      value +
      '%"></div></div></div>';
  });

  const re = document.getElementById("roadmap-steps");
  if (roadmap && roadmap.length > 0) {
    re.innerHTML = roadmap
      .map(
        (step, i) =>
          '<div class="roadmap-step" style="animation-delay:' +
          i * 0.1 +
          's"><div class="step-num">' +
          (i + 1) +
          '</div><div class="step-text">' +
          step +
          "</div></div>",
      )
      .join("");
  } else {
    re.innerHTML =
      '<div style="color:var(--muted)">Roadmap could not be generated.</div>';
  }
}

async function loadDashboard() {
  if (!token) return;
  try {
    const res = await fetch(`${API}/interview/dashboard`, {
      headers: { Authorization: "Bearer " + token },
    });
    const { interviews, stats } = await res.json();
    document.getElementById("stat-total").textContent = stats.totalInterviews;
    document.getElementById("stat-avg").textContent = stats.avgScore || "—";
    document.getElementById("stat-best").textContent = stats.bestScore || "—";
    document.getElementById("dash-user-name").textContent =
      currentUser?.name || "";
    const he = document.getElementById("interview-history");
    if (!interviews || interviews.length === 0) {
      he.innerHTML =
        '<div class="empty-state"><div class="empty-icon">🎯</div><h3>No interviews yet</h3><p>Take your first AI interview to see results here.</p></div>';
      return;
    }
    he.innerHTML = interviews
      .map((iv) => {
        const date = new Date(iv.completedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const rc = iv.riskLevel.toLowerCase();
        const sc =
          iv.riskLevel === "Low"
            ? "var(--success)"
            : iv.riskLevel === "High"
              ? "var(--danger)"
              : "var(--warn)";
        return (
          '<div class="interview-row"><div><div class="ir-role">' +
          iv.role +
          ' Interview</div><div class="ir-date">' +
          date +
          " · " +
          (iv.answers?.length || 5) +
          ' questions</div></div><div class="ir-right"><span class="ir-score" style="color:' +
          sc +
          '">' +
          iv.finalScore +
          '</span><span class="ir-risk ' +
          rc +
          '">' +
          iv.riskLevel +
          "</span></div></div>"
        );
      })
      .join("");
  } catch (e) {
    console.log("Dashboard error", e);
  }
}

function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast " + (type || "") + " show";
  setTimeout(() => t.classList.remove("show"), 3500);
}
