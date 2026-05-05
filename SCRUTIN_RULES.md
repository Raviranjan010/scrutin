# SCRUTIN project rules — read this before every task

## Project identity
- Name: Scrutin (AI code review studio)
- Stack: Node.js + Express backend, React + Vite frontend
- AI: Google Gemini API (@google/generative-ai)
- Style: Instrument Serif + DM Sans fonts

## Design rules — NEVER break these
- NO gradients anywhere — not on buttons, backgrounds, cards, text
- NO blue or purple color scheme — palette is cream #f5f2ec, ink #0f0e0c, gold #c49a3c, sage #4a6b4a, rust #8b3a2a
- NO generic AI template look — no hero with gradient blob, no purple glow
- YES liquid glass morphism: backdrop-filter blur(20px), warm amber borders rgba(196,154,60,0.25), subtle inner shadow
- YES Instrument Serif for headings (italic for accents), DM Sans for body
- YES smooth CSS animations — fadeUp, float, subtle hover transforms
- NO Tailwind — use plain CSS with CSS variables in index.css

## Code rules
- Always use async/await, never .then() chains
- All API keys in .env files, never hardcoded
- Error handling on every API call with proper UI feedback
- Add loading states to every async action

## File structure (do not restructure)
- Backend: /Backend/src/services/, /controllers/, /routes/
- Frontend: /frontend/src/components/, /pages/, /hooks/
- Keep server.js clean — logic goes in /src/

## When you finish a task
- Show me a diff before applying
- Tell me exactly what files you changed
- Tell me what to test manually