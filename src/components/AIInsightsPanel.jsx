import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, Trash2, Mic, MicOff, Volume2, VolumeX, Pencil, Check, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://elexicoa1-backend.onrender.com/api'

export default function AIInsightsPanel({ slide }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('connected')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [summaryVoiceEnabled, setSummaryVoiceEnabled] = useState(true)
  const [chatVoiceEnabled, setChatVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editText, setEditText] = useState('')

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const speakCancelRef = useRef(false)
  // Refs to always hold latest values — avoids stale closures in callbacks
  const messagesRef = useRef(messages)
  const isLoadingRef = useRef(isLoading)
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])

  // Check support inside component (safe — runs in browser only)
  const voiceInputSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  const voiceOutputSupported = !!window.speechSynthesis

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Cleanup on slide change / unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      recognitionRef.current?.abort()
    }
  }, [slide])

  // ── Sync voice toggle from VoiceWidget ───────────────────────
  useEffect(() => {
    const onExternalToggle = (e) => {
      setSummaryVoiceEnabled(e.detail.enabled)
      setChatVoiceEnabled(e.detail.enabled)
      if (!e.detail.enabled) {
        speakCancelRef.current = true
        window.speechSynthesis?.cancel()
        setIsSpeaking(false)
      }
    }
    window.addEventListener('elexico-voice-toggle', onExternalToggle)
    return () => window.removeEventListener('elexico-voice-toggle', onExternalToggle)
  }, [])

  // Broadcast voice state so VoiceWidget stays in sync
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('elexico-voice-enabled', { detail: { enabled: summaryVoiceEnabled || chatVoiceEnabled } }))
  }, [summaryVoiceEnabled, chatVoiceEnabled])

  const stopSpeaking = useCallback(() => {
    speakCancelRef.current = true
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  // ── Speak multiple texts in sequence (each item can have own voice settings) ──
  // items: array of { text, pitch, rate, voiceHint, type, label }
  // voiceFlag: pass summaryVoiceEnabled or chatVoiceEnabled at call site
  const speakSequence = useCallback((items, voiceFlag = true) => {
    if (!window.speechSynthesis || !voiceFlag) return
    speakCancelRef.current = false
    window.speechSynthesis.cancel()

    const clean = (t) => t
      .replace(/```[\s\S]*?```/g, 'code block omitted')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/[*_#>]/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    const pickVoice = (hint) => {
      const voices = window.speechSynthesis.getVoices()
      const enVoices = voices.filter(v => v.lang.startsWith('en'))
      if (!enVoices.length) return null
      const femaleNames = ['zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'female']
      const maleNames   = ['david', 'mark', 'daniel', 'alex', 'fred', 'male', 'google uk english male']
      if (hint === 'female') {
        return enVoices.find(v => femaleNames.some(n => v.name.toLowerCase().includes(n)))
          || enVoices.find(v => v.lang === 'en-GB')
          || enVoices[0]
      }
      if (hint === 'male') {
        return enVoices.find(v => maleNames.some(n => v.name.toLowerCase().includes(n)))
          || enVoices.find(v => v.lang === 'en-US' && v.localService)
          || enVoices[enVoices.length - 1]
      }
      return enVoices.find(v => v.localService) || enVoices[0]
    }

    const dispatch = (item, spk) => {
      window.dispatchEvent(new CustomEvent('elexico-voice', {
        detail: { text: item.text, label: item.label || '', type: item.type || 'info', speaking: spk }
      }))
    }

    const speak = (index) => {
      if (speakCancelRef.current || index >= items.length) {
        setIsSpeaking(false)
        window.dispatchEvent(new CustomEvent('elexico-voice', { detail: { text: '', label: '', type: '', speaking: false } }))
        return
      }
      const item = typeof items[index] === 'string'
        ? { text: items[index], pitch: 1, rate: 0.95, voiceHint: 'any', type: 'info', label: '' }
        : items[index]

      const utter = new SpeechSynthesisUtterance(clean(item.text))
      utter.rate   = item.rate  ?? 0.95
      utter.pitch  = item.pitch ?? 1
      utter.volume = 1

      const applyVoice = () => {
        const v = pickVoice(item.voiceHint || 'any')
        if (v) utter.voice = v
      }
      applyVoice()
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = applyVoice
      }

      utter.onstart = () => { setIsSpeaking(true); dispatch(item, true) }
      utter.onend = () => {
        if (!speakCancelRef.current) { speak(index + 1) } else { setIsSpeaking(false) }
      }
      utter.onerror = () => { setIsSpeaking(false) }
      window.speechSynthesis.speak(utter)
    }
    speak(0)
  }, [])

  // ── Key points data (used by summary mic button) ──────────────
  const keyPointsMapRef = useRef({
    1: ["Handles server-side operations", "Processes business logic", "Manages data security"],
    2: ["Always-on computers", "Handles multiple requests", "Physical or cloud-based"],
    3: ["Enables software communication", "Uses HTTP methods", "Returns JSON data"],
    4: ["Stores application data", "SQL or NoSQL types", "Ensures data persistence"],
    5: ["Verifies user identity", "Controls access rights", "Uses tokens and encryption"],
    6: ["Runs JavaScript on servers", "Simplifies web development", "Non-blocking I/O performance"],
    7: ["Client sends requests", "Server processes and responds", "Uses HTTP status codes"],
    8: ["WebSockets for real-time", "Persistent connections", "Used for chat and live updates"],
  })

  // ── Core submit (used by both text & voice) ─────────────────────────
  const doSubmit = useCallback(async (q) => {
    const currentMessages = messagesRef.current
    if (!q.trim() || isLoadingRef.current) return

    const userMsg = { type: 'user', text: q }
    const updated = [...currentMessages, userMsg]
    setMessages(updated)
    setQuestion('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          slideTitle: slide.title,
          slideSummary: slide.summary,
          history: currentMessages.slice(-6)
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const aiMsg = { type: 'ai', text: data.response, source: data.source }
      setMessages(prev => [...prev, aiMsg])
      setApiStatus(data.source === 'groq' || data.source === 'gemini' ? 'connected' : 'local')
      speakSequence([
        { text: `Question: ${q}`,             pitch: 0.85, rate: 1.05, voiceHint: 'male',   type: 'question', label: 'Question' },
        { text: `Answer: ${data.response}`,   pitch: 1.1,  rate: 0.92, voiceHint: 'female', type: 'answer',   label: 'Answer' },
      ], chatVoiceEnabled)
    } catch (err) {
      console.error('Chat error:', err)
      const fallback = `Connection issue. About ${slide.title}: ${slide.summary}`
      setMessages(prev => [...prev, { type: 'ai', text: fallback, source: 'fallback' }])
      setApiStatus('disconnected')
      speakSequence([
        { text: `Question: ${q}`,           pitch: 0.85, rate: 1.05, voiceHint: 'male',   type: 'question', label: 'Question' },
        { text: `Answer: ${fallback}`,       pitch: 1.1,  rate: 0.92, voiceHint: 'female', type: 'answer',   label: 'Answer' },
      ], chatVoiceEnabled)
    } finally {
      setIsLoading(false)
    }
  }, [slide, speakSequence])

  const handleSubmit = (e) => {
    e.preventDefault()
    doSubmit(question)
  }

  // ── Edit a sent user message ──────────────────────────────────
  const startEdit = (index, text) => {
    setEditingIndex(index)
    setEditText(text)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditText('')
  }

  const saveEdit = useCallback(async (index) => {
    const newText = editText.trim()
    if (!newText || isLoadingRef.current) return

    // Keep history before the edited message, then add edited user msg
    const prior = messagesRef.current.slice(0, index)
    const userMsg = { type: 'user', text: newText }
    const updated = [...prior, userMsg]
    setMessages(updated)
    messagesRef.current = updated
    setEditingIndex(null)
    setEditText('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newText,
          slideTitle: slide.title,
          slideSummary: slide.summary,
          history: prior.slice(-6)
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const aiMsg = { type: 'ai', text: data.response, source: data.source }
      setMessages(prev => [...prev, aiMsg])
      setApiStatus(data.source === 'groq' || data.source === 'gemini' ? 'connected' : 'local')
      speakSequence([
        { text: `Question: ${newText}`,        pitch: 0.85, rate: 1.05, voiceHint: 'male',   type: 'question', label: 'Question' },
        { text: `Answer: ${data.response}`,    pitch: 1.1,  rate: 0.92, voiceHint: 'female', type: 'answer',   label: 'Answer' },
      ], chatVoiceEnabled)
    } catch (err) {
      console.error('Edit resubmit error:', err)
      const fallback = `Connection issue. About ${slide.title}: ${slide.summary}`
      setMessages(prev => [...prev, { type: 'ai', text: fallback, source: 'fallback' }])
      setApiStatus('disconnected')
      speakSequence([
        { text: `Question: ${newText}`,        pitch: 0.85, rate: 1.05, voiceHint: 'male',   type: 'question', label: 'Question' },
        { text: `Answer: ${fallback}`,         pitch: 1.1,  rate: 0.92, voiceHint: 'female', type: 'answer',   label: 'Answer' },
      ], chatVoiceEnabled)
    } finally {
      setIsLoading(false)
    }
  }, [editText, slide, speakSequence])

  // ── Speech-to-Text ────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR || isListening) return
    stopSpeaking()

    const recog = new SR()
    recognitionRef.current = recog
    recog.lang = 'en-US'
    recog.interimResults = true
    recog.continuous = false
    recog.maxAlternatives = 1

    recog.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recog.onresult = (event) => {
      let interim = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) finalText += t
        else interim += t
      }
      setTranscript(interim || finalText)
      if (finalText.trim()) {
        // Directly submit with final text — no state timing issues
        setTranscript('')
        setIsListening(false)
        recog.abort()
        doSubmit(finalText.trim())
      }
    }

    recog.onerror = (e) => {
      console.warn('Speech error:', e.error)
      setIsListening(false)
      setTranscript('')
    }

    recog.onend = () => {
      setIsListening(false)
      setTranscript('')
    }

    recog.start()
  }

  const stopListening = () => {
    recognitionRef.current?.abort()
    setIsListening(false)
    setTranscript('')
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50/50">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-2xl opacity-50 blur-lg animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">AI Assistant</h3>
            <p className="text-xs text-gray-400 font-medium">Powered by Elexico</p>
          </div>
          <div className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-full border ${
              apiStatus === 'connected' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
              apiStatus === 'local' ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' :
              apiStatus === 'local' ? 'bg-teal-500 animate-pulse' :
              'bg-yellow-500'
            }`} />
            <span className={`text-xs font-bold ${
              apiStatus === 'connected' ? 'text-green-700' :
              apiStatus === 'local' ? 'text-teal-700' :
              'text-yellow-700'
            }`}>
              {apiStatus === 'connected' ? 'Elexico' : apiStatus === 'local' ? 'Local AI' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-2xl p-5 border border-teal-400 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative flex items-start justify-between gap-2 mb-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-1.5 h-6 bg-white rounded-full shadow-lg shrink-0" />
              {slide.title}
            </h4>
            <button
              onClick={() => {
                const points = keyPointsMapRef.current[slide.id] || []
                speakSequence([
                  { text: slide.title,   pitch: 1.15, rate: 0.9,  voiceHint: 'female', type: 'title',    label: 'Slide' },
                  { text: slide.summary, pitch: 1.1,  rate: 0.88, voiceHint: 'female', type: 'summary',  label: 'Summary' },
                  ...(points.length ? [{ text: `Key Points: ${points.join('. ')}.`, pitch: 1.05, rate: 0.9, voiceHint: 'female', type: 'keypoint', label: 'Key Points' }] : [])
                ], summaryVoiceEnabled)
              }}
              title="Read summary aloud"
              className="shrink-0 p-1.5 rounded-full bg-white/20 hover:bg-white/35 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Mic className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="relative text-sm text-teal-100 leading-relaxed">{slide.summary}</p>
        </div>
      </div>

      {/* Key Points + Chat Messages - shared scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-1 pb-2">

        {/* Key Points */}
        <div>
          <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-gradient-to-b from-teal-600 to-cyan-600 rounded-full" />
            Key Points
            <button
              type="button"
              onClick={() => { setSummaryVoiceEnabled(v => !v); if (summaryVoiceEnabled) stopSpeaking() }}
              title={summaryVoiceEnabled ? 'Mute summary voice' : 'Enable summary voice'}
              className={`ml-auto p-1.5 rounded-lg border transition-all duration-200 ${
                summaryVoiceEnabled
                  ? 'bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {summaryVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </h4>
          <ul className="space-y-3">
            {getKeyPoints(slide).map((point, index) => (
              <li key={index} className="group flex gap-3 text-sm text-gray-700 bg-white p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-100 hover:border-teal-200">
                <span className="text-teal-600 font-black text-lg group-hover:scale-125 transition-transform duration-300">•</span>
                <span className="flex-1 font-medium leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
          <span className="text-xs text-teal-500 font-bold uppercase tracking-wider">Chat</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chat Messages */}
        {messages.length === 0 ? (
          <div className="space-y-3">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl mb-3 shadow-md">
                <Sparkles className="w-7 h-7 text-teal-600" />
              </div>
              <p className="text-sm text-gray-600 font-bold mb-1">Ask me anything</p>
              <p className="text-xs text-gray-400">on any topic — I'm here to help</p>
            </div>
            {/* Suggested question chips */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1">Try asking:</p>
              {[
                `What is ${slide.title}?`,
                `How does ${slide.title} work?`,
                `Give me a code example`,
                `Why is it important?`,
                `Explain it like I'm a beginner`,
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuestion(suggestion)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-white border border-teal-100 text-teal-700 font-medium hover:bg-teal-50 hover:border-teal-300 hover:shadow-md transition-all duration-200 hover:translate-x-0.5"
                >
                  💬 {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'user' ? (
                  <div className="max-w-[85%] group relative">
                    {editingIndex === index ? (
                      /* ── Inline editor ── */
                      <div className="bg-white border-2 border-teal-400 rounded-2xl rounded-br-sm shadow-lg p-3 min-w-[220px]">
                        <textarea
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(index) }
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          rows={Math.min(6, editText.split('\n').length + 1)}
                          className="w-full text-sm text-gray-800 font-medium resize-none outline-none leading-relaxed"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(index)}
                            disabled={!editText.trim()}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg transition-all disabled:opacity-50 shadow-sm"
                          >
                            <Check className="w-3 h-3" /> Save & Send
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Normal user bubble ── */
                      <div className="relative">
                        <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white p-4 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-md transition-all duration-300 hover:shadow-lg">
                          <p className="font-medium pr-6">{msg.text}</p>
                        </div>
                        {/* Edit pencil button — visible on hover */}
                        <button
                          onClick={() => startEdit(index, msg.text)}
                          disabled={isLoading || editingIndex !== null}
                          title="Edit message"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white/20 hover:bg-white/40 text-white transition-all duration-200 disabled:hidden"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-bl-sm text-sm leading-relaxed shadow-md transition-all duration-300 hover:shadow-lg bg-white text-gray-800 border border-gray-200">
                    <p className="font-medium">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Thinking…</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice listening indicator */}
      {isListening && (
        <div className="mx-1 mb-2 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
          <div className="flex gap-0.5 items-end h-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${40 + Math.sin(i * 1.2) * 40}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${600 + i * 80}ms`
                }}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-red-600 flex-1">
            {transcript ? `"${transcript}"` : 'Listening… speak your question'}
          </p>
          <button onClick={stopListening} className="text-xs text-red-400 hover:text-red-600 font-semibold">stop</button>
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="mx-1 mb-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl">
          <Volume2 className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <p className="text-xs font-bold text-teal-600 flex-1">Speaking…</p>
          <button onClick={stopSpeaking} className="text-xs text-teal-400 hover:text-teal-600 font-semibold">stop</button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={isListening ? 'Listening…' : 'Ask me anything — any topic, any question...'}
            disabled={isLoading || isListening}
            className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-medium transition-all hover:border-teal-300 disabled:bg-gray-50 shadow-sm"
          />

          {/* Mic button */}
          {voiceInputSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              title={isListening ? 'Stop listening' : 'Speak your question'}
              className={`p-3.5 rounded-xl transition-all duration-300 border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-500 border-red-400 text-white animate-pulse hover:bg-red-600 shadow-red-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Voice reply toggle */}
          {voiceOutputSupported && (
            <button
              type="button"
              onClick={() => { setChatVoiceEnabled(v => !v); stopSpeaking() }}
              title={chatVoiceEnabled ? 'Mute chat voice' : 'Enable chat voice'}
              className={`p-3.5 rounded-xl transition-all duration-300 border shadow-sm ${
                chatVoiceEnabled
                  ? 'bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100'
                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              {chatVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !question.trim() || isListening}
            className="group p-3.5 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Voice hint */}
        {voiceInputSupported && messages.length === 0 && !isListening && (
          <p className="text-center text-xs text-gray-400 mt-2">
            🎤 Tap the mic to ask with your voice
          </p>
        )}
      </form>
    </div>
  )
}

function getKeyPoints(slide) {
  const keyPointsMap = {
    1: ["Handles server-side operations", "Processes business logic", "Manages data security"],
    2: ["Always-on computers", "Handles multiple requests", "Physical or cloud-based"],
    3: ["Enables software communication", "Uses HTTP methods", "Returns JSON data"],
    4: ["Stores application data", "SQL or NoSQL types", "Ensures data persistence"],
    5: ["Verifies user identity", "Controls access rights", "Uses tokens and encryption"],
    6: ["Runs JavaScript on servers", "Simplifies web development", "Non-blocking I/O performance"],
    7: ["Client sends requests", "Server processes and responds", "Uses HTTP status codes"],
    8: ["WebSockets for real-time", "Persistent connections", "Used for chat and live updates"]
  }
  
  return keyPointsMap[slide.id] || ["Essential backend concept", "Critical for web development", "Improves application performance"]
}
