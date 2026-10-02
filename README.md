# PlaceIQ — AI-Powered Technical Interview Platform

PlaceIQ is an AI-powered technical interview practice platform designed to help developers evaluate their technical knowledge, identify weak areas, and receive personalized improvement guidance.

The platform simulates a technical interview by dynamically generating questions based on the selected role, evaluating candidate responses using AI, calculating performance metrics, and generating a personalized learning roadmap.

## Live Demo

**Frontend:**  https://place-iq-olive.vercel.app/

**Backend API:** https://placeiq-backend-pjvf.onrender.com/

> The application requires user authentication to access the interview and dashboard features.

---

## Features

* AI-generated technical interview questions
* Role-based interviews

  * Frontend Development
  * Backend Development
  * Machine Learning
  * Data Structures & Algorithms
* Text-based interview mode
* Voice-based interview mode using the Web Speech API
* AI-powered answer evaluation
* Technical accuracy, clarity, and depth scoring
* Confidence-gap analysis
* Interview performance history
* Personalized learning roadmap
* JWT-based authentication
* MongoDB-based persistent interview history
* Responsive React frontend
* RESTful Node.js/Express backend

---

## How It Works

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │     Vite + Tailwind │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │      Backend        │
                    └───────┬─────┬───────┘
                            │     │
                    ┌───────┘     └────────┐
                    ▼                       ▼
             ┌─────────────┐        ┌─────────────┐
             │   MongoDB   │        │   Groq AI   │
             │             │        │             │
             │ Users       │        │ Questions   │
             │ Interviews  │        │ Evaluation  │
             └─────────────┘        └─────────────┘
```

### Interview Flow

1. User creates an account or logs in.
2. User selects an interview category.
3. PlaceIQ generates technical questions using AI.
4. The candidate submits a text or voice answer.
5. The backend sends the question and answer to the AI evaluation service.
6. The response is evaluated across multiple dimensions.
7. Interview results are stored in MongoDB.
8. The dashboard displays previous interview performance.
9. PlaceIQ generates a personalized roadmap based on weaker areas.

---

## AI Evaluation

PlaceIQ does not simply judge whether an answer contains keywords.

The evaluation considers:

### Technical Accuracy

Measures whether the candidate's solution is technically correct and appropriate for the problem.

### Clarity

Measures how clearly and logically the candidate communicates the solution.

### Depth

Measures the candidate's reasoning, understanding, edge cases, implementation details, and complexity analysis.

### Confidence Gap

Identifies cases where a candidate presents technically incorrect information with high confidence.

The evaluator also distinguishes between:

* Correct and optimal solutions
* Correct but non-optimal solutions
* Partially correct solutions
* Incorrect solutions
* Non-answers such as `"I don't know"`

Non-answers are handled deterministically before sending the response to the AI evaluator.

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* Web Speech API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Axios

### AI

* Groq API
* `openai/gpt-oss-20b`

### Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

---

## Project Structure

```text
PlaceIQ/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Interviews

```http
POST /api/interviews/start
POST /api/interviews/submit
GET  /api/interviews/history
GET  /api/interviews/:id
```

### Authentication

Protected endpoints require a JWT:

```http
Authorization: Bearer <token>
```

---

## Environment Variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE=http://localhost:5000/api
```

For production:

```env
VITE_API_BASE=https://placeiq-backend-pjvf.onrender.com/api
```

**Never commit `.env` files or API keys to GitHub.**

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/owais-usmani-017/PlaceIQ.git

cd PlaceIQ
```

### 2. Start the backend

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## Security Considerations

PlaceIQ uses several basic security mechanisms:

* Password hashing with bcrypt
* JWT-based authentication
* Protected API routes
* Environment variables for secrets
* CORS configuration
* Server-side validation
* Deterministic handling of invalid/non-answer submissions

Production deployments should additionally use appropriate rate limiting, security headers, monitoring, and secret-management practices.

---

## Future Improvements

Potential improvements include:

* Redis-based rate limiting
* HttpOnly cookie-based authentication
* Automated frontend/backend tests
* More advanced AI evaluation benchmarks
* Interview difficulty adaptation
* Better analytics and performance visualization
* Background processing for AI evaluation
* More granular role and technology selection
* Improved voice-interview analytics
* CI/CD checks with automated testing

---

## Why PlaceIQ?

Traditional interview preparation platforms primarily provide static questions.

PlaceIQ focuses on the **complete interview loop**:

```text
Question
   ↓
Candidate Answer
   ↓
AI Evaluation
   ↓
Performance Analysis
   ↓
Weak Areas
   ↓
Personalized Roadmap
```

The goal is to make technical interview preparation more interactive, measurable, and personalized.

---

## Author

**Owais Usmani**

B.Tech Computer Science & Engineering

GitHub: https://github.com/owais-usmani-017
