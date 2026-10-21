# CineMind AI — Fire TV Entertainment Companion

An Angular TV-first web app with a Node.js/Express backend. It helps people describe the kind of movie night they want and recommends titles with short explanations. The UI is designed for a 10-foot TV experience and supports keyboard/remote-style arrow navigation.

## Features
- TV-friendly dark interface, large cards, focus states, and arrow/Enter navigation.
- Natural-language prompt such as “funny family movie under two hours”.
- Recommendations from a sample catalog, with explanations and fit tags.
- Optional live AI via an OpenAI-compatible Chat Completions API.
- Runs in demo mode without an AI key, so the prototype is testable immediately.
- Backend health endpoint and recommendation API.

## Stack
- Frontend: Angular + TypeScript + CSS
- Backend: Node.js + Express
- AI: optional OpenAI-compatible API configured only on the server

## Requirements
- Node.js 20+ and npm
- For Fire TV submission: package/host the web app using the Fire TV web-app workflow or a suitable Fire OS/Vega OS wrapper, then demonstrate it running on an actual Fire TV device or the Fire TV/Vega simulator. A normal desktop browser preview alone does not meet the hackathon demo requirement.

## Run locally

### 1. Start the backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Windows PowerShell users can copy the file with:
```powershell
Copy-Item .env.example .env
```
Backend default: `http://localhost:3000`

### 2. Start Angular
Open another terminal:
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:4200`.

The Angular dev server proxies `/api` requests to `http://localhost:3000`.

## Enable live AI (optional)
Edit `backend/.env`:
```env
AI_API_KEY=your_api_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```
Keep keys in `.env`; never put API keys in Angular/browser code or commit `.env`. Without a key, the app uses its local demo recommender.

## Build frontend
```bash
cd frontend
npm run build
```
Angular build output is created under `frontend/dist/`.

## Fire TV / hackathon checklist
- [ ] Verify the app at TV resolution (1920×1080).
- [ ] Test focus movement with arrow keys and activation with Enter/Space.
- [ ] Configure a reachable HTTPS backend URL for a hosted Fire TV app; `localhost` on a Fire TV points to the TV itself, not your development PC.
- [ ] Package or wrap the app using the official Fire TV/Vega workflow appropriate for the target OS.
- [ ] Record a demo under 3 minutes showing the app on a real device or simulator.
- [ ] Publish source to GitHub with a license and include setup instructions.
- [ ] Add honest tool/API feedback in the Devpost submission.

## Important
This is a prototype starter, not a certified Fire TV package. Device packaging, hosting, and real-device/simulator verification remain separate steps.


## Troubleshooting buttons / recommendations

1. Keep the backend running in one terminal (`cd backend`, `npm run dev`).
2. Keep Angular running in a second terminal (`cd frontend`, `npm start`).
3. Open `http://localhost:4200` (not the backend root on port 3000).
4. This version only intercepts arrow keys for TV navigation. Enter and Space are left to native browser controls so buttons and the search form work normally.
5. Verify `http://localhost:3000/api/health` returns JSON and `http://localhost:3000/api/catalog` returns movie data.
6. If a recommendation request fails, Angular displays an error below the results heading. Open DevTools → Network and inspect the `POST /api/recommend` request.
