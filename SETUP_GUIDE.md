# 🧠 PlaceIQ — Complete Setup Guide
# Read this top to bottom. Do it step by step. Don't skip anything.

═══════════════════════════════════════════════════════════════
 STEP 1 — GET YOUR FREE API KEY (Groq)
═══════════════════════════════════════════════════════════════

1. Open browser → go to: https://console.groq.com
2. Click "Sign Up" → sign up with Google
3. Once inside, click "API Keys" on the left sidebar
4. Click "Create API Key" → give it any name like "placeiq"
5. COPY the key — it looks like: gsk_xxxxxxxxxxxxxxxxxxxx
6. Paste it in Notepad. You'll need it in Step 3.


═══════════════════════════════════════════════════════════════
 STEP 2 — GET YOUR FREE DATABASE (MongoDB Atlas)
═══════════════════════════════════════════════════════════════

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free" → Sign up with Google
3. Choose FREE tier (M0 Sandbox) → click Create
4. Set username: placeiq_user
5. Set password: placeiq_pass123  (remember these!)
6. Click "Add My Current IP Address"
7. Click "Finish and Close"
8. On the main dashboard, click "Connect"
9. Choose "Connect your application"
10. Copy the connection string — looks like:
    mongodb+srv://placeiq_user:<password>@cluster0.xxxxx.mongodb.net/
11. Replace <password> with: placeiq_pass123
12. Paste this in Notepad too.


═══════════════════════════════════════════════════════════════
 STEP 3 — INSTALL NODE.JS (if not done already)
═══════════════════════════════════════════════════════════════

1. Go to: https://nodejs.org
2. Download the LTS version
3. Install it (just click Next → Next → Install)
4. Open VS Code terminal (Ctrl + `)
5. Type: node --version
6. You should see something like: v20.x.x ✅


═══════════════════════════════════════════════════════════════
 STEP 4 — SET UP THE BACKEND
═══════════════════════════════════════════════════════════════

Open VS Code terminal and type these commands one by one:

  cd backend
  npm install

Now create your .env file:
  - Copy the file called .env.example
  - Rename the copy to just: .env  (no .example)
  - Open it and fill in:

    GROQ_API_KEY=paste_your_groq_key_here
    MONGODB_URI=paste_your_mongodb_string_here
    JWT_SECRET=placeiq_super_secret_key_2024
    PORT=5000

Save the file.


═══════════════════════════════════════════════════════════════
 STEP 5 — START THE BACKEND
═══════════════════════════════════════════════════════════════

In the terminal (make sure you're in the backend folder):

  node server.js

You should see:
  🚀 Server running on port 5000
  ✅ MongoDB Connected

If you see both lines → BACKEND IS WORKING ✅
Keep this terminal open. Don't close it.


═══════════════════════════════════════════════════════════════
 STEP 6 — OPEN THE FRONTEND
═══════════════════════════════════════════════════════════════

1. Open the frontend/ folder in VS Code
2. Right-click on index.html
3. Click "Open with Live Server"
   (If you don't have Live Server: Install it from VS Code Extensions)
4. Your browser will open with PlaceIQ!


═══════════════════════════════════════════════════════════════
 STEP 7 — TEST THE FULL FLOW
═══════════════════════════════════════════════════════════════

1. Click "Get Started" on the landing page
2. Create an account with any email + password
3. Select a role (e.g. Backend Developer)
4. Click "Start AI Interview"
5. Answer all 5 questions
6. See your score, radar chart, and roadmap!
7. Click "View Dashboard" to see your history


═══════════════════════════════════════════════════════════════
 COMMON ERRORS & FIXES
═══════════════════════════════════════════════════════════════

❌ "Cannot connect to server"
→ Your backend is not running. Go to terminal, type: node server.js

❌ "MongoDB Error"
→ Your MONGODB_URI in .env is wrong. Double check the password.

❌ "AI question not loading"
→ Your GROQ_API_KEY is wrong. Copy it again from console.groq.com

❌ "npm install fails"
→ Make sure you're inside the backend/ folder before running it.


═══════════════════════════════════════════════════════════════
 DEPLOY FOR HACKATHON (Day 4)
═══════════════════════════════════════════════════════════════

BACKEND → Render.com (Free)
1. Push your backend folder to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Set environment variables (same as your .env file)
5. Deploy! You get a URL like: https://placeiq-api.onrender.com

FRONTEND → Netlify (Free)
1. Go to netlify.com
2. Drag and drop your frontend/ folder
3. Done! You get a URL like: https://placeiq.netlify.app
4. IMPORTANT: Open frontend/index.html and change this line:
   const API = 'http://localhost:5000/api';
   TO:
   const API = 'https://placeiq-api.onrender.com/api';


═══════════════════════════════════════════════════════════════
 HACKATHON DEMO SCRIPT (Practice this 5 times)
═══════════════════════════════════════════════════════════════

"Most students don't fail placements because they didn't study.
They fail because they don't know what they don't know.

PlaceIQ gives you a real AI interview, evaluates your answers instantly,
and shows you your placement risk score.

But the most important feature — [show confidence gap alert] —
is our Confidence Gap detector. It finds candidates who answer
confidently but inaccurately. That's the hidden reason people
fail technical rounds despite feeling prepared.

This is your personal AI placement mentor. Available 24/7. Free."

[Show the radar chart. Judges will take photos of it.]


═══════════════════════════════════════════════════════════════
 FILE STRUCTURE (for reference)
═══════════════════════════════════════════════════════════════

placeiq/
├── frontend/
│   └── index.html          ← The entire frontend (all pages)
│
└── backend/
    ├── server.js            ← Main entry point
    ├── .env                 ← Your secret keys (never share this!)
    ├── package.json
    ├── config/
    │   └── db.js            ← MongoDB connection
    ├── models/
    │   ├── User.js          ← User database schema
    │   └── Interview.js     ← Interview database schema
    ├── controllers/
    │   ├── authController.js
    │   └── interviewController.js
    ├── routes/
    │   ├── auth.js
    │   └── interview.js
    ├── services/
    │   ├── aiService.js     ← Talks to Groq AI
    │   └── scoringService.js ← Calculates scores
    └── middleware/
        └── auth.js          ← JWT token checker
