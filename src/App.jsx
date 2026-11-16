import { useCallback, useEffect, useRef, useState } from 'react';
import { sendChatMessage } from './api.js';

function Icon({ name, size = 24, strokeWidth = 2, className = '' }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  const paths = {
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 13h.01M15 13h.01"/></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 8.9a16 16 0 0 0 6 6l.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z"/></>,
    arrowLeft: <><path d="m15 18-6-6 6-6"/><path d="M20 12H9"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>,
    micOff: <><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-5.8-1"/><path d="M5 10v2a7 7 0 0 0 12 4.9M19 10v2a6.9 6.9 0 0 1-.5 2.6M12 19v3m-4 0h8M2 2l20 20"/></>,
    phoneOff: <><path d="m16 2 6 6M22 2l-6 6"/><path d="M8.5 8.5a16 16 0 0 0 7 7l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1v2.3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 3.6 7"/><path d="M2 2 6 6"/></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></>,
    bot: <><rect x="3" y="7" width="18" height="14" rx="4"/><path d="M12 3v4M8 13h.01M16 13h.01M9 17h6"/><path d="M8 3h8"/></>,
    sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    alert: <><path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  };

  return <svg {...common}>{paths[name] || paths.sparkles}</svg>;
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function App() {
  const [screen, setScreen] = useState('home');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async (rawMessage) => {
    const message = rawMessage.trim();
    if (!message) return '';
    if (message.length > 2000) {
      throw new Error('Please keep your message under 2,000 characters.');
    }

    setMessages((current) => [...current, {
      id: makeId(),
      role: 'user',
      content: message,
      createdAt: new Date(),
    }]);
    setIsSending(true);

    try {
      const result = await sendChatMessage({ message, sessionId });
      if (result.sessionId) setSessionId(result.sessionId);
      setMessages((current) => [...current, {
        id: makeId(),
        role: 'assistant',
        content: result.response,
        intent: result.intent,
        outcome: result.outcome,
        createdAt: new Date(),
      }]);
      return result.response;
    } catch (error) {
      setMessages((current) => [...current, {
        id: makeId(),
        role: 'assistant',
        content: `I'm sorry — I couldn't complete that request. ${error.message}`,
        isError: true,
        createdAt: new Date(),
      }]);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [sessionId]);

  const goHome = useCallback(() => setScreen('home'), []);

  return (
    <main className="app-shell">
      {screen === 'home' && (
        <HomeScreen
          onText={() => setScreen('text')}
          onVoice={() => setScreen('voice')}
        />
      )}
      {screen === 'text' && (
        <TextChatScreen
          messages={messages}
          isSending={isSending}
          onSend={sendMessage}
          onBack={goHome}
        />
      )}
      {screen === 'voice' && (
        <VoiceCallScreen
          messages={messages}
          isSending={isSending}
          onSend={sendMessage}
          onBack={goHome}
        />
      )}
    </main>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}`}>
      <div className="brand-icon"><Icon name="bag" size={compact ? 22 : 29} strokeWidth={2.2} /></div>
      <span className="brand-name">SHOPEASE</span>
    </div>
  );
}

function HomeScreen({ onText, onVoice }) {
  return (
    <section className="home-screen">
      <div className="home-topline"><span className="status-dot" /> SHOP EASE · CUSTOMER CARE</div>
      <div className="home-content">
        <div className="home-brand-block">
          <Brand />
          <div className="home-subtitle-row"><span /><h1>Customer Support</h1><span /></div>
          <p className="home-tagline">A little help goes a long way.</p>
        </div>
        <div className="home-actions">
          <button className="mode-card" onClick={onText} type="button">
            <span className="mode-icon"><Icon name="chat" size={34} /></span>
            <span className="mode-title">Text</span>
            <span className="mode-description">Chat with our support team</span>
            <span className="mode-arrow"><Icon name="arrowLeft" size={18} /></span>
          </button>
          <button className="mode-card" onClick={onVoice} type="button">
            <span className="mode-icon"><Icon name="phone" size={34} /></span>
            <span className="mode-title">Voice</span>
            <span className="mode-description">Talk to our AI assistant</span>
            <span className="mode-arrow"><Icon name="arrowLeft" size={18} /></span>
          </button>
        </div>
      </div>
      <div className="home-footer"><span />Here for you, whenever you need us<span /></div>
    </section>
  );
}

function ScreenHeader({ title, subtitle, onBack, mode }) {
  return (
    <header className="screen-header">
      <button className="icon-button back-button" type="button" onClick={onBack} aria-label="Back to home">
        <Icon name="arrowLeft" size={21} />
      </button>
      <div className="screen-header-brand"><Brand compact /></div>
      <div className="screen-heading">
        <div className="screen-heading-title">{title}</div>
        <div className="screen-heading-subtitle">{subtitle}</div>
      </div>
      <div className={`mode-indicator mode-indicator--${mode}`}>
        <span />{mode === 'voice' ? 'VOICE' : 'TEXT'}
      </div>
    </header>
  );
}

function MessageList({ messages, mode }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className={`messages-list messages-list--${mode}`} role="log" aria-live="polite" aria-relevant="additions text">
      {messages.length === 0 && (
        <div className="empty-chat-state">
          <div className="empty-chat-icon"><Icon name="sparkles" size={26} /></div>
          <h2>How can we help?</h2>
          <p>Ask us about an order, delivery, payments, or anything else you need help with.</p>
          <div className="suggestion-pills"><span>Track an order</span><span>Return policy</span><span>Payment options</span></div>
        </div>
      )}
      {messages.map((message) => (
        <article key={message.id} className={`message-row message-row--${message.role}`}>
          {message.role === 'assistant' && (
            <div className={`message-avatar${message.isError ? ' message-avatar--error' : ''}`}>
              <Icon name={message.isError ? 'alert' : 'bot'} size={17} />
            </div>
          )}
          <div className={`message-bubble${message.isError ? ' message-bubble--error' : ''}`}>
            <div className="message-content">{message.content}</div>
            {message.role === 'assistant' && (message.intent || message.outcome) && (
              <div className="message-meta">
                {message.intent && <span>{String(message.intent).replaceAll('_', ' ')}</span>}
                {message.outcome && <span>{String(message.outcome).replaceAll('_', ' ')}</span>}
              </div>
            )}
            <time className="message-time">{formatTime(message.createdAt)}</time>
          </div>
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(value instanceof Date ? value : new Date(value));
}

function TextChatScreen({ messages, isSending, onSend, onBack }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const submit = async (event) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;
    setDraft('');
    await onSend(message).catch(() => {});
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section className="workspace-screen">
      <div className="workspace-card">
        <ScreenHeader title="Chat with us" subtitle="We’re ready to help you" mode="text" onBack={onBack} />
        <MessageList messages={messages} mode="text" />
        {isSending && (
          <div className="typing-row"><span className="typing-dots"><i /><i /><i /></span><span>ShopEase is typing</span></div>
        )}
        <form className="composer" onSubmit={submit}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="Write your message..."
            rows={1}
            maxLength={2000}
            aria-label="Write your message"
          />
          <div className="composer-bottom">
            <span className="composer-hint">Press Enter to send · Shift + Enter for a new line</span>
            <div className="composer-actions">
              <span className="character-count">{draft.length}/2000</span>
              <button className="send-button" type="submit" disabled={!draft.trim() || isSending} aria-label="Send message">
                <Icon name="send" size={18} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function VoiceCallScreen({ messages, isSending, onSend, onBack }) {
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const listeningRef = useRef(false);
  const processingRef = useRef(false);
  const speakingRef = useRef(false);
  const restartTimerRef = useRef(null);
  const callGenerationRef = useRef(0);
  const startRecognitionRef = useRef(null);
  const processUtteranceRef = useRef(null);

  const [isSupported, setIsSupported] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [callNotice, setCallNotice] = useState('');

  const speak = useCallback((text) => new Promise((resolve) => {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => voice.lang?.toLowerCase() === 'en-us')
      || voices.find((voice) => voice.lang?.toLowerCase().startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    speakingRef.current = true;
    setIsSpeaking(true);
    utterance.onend = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      resolve();
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  }), []);

  const processUtterance = useCallback(async (text) => {
    const callGeneration = callGenerationRef.current;
    processingRef.current = true;
    setIsProcessing(true);
    setCallNotice(`You said: “${text}”`);
    try {
      const response = await onSend(text);
      if (activeRef.current && callGeneration === callGenerationRef.current) await speak(response);
    } catch {
      if (activeRef.current && callGeneration === callGenerationRef.current) {
        await speak('I am having trouble connecting to ShopEase support. Please try again.');
      }
    } finally {
      if (callGeneration === callGenerationRef.current) {
        processingRef.current = false;
        setIsProcessing(false);
        if (activeRef.current && !speakingRef.current) scheduleRecognitionRestart();
      }
    }
  }, [onSend, speak]);
  processUtteranceRef.current = processUtterance;

  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !activeRef.current || processingRef.current || speakingRef.current || listeningRef.current) return;
    try {
      recognition.start();
      listeningRef.current = true;
      setIsListening(true);
      setVoiceError('');
    } catch (error) {
      if (error.name !== 'InvalidStateError') {
        setVoiceError('Could not start the microphone. Check your browser permissions and try again.');
      }
    }
  }, []);
  startRecognitionRef.current = startRecognition;

  function scheduleRecognitionRestart() {
    window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = window.setTimeout(() => {
      startRecognitionRef.current?.();
    }, 450);
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      listeningRef.current = true;
      setIsListening(true);
      setVoiceError('');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();
        if (!transcript) continue;
        if (result.isFinal) finalText += `${transcript} `;
        else interimText += `${transcript} `;
      }
      setInterimTranscript(interimText.trim());

      const message = finalText.trim();
      if (message && !processingRef.current) {
        setInterimTranscript('');
        listeningRef.current = false;
        setIsListening(false);
        try { recognition.stop(); } catch { /* Recognition may already have stopped. */ }
        processUtteranceRef.current?.(message);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        activeRef.current = false;
        setCallActive(false);
        setIsListening(false);
        setVoiceError('Microphone access was blocked. Allow microphone access for this site, then start the call again.');
        return;
      }
      if (event.error === 'network') {
        setVoiceError('Browser speech recognition could not connect. Check your internet connection and try again.');
        return;
      }
      setVoiceError(`Speech recognition error: ${event.error}.`);
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setIsListening(false);
      if (activeRef.current && !processingRef.current && !speakingRef.current) {
        scheduleRecognitionRestart();
      }
    };

    return () => {
      activeRef.current = false;
      window.clearTimeout(restartTimerRef.current);
      try { recognition.stop(); } catch { /* No active recognition session. */ }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      recognitionRef.current = null;
    };
  }, []);

  const startCall = () => {
    setVoiceError('');
    setCallNotice('Your voice session is ready. Speak after the microphone starts listening.');
    if (!('speechSynthesis' in window)) {
      setVoiceError('This browser does not support spoken responses. Try the latest Chrome or Microsoft Edge.');
      return;
    }
    callGenerationRef.current += 1;
    activeRef.current = true;
    processingRef.current = false;
    speakingRef.current = false;
    setCallActive(true);
    startRecognitionRef.current?.();
  };

  const endCall = () => {
    callGenerationRef.current += 1;
    activeRef.current = false;
    listeningRef.current = false;
    processingRef.current = false;
    speakingRef.current = false;
    window.clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* No active recognition session. */ }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setInterimTranscript('');
    setCallNotice('Call ended. You can start another voice session whenever you’re ready.');
  };

  const status = isSpeaking
    ? 'ShopEase is speaking'
    : isProcessing || isSending
      ? 'Preparing your response'
      : isListening
        ? 'Listening to you'
        : callActive
          ? 'Reconnecting microphone…'
          : 'Ready when you are';

  return (
    <section className="workspace-screen">
      <div className="workspace-card voice-workspace-card">
        <ScreenHeader title="Voice support" subtitle="Speak naturally with ShopEase" mode="voice" onBack={() => { endCall(); onBack(); }} />
        <div className="voice-layout">
          <div className="voice-main-panel">
            <div className={`voice-orb-wrap${callActive ? ' voice-orb-wrap--active' : ''}${isSpeaking ? ' voice-orb-wrap--speaking' : ''}`}>
              <div className="voice-orb-ring voice-orb-ring--one" />
              <div className="voice-orb-ring voice-orb-ring--two" />
              <div className="voice-orb">
                <Icon name={isListening ? 'mic' : isSpeaking ? 'volume' : 'bot'} size={39} strokeWidth={1.8} />
              </div>
            </div>
            <div className="voice-status">{status}</div>
            <p className="voice-instruction">
              {!isSupported
                ? 'Voice input is not supported in this browser. Please use the text chat or open this page in Chrome or Edge.'
                : !callActive
                  ? 'Start a call and allow microphone access. Your browser will listen and read ShopEase replies aloud.'
                  : isListening
                    ? 'Go ahead — tell us what you need help with.'
                    : isSpeaking
                      ? 'Please listen. The microphone will resume after the reply.'
                      : isProcessing || isSending
                        ? 'ShopEase is working on your request…'
                        : 'Your microphone is reconnecting. You can keep speaking once it is listening.'}
            </p>
            {interimTranscript && <div className="live-transcript"><span>HEARING</span>{interimTranscript}</div>}
            {voiceError && <div className="voice-error"><Icon name="alert" size={17} />{voiceError}</div>}
            {callNotice && !voiceError && <div className="call-notice">{callNotice}</div>}
            <div className="voice-controls">
              {!callActive ? (
                <button className="start-call-button" type="button" onClick={startCall} disabled={!isSupported}>
                  <Icon name="phone" size={19} /> Start voice call
                </button>
              ) : (
                <button className="end-call-button" type="button" onClick={endCall}>
                  <Icon name="phoneOff" size={19} /> End call
                </button>
              )}
            </div>
            <div className="voice-privacy-note"><Icon name="check" size={14} /> Your voice is converted in the browser and sent as text to ShopEase.</div>
          </div>
          <aside className="voice-transcript-panel">
            <div className="transcript-heading"><div><span className="eyebrow">LIVE SESSION</span><h3>Conversation</h3></div><span className={`live-pill${callActive ? ' live-pill--active' : ''}`}><i />{callActive ? 'LIVE' : 'IDLE'}</span></div>
            <MessageList messages={messages} mode="voice" />
          </aside>
        </div>
      </div>
    </section>
  );
}

export default App;
