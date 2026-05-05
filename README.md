# Scrutin — AI Code Reviewer

Scrutin is a powerful, full-stack application designed to deliver **instant, AI-driven code reviews** with deep insights into code quality, performance, security, and best practices. It acts as your real-time technical reviewer, helping you write cleaner, faster, and more scalable code without waiting for manual feedback.

## ✨ Features

- **Intelligent Code Review Engine:** AI-powered deep code understanding using Google Gemini.
- **Security Scan Mode:** Identify critical vulnerabilities and secrets based on OWASP top 10.
- **Interactive Code Editor:** Built with CodeMirror, featuring multi-language syntax highlighting.
- **Structured Feedback:** Detailed insights covering Code Quality, Bugs, Performance, Security, and general improvements.
- **Shareable Reports:** Generate public URLs for reviews to easily share feedback with your team.
- **Real-Time Streaming:** Get instant feedback as the AI generates the review, character by character.
- **Authentication & Usage Metering:** GitHub OAuth integration and rate limiting to manage AI usage effectively.

## ⚙️ Tech Stack

**Frontend:**
- React 19 + Vite
- CodeMirror (Editor)
- React Router (Routing)
- React Markdown (Review rendering)

**Backend:**
- Node.js + Express
- Google Generative AI (Gemini)
- Passport (GitHub OAuth)
- Helmet & Rate Limit (Security)

---

## 🔧 Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd scrutin
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory from the template:
```bash
cp .env.example .env
```

| Environment Variable | Description |
|----------------------|-------------|
| `PORT` | The port the backend server will run on (e.g., 3000) |
| `NODE_ENV` | Environment state (set to `development` locally) |
| `FRONTEND_URL` | The URL of your frontend (e.g., `http://localhost:5173`) |
| `GOOGLE_GEMINI_KEY` | Your Google Gemini API key |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth App Client Secret |
| `JWT_SECRET` | Secret key for JSON Web Tokens |
| `SESSION_SECRET` | Secret key for Express sessions |

Start the backend development server:
```bash
npm start
```
*(Or use `node server.js` if nodemon is not configured)*

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory from the template:
```bash
cp .env.example .env
```

Or set manually:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🚀 Deployment Instructions

### Backend (Railway)

1. Ensure your code is pushed to a GitHub repository.
2. Log in to [Railway](https://railway.app/).
3. Click **New Project** -> **Deploy from GitHub repo**.
4. Select your repository.
5. In the service settings, go to the **Variables** tab and add all the variables from your Backend `.env` file.
   - *Note: Set `NODE_ENV=production`.*
6. Railway will automatically use the `railway.json` file to configure the NIXPACKS builder and start the server.
7. Once deployed, note the generated public URL (e.g., `https://your-app.up.railway.app`).

### Frontend (Vercel)

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Expand **Build and Output Settings** and ensure:
   - Framework Preset is set to **Vite** (Vercel usually detects this automatically).
   - Build Command is `npm run build`.
   - Output Directory is `dist`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL` set to your **Railway Backend URL** (e.g., `https://your-app.up.railway.app`).
6. Click **Deploy**.
7. Vercel will use the `vercel.json` file to correctly route requests for the React single-page application.

> **Important:** After your frontend is deployed, make sure to update the `FRONTEND_URL` environment variable in your **Railway** backend settings to match your new Vercel URL (e.g., `https://your-vercel-app.vercel.app`). Also update your GitHub OAuth App's callback URL.

---

## 📄 License

This project is licensed under the MIT License.