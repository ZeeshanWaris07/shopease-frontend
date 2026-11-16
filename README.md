# ShopEase Customer Support Frontend

A Vite + React frontend for the ShopEase FastAPI customer-support agent. It includes:

- A sky-blue, cloud-background landing screen with Text and Voice choices.
- Text chat connected to `POST /chat`.
- Voice conversation using the browser's Web Speech API: speech recognition (STT) and speech synthesis (TTS).
- Session ID reuse, response metadata display, request timeout, API errors, responsive layouts, and microphone permission handling.

## 1. Requirements

- Node.js 20.19+ or 22.12+ (Node 22.16+ is recommended for the current Vite 8 toolchain).
- npm.
- Your FastAPI backend and Cloudflare Quick Tunnel running.
- Google Chrome or Microsoft Edge for the most reliable browser speech-recognition support.

## 2. Configure the backend URL

The project includes a `.env` file with your current Cloudflare URL:

```env
VITE_API_BASE_URL=https://agriculture-scripts-watches-celebrate.trycloudflare.com
```

If Cloudflare generates a new Quick Tunnel URL, update this value and restart the Vite dev server. The `.env` file is ignored by Git; set the same variable in your Vercel project settings when deploying.

## 3. Install and run

Open PowerShell in this folder and run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## 4. FastAPI CORS

For local integration while the frontend URL is not fixed, configure FastAPI CORS like this:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, replace `"*"` with the exact deployed frontend origin, for example `https://your-project.vercel.app`. CORS is a browser policy, not authentication; it does not prevent direct API requests from scripts or command-line clients.

## 5. Build for deployment

```powershell
npm run build
```

Vite writes the deployable static frontend to `dist/`. For Vercel, use:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL` = your current Cloudflare URL

After changing a Vercel environment variable, redeploy the frontend.

## 6. Voice notes

- STT uses `SpeechRecognition` / `webkitSpeechRecognition` in the browser; TTS uses `speechSynthesis`.
- The voice experience is configured for English (`en-US`).
- Browser speech recognition is not supported consistently in every browser. Use a current Chrome or Edge browser and allow microphone access.
- Speech recognition generally requires HTTPS, except on localhost. Your Cloudflare Quick Tunnel URL is HTTPS.
- The browser may use its speech service for recognition; this implementation does not call a separate paid STT or TTS provider.
- The app pauses recognition while the assistant speaks, then resumes listening to avoid transcribing its own spoken reply.

## 7. Backend contract

The frontend sends:

```json
{
  "message": "Where is my order?",
  "session_id": null
}
```

It expects the response fields:

```json
{
  "session_id": "optional-session-id",
  "intent": "order_status",
  "response": "Your order is ...",
  "outcome": "resolved"
}
```

Only `response` is required by the UI. The returned `session_id` is reused for later turns when the backend supplies one.
