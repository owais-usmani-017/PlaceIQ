# PlaceIQ Frontend - React + Tailwind CSS

A modern, responsive interview preparation platform frontend built with **React**, **Vite**, and **Tailwind CSS**.

## 🎯 Project Overview

PlaceIQ is an AI-powered interview intelligence platform that:

- **Simulates real placement interviews** with AI-generated questions
- **Evaluates answers** using AI and voice analysis
- **Measures vocal confidence** with real-time metrics
- **Provides placement readiness assessment** with risk scoring

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── screens/                  # Main application screens
│   │   ├── LandingScreen.jsx     # Hero landing page
│   │   ├── AuthScreen.jsx        # Login/Signup forms
│   │   ├── RoleSelectionScreen.jsx # Interview setup
│   │   ├── InterviewScreen.jsx   # Interview Q&A room
│   │   ├── ResultsScreen.jsx     # Results & scores
│   │   └── DashboardScreen.jsx   # Interview history
│   ├── components/               # Reusable React components
│   │   ├── Navigation.jsx        # Top navigation bar
│   │   └── Toast.jsx             # Notifications
│   ├── utils/
│   │   └── api.js                # API calls & voice analysis
│   ├── App.jsx                   # Main app component
│   ├── index.css                 # Tailwind + custom styles
│   ├── colors.css                # Custom color utilities
│   └── main.jsx                  # React entry point
├── public/                       # Static assets
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── vite.config.js                # Vite configuration
└── index.html                    # HTML template
```

## 🛠️ Technology Stack

- **React 19** - UI library
- **Vite 8** - Fast build tool & dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS transformations with Tailwind
- **Web Speech API** - Voice recording & recognition
- **Chart.js** - Data visualization (for results)

## 🎨 Design System

### Color Palette

- **Dark Background**: `#08090d`
- **Card Background**: `#141720`
- **Primary Accent**: `#00e5ff` (Cyan)
- **Secondary Accent**: `#7b61ff` (Purple)
- **Success**: `#00e096` (Green)
- **Warning**: `#ffb830` (Orange)
- **Danger**: `#ff4d6d` (Red)

### Typography

- **Headings**: Syne (Bold, 400-800 weights)
- **Body**: DM Sans (Regular, 300-500 weights)

## ✨ Key Features

### 1. Landing Page

- Hero section with compelling tagline
- Feature cards highlighting benefits
- Clear CTA for signup/login

### 2. Authentication

- Login with email/password
- Signup with name, email, password
- JWT token-based security
- Session persistence with localStorage

### 3. Interview Experience

#### Text Mode

- AI-generated questions
- Type-based answer submission
- Instant evaluation feedback

#### Voice Mode

- Real-time voice recognition (Web Speech API)
- Live waveform animation
- Confidence meter (0-100%)
- Transcript display
- Voice metrics:
  - Overall confidence %
  - Speech fluency %
  - Pace classification (Too Slow/Good/Ideal/Fast/Too Fast)
  - Vocabulary richness %
  - Answer completeness %
  - Filler word detection (%um, uh, like, etc.)

### 4. Results & Analytics

- **Final Score**: 0-100 scale with risk level
- **Score Breakdown**: Technical, Clarity, Depth
- **Confidence Gap Alert**: When tone exceeds accuracy
- **Voice Insights**: Personalized delivery feedback
- **Improvement Roadmap**: Actionable next steps

### 5. Dashboard

- Cumulative statistics
- Interview history with timestamps
- Role-based performance tracking
- Quick access to new interview

## 📱 Responsive Design

- Mobile-first approach using Tailwind
- Optimized for all screen sizes
- Touch-friendly interface

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts dev server at `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## 📚 Component Documentation

### Screens

- **LandingScreen**: Hero landing page
- **AuthScreen**: Login/Signup with tabs
- **RoleSelectionScreen**: Interview configuration
- **InterviewScreen**: Q&A interface with voice support
- **ResultsScreen**: Comprehensive results & metrics
- **DashboardScreen**: User statistics & history

### Components

- **Navigation**: Sticky top nav with user info
- **Toast**: Non-invasive notifications

### Utilities

- **api.js**:
  - `apiCall()` - Unified API requests
  - `analyzeVoiceConfidence()` - Voice metrics calculation

## 🎯 API Integration

### Backend URL

```
https://place-iq-know-before-you-get-placed.onrender.com/api
```

### Available Endpoints

- `POST /auth/login`
- `POST /auth/register`
- `POST /interview/question`
- `POST /interview/evaluate`
- `POST /interview/finish`
- `GET /interview/dashboard`

## 🎨 Styling

### Tailwind Classes

- Standard Tailwind utilities for layout
- Custom utilities for colors in `colors.css`
- Animations defined in `index.css`

### Custom Color Utilities

- `.text-accent-cyan` / `.bg-accent-cyan`
- `.text-text-light` / `.text-text-muted`
- `.text-status-*` (success, warn, danger)
- `.bg-dark-*` (bg, card)

### Components

- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.btn-ghost` - Tertiary button
- `.card` - Card container
- `.badge` - Status badge
- `.input-field` - Styled input

## 🔐 Security

- JWT token-based authentication
- Secure password validation
- Tokens stored in localStorage
- API calls include bearer token

## 📊 Performance

- **JavaScript**: ~216KB (gzip: ~67KB)
- **CSS**: ~26KB (gzip: ~5.7KB)
- **Build Time**: < 1 second with Vite

## 🔧 Development

### Adding New Screens

1. Create file in `src/screens/`
2. Import and add to routing in `App.jsx`
3. Pass necessary props from App state

### Adding New Components

1. Create file in `src/components/`
2. Import and use in screens
3. Pass data via props

### API Calls

Always use `apiCall()` from `utils/api.js` for consistency:

```javascript
const data = await apiCall("/endpoint", "POST", body, token);
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
  (Web Speech API required for voice mode)

## 📝 Environment Variables

Currently using hardcoded API URL. To use environment variables:

```javascript
// Create .env.local
VITE_API_BASE=https://your-api.com/api
```

Then import: `import.meta.env.VITE_API_BASE`

## 🚀 Deployment

Ready to deploy to:

- **Vercel** (recommended for Vite)
- **Netlify**
- **GitHub Pages**
- **AWS Amplify**
- **Any static hosting**

## 📄 License

Proprietary - PlaceIQ

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Version**: 1.0.0  
**Built**: April 2026  
**Tech Stack**: React 19 + Vite 8 + Tailwind CSS 4
