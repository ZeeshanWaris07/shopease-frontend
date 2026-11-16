const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function sendChatMessage({ message, sessionId }) {
  if (!API_BASE_URL) {
    throw new Error('The backend URL is missing. Set VITE_API_BASE_URL in your .env file.');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId || null,
      }),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    let data = {};

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        throw new Error('The backend returned an unreadable response.');
      }
    }

    if (!response.ok) {
      const detail = typeof data.detail === 'string'
        ? data.detail
        : `The backend request failed (${response.status}).`;
      throw new Error(detail);
    }

    if (typeof data.response !== 'string' || !data.response.trim()) {
      throw new Error('The backend response did not contain a valid response message.');
    }

    return {
      sessionId: typeof data.session_id === 'string' ? data.session_id : null,
      intent: data.intent ?? null,
      outcome: data.outcome ?? null,
      response: data.response,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request took too long. Please try again.');
    }
    if (error instanceof TypeError) {
      throw new Error('Could not reach the backend. Check that your FastAPI server and Cloudflare Tunnel are running.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
