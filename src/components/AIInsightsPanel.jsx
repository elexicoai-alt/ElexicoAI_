import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, Trash2, Mic, MicOff, Volume2, VolumeX, Pencil, Check, X, Play, Pause, RotateCcw, Square } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://elexicoai-backend.onrender.com/api'

export default function AIInsightsPanel({ slide }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('connected')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [summaryVoiceEnabled, setSummaryVoiceEnabled] = useState(true)
  const [chatVoiceEnabled, setChatVoiceEnabled] = useState(true)
  const [summaryFontSize, setSummaryFontSize] = useState('sm')
  const [keyPointCount, setKeyPointCount] = useState(3)
  const [aiKeyPoints, setAiKeyPoints] = useState(null)
  const [kpLoading, setKpLoading] = useState(false)
  const [summaryLines, setSummaryLines] = useState(3)
  const [autoLinesMode, setAutoLinesMode] = useState(true)   // true = match slide bullets count
  const [aiSummary, setAiSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)
  const [kpError, setKpError] = useState(null)
  const [showCustomize, setShowCustomize] = useState(false)
  const [summaryFocus, setSummaryFocus] = useState('')          // free text
  const [summaryFormat, setSummaryFormat] = useState('paragraph') // paragraph | bullets | table
  const [summaryTone, setSummaryTone] = useState('educational')   // educational | professional | casual | technical | beginner
  const [transcript, setTranscript] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editText, setEditText] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [speakingLabel, setSpeakingLabel] = useState('')
  const [hasInteracted, setHasInteracted] = useState(false)

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const speakCancelRef = useRef(false)
  const lastSpokenRef = useRef(null)           // { items, voiceFlag } for replay
  const summaryVoiceRef = useRef(summaryVoiceEnabled)
  const speakSeqRef = useRef(null)              // forward-ref so replaySpeaking can call speakSequence
  const hasInteractedRef = useRef(false)        // browsers block TTS until first user gesture
  useEffect(() => { summaryVoiceRef.current = summaryVoiceEnabled }, [summaryVoiceEnabled])

  // Mark user interaction so browser allows TTS
  useEffect(() => {
    const mark = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true
        setHasInteracted(true)
      }
    }
    window.addEventListener('click', mark, { once: false })
    window.addEventListener('keydown', mark, { once: false })
    return () => {
      window.removeEventListener('click', mark)
      window.removeEventListener('keydown', mark)
    }
  }, [])

  // Auto-read removed — user clicks the speaker button to listen
  // (slide load no longer triggers TTS)

  // Reset AI key points when slide changes
  useEffect(() => { setAiKeyPoints(null); setKpLoading(false); setKpError(null) }, [slide?.id])

  // Reset AI summary when slide changes
  useEffect(() => { setAiSummary(null); setSummaryLoading(false); setShowCustomize(false); setSummaryError(null) }, [slide?.id])

  // ── Generate AI Summary ────────────────────────────────────────
  const generateAISummary = useCallback(async (lines) => {
    setSummaryLoading(true)
    setSummaryError(null)
    setAiSummary('')

    // Extract actual bullet points from slide detailedContent for 1-sentence-per-bullet mapping
    const slideBullets = extractSlideBullets(slide)
    const effectiveLines = autoLinesMode && slideBullets.length > 0 ? slideBullets.length : lines

    // Build per-bullet instructions when we have actual bullet text
    const shortRule = 'IMPORTANT: Keep every sentence SHORT and SIMPLE — maximum 12 words per sentence. Use plain everyday language. No long or complex sentences.'
    const bulletInstr = (autoLinesMode && slideBullets.length > 0)
      ? `The slide has exactly ${slideBullets.length} key points:\n${slideBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}\nWrite EXACTLY ONE short simple sentence (max 12 words) summarising each point above, in the same order. Each sentence on its own line. Output ${slideBullets.length} lines total — nothing else.`
      : summaryFormat === 'bullets'
        ? `STRICT RULE: Write EXACTLY ${effectiveLines} short bullet point${effectiveLines > 1 ? 's' : ''}, numbered 1 to ${effectiveLines}. Each bullet max 12 words, on its own line. No extra text.`
        : summaryFormat === 'table'
          ? `STRICT RULE: Write a 2-column table (Aspect | Detail) with EXACTLY ${effectiveLines} data row${effectiveLines > 1 ? 's' : ''}. Keep each cell brief. No extra text.`
          : `STRICT RULE: Write EXACTLY ${effectiveLines} short sentence${effectiveLines > 1 ? 's' : ''}. Each sentence max 12 words. Each sentence on its own separate line. Not ${effectiveLines - 1}, not ${effectiveLines + 1} — EXACTLY ${effectiveLines} lines. No headings, no bullets, no extra text.`

    const focusInstr = summaryFocus.trim() ? `Focus specifically on: ${summaryFocus.trim()}.` : ''
    const toneInstr =
      summaryTone === 'professional' ? 'Tone: formal and professional.' :
      summaryTone === 'casual'       ? 'Tone: friendly and conversational.' :
      summaryTone === 'technical'    ? 'Tone: highly technical, assume expert audience.' :
      summaryTone === 'beginner'     ? 'Tone: simple, explain like I am a complete beginner.' :
                                       'Tone: clear and educational.'
    const prompt = [
      `Summarize "${slide.title}": ${slide.summary}`,
      focusInstr,
      shortRule,
      bulletInstr,
      toneInstr,
      'Output ONLY the requested content — no intro, no outro, no commentary.'
    ].filter(Boolean).join(' ')
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, slideTitle: slide.title, slideSummary: slide.summary, history: [], type: 'generate' })
      })
      const data = await res.json()
      if (!res.ok || !data.response) throw new Error(data.error || 'No AI response')
      const raw = data.response.trim()
      const effectiveLinesForTrim = autoLinesMode && extractSlideBullets(slide).length > 0
        ? extractSlideBullets(slide).length : lines

      // Smart sentence parser: try newline-split first, fall back to punctuation boundaries
      const parseSentences = (text, count) => {
        const byLine = text.split(/\n/).map(s => s.trim()).filter(s => s.length > 4)
        if (byLine.length >= count) return byLine.slice(0, count)
        // Fallback: split on sentence-ending punctuation
        const bySentence = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || []
        const cleaned = bySentence.map(s => s.trim()).filter(s => s.length > 4)
        if (cleaned.length >= count) return cleaned.slice(0, count)
        // Return all we have (don't cut an incomplete response)
        return cleaned.length > byLine.length ? cleaned : byLine
      }

      // Slice response to exactly the right number of units in JS
      let trimmed = raw
      if (!autoLinesMode && summaryFormat === 'bullets') {
        const bulletLines = raw.split(/\n/).map(l => l.trim()).filter(l => /^\d+[\.)\-]/.test(l))
        trimmed = bulletLines.slice(0, effectiveLinesForTrim).join('\n') || raw
      } else if (!autoLinesMode && summaryFormat === 'table') {
        const tableLines = raw.split(/\n/).filter(l => l.trim().length > 0)
        trimmed = tableLines.slice(0, effectiveLinesForTrim + 1).join('\n') || raw
      } else {
        const sentences = parseSentences(raw, effectiveLinesForTrim)
        trimmed = sentences.join('\n') || raw
      }

      setAiSummary(trimmed)
      setApiStatus('connected')
      // No auto-play — user clicks the speaker button to listen
    } catch (err) {
      setAiSummary(null)
      setSummaryError(err.message || 'AI generation failed. Try again.')
      setApiStatus('local')
    } finally {
      setSummaryLoading(false)
    }
  }, [slide, summaryFormat, summaryFocus, summaryTone, autoLinesMode])

  // ── Generate key points via AI ────────────────────────────────
  const generateAIKeyPoints = useCallback(async (count) => {
    setKpLoading(true)
    setKpError(null)
    setAiKeyPoints([])
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Generate exactly ${count} concise key points about "${slide.title}". Context: ${slide.summary}. Rules: Return ONLY a numbered list like: 1. Point one 2. Point two — no extra text, no headings, no markdown.`,
          slideTitle: slide.title,
          slideSummary: slide.summary,
          history: [],
          type: 'generate'
        })
      })
      const data = await res.json()
      if (!res.ok || !data.response) throw new Error(data.error || 'No AI response')
      // Parse numbered list from response
      const raw = data.response || ''
      const lines = raw
        .split(/\n/)
        .map(l => l.replace(/^\d+[\.\)\-]\s*/, '').trim())
        .filter(l => l.length > 5)
        .slice(0, count)
      setAiKeyPoints(lines.length ? lines : getKeyPoints(slide).slice(0, count))
      setApiStatus('connected')
      // No auto-play — user clicks the speaker button to listen
    } catch (err) {
      setAiKeyPoints(null)
      setKpError(err.message || 'AI generation failed. Try again.')
      setApiStatus('local')
    } finally {
      setKpLoading(false)
    }
  }, [slide])
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
    setIsPaused(false)
    setSpeakingLabel('')
  }, [])

  const pauseSpeaking = useCallback(() => {
    window.speechSynthesis?.pause()
    setIsPaused(true)
  }, [])

  const resumeSpeaking = useCallback(() => {
    window.speechSynthesis?.resume()
    setIsPaused(false)
  }, [])

  const replaySpeaking = useCallback(() => {
    if (lastSpokenRef.current && speakSeqRef.current) {
      speakSeqRef.current(lastSpokenRef.current.items, lastSpokenRef.current.voiceFlag)
    }
  }, [])

  // ── Speak multiple texts in sequence (each item can have own voice settings) ──
  // items: array of { text, pitch, rate, voiceHint, type, label }
  // voiceFlag: pass summaryVoiceEnabled or chatVoiceEnabled at call site
  const speakSequence = useCallback((items, voiceFlag = true) => {
    if (!window.speechSynthesis || !voiceFlag) return
    speakCancelRef.current = false
    setIsPaused(false)
    window.speechSynthesis.cancel()
    lastSpokenRef.current = { items, voiceFlag }

    const clean = (t) => t
      .replace(/```[\s\S]*?```/g, 'code block omitted')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/[*_#>]/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    const pickVoice = (hint) => {
      const voices = window.speechSynthesis.getVoices()
      const allVoices = voices
      const enVoices = voices.filter(v => v.lang.startsWith('en'))
      if (!enVoices.length) return null
      const indianNames = ['raveena', 'veena', 'lekha', 'aditi', 'heera', 'neerja', 'priya', 'sundar']
      const femaleNames = ['zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'female']
      const maleNames   = ['david', 'mark', 'daniel', 'alex', 'fred', 'male', 'google uk english male']
      if (hint === 'indian') {
        // 1. Try exact en-IN voices first
        const inVoices = allVoices.filter(v => v.lang === 'en-IN')
        if (inVoices.length) return inVoices[0]
        // 2. Try voices with Indian names
        const named = enVoices.find(v => indianNames.some(n => v.name.toLowerCase().includes(n)))
        if (named) return named
        // 3. Fallback to any en-US female-sounding voice for softness
        return enVoices.find(v => femaleNames.some(n => v.name.toLowerCase().includes(n)))
          || enVoices[0]
      }
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
      utter.rate   = item.rate  ?? 0.88
      utter.pitch  = item.pitch ?? 1.05
      utter.volume = 0.72

      const applyVoice = () => {
        const v = pickVoice(item.voiceHint || 'any')
        if (v) utter.voice = v
      }
      applyVoice()
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = applyVoice
      }

      utter.onstart = () => { setIsSpeaking(true); setSpeakingLabel(item.label || item.type || 'Speaking'); dispatch(item, true) }
      utter.onend = () => {
        if (!speakCancelRef.current) { speak(index + 1) } else { setIsSpeaking(false); setSpeakingLabel('') }
      }
      utter.onerror = () => { setIsSpeaking(false); setSpeakingLabel('') }
      window.speechSynthesis.speak(utter)
    }
    speak(0)
  }, [])
  speakSeqRef.current = speakSequence  // keep ref fresh for replay

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
      // No auto-play — user presses Voice Assistant button to listen
    } catch (err) {
      console.error('Chat error:', err)
      const fallback = `Connection issue. About ${slide.title}: ${slide.summary}`
      setMessages(prev => [...prev, { type: 'ai', text: fallback, source: 'fallback' }])
      setApiStatus('disconnected')
      // No auto-play
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
      // No auto-play — user presses Voice Assistant button to listen
    } catch (err) {
      console.error('Edit resubmit error:', err)
      const fallback = `Connection issue. About ${slide.title}: ${slide.summary}`
      setMessages(prev => [...prev, { type: 'ai', text: fallback, source: 'fallback' }])
      setApiStatus('disconnected')
      // No auto-play
    } finally {
      setIsLoading(false)
    }
  }, [editText, slide, speakSequence])

  // ── Speech-to-Text ────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR || isListening) return
    // Stop any ongoing TTS before starting voice input
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
        // Populate input field — user can review then press Send (or Enter)
        setTranscript('')
        setIsListening(false)
        recog.abort()
        setQuestion(finalText.trim())
      }
    }

    recog.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return  // expected — not real errors
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
    <div className="h-full flex flex-col p-4 sm:p-5 bg-gradient-to-b from-white to-gray-50/50">
      {/* Header — compact, fixed */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-xl opacity-40 blur-md animate-pulse" />
          <div className="relative w-9 h-9 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent leading-tight">AI Assistant</h3>
          <p className="text-[10px] text-gray-400 font-medium">Powered by Elexico</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold ${
            apiStatus === 'connected' ? 'bg-green-50 border-green-200 text-green-700' :
            apiStatus === 'local'     ? 'bg-teal-50  border-teal-200  text-teal-700'  :
            'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
          <div className={`w-2 h-2 rounded-full ${
            apiStatus === 'connected' ? 'bg-green-500 animate-pulse' :
            apiStatus === 'local'     ? 'bg-teal-500 animate-pulse'  :
            'bg-yellow-500'
          }`} />
          {apiStatus === 'connected' ? 'Elexico' : apiStatus === 'local' ? 'Local AI' : 'Offline'}
        </div>
      </div>
      {/* All scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-1 pb-2">

        {/* ── Single Voice Assistant Button ── */}
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            onClick={() => {
              hasInteractedRef.current = true
              setHasInteracted(true)
              if (isSpeaking) { stopSpeaking(); return }
              // Stop any active STT
              if (recognitionRef.current) { recognitionRef.current.abort(); setIsListening(false); setTranscript('') }
              // Build full reading list: title → summary → key points → all Q&A
              const pts = (aiKeyPoints && aiKeyPoints.length > 0)
                ? aiKeyPoints
                : (keyPointsMapRef.current[slide.id] || []).slice(0, keyPointCount)
              const chatItems = messagesRef.current.flatMap(m => ([
                m.type === 'user'
                  ? { text: `Question: ${m.text}`, pitch: 1.0, rate: 0.9, voiceHint: 'indian', type: 'question', label: 'Question' }
                  : { text: `Answer: ${m.text}`,   pitch: 1.1, rate: 0.87, voiceHint: 'indian', type: 'answer',  label: 'Answer' }
              ]))
              const items = [
                { text: slide.title,                  pitch: 1.1,  rate: 0.87, voiceHint: 'indian', type: 'title',    label: 'Slide Title' },
                { text: aiSummary || slide.summary,   pitch: 1.05, rate: 0.85, voiceHint: 'indian', type: 'summary',  label: 'Summary' },
                ...(pts.length ? [{ text: `Key Points: ${pts.join('. ')}.`, pitch: 1.05, rate: 0.87, voiceHint: 'indian', type: 'keypoint', label: 'Key Points' }] : []),
                ...chatItems
              ]
              speakSequence(items, true)
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-md hover:scale-105 active:scale-95 ${
              isSpeaking
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-200 hover:from-red-600 hover:to-rose-600'
                : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white shadow-teal-200 hover:from-teal-600 hover:to-cyan-600'
            }`}
          >
            {isSpeaking ? (
              <><Square className="w-4 h-4" /><span>Stop</span>
                <span className="flex gap-0.5">
                  {[0,1,2].map(i => <span key={i} className="w-0.5 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: `${i*150}ms` }} />)}
                </span>
              </>
            ) : (
              <><Volume2 className="w-4 h-4" /><span>Voice Assistant</span></>
            )}
          </button>
          {isSpeaking && (
            <div className="flex items-center gap-1">
              {isPaused ? (
                <button onClick={resumeSpeaking} title="Resume" className="p-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700 transition-all">
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={pauseSpeaking} title="Pause" className="p-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700 transition-all">
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={replaySpeaking} title="Replay" className="p-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700 transition-all">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isSpeaking && speakingLabel && (
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full truncate max-w-[90px]">{speakingLabel}</span>
          )}
        </div>
        <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-2xl p-4 border border-teal-400 shadow-xl relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

          {/* Title row */}
          <div className="relative flex items-center justify-between gap-2 mb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 min-w-0 truncate">
              <div className="w-1 h-5 bg-white rounded-full shadow-lg shrink-0" />
              <span className="truncate">{slide.title}</span>
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              {[['xs','A−'],['sm','A'],['base','A+'],['lg','A⁺⁺']].map(([size, label]) => (
                <button key={size} onClick={() => setSummaryFontSize(size)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black transition-all duration-150 ${
                    summaryFontSize === size ? 'bg-white text-teal-700 shadow-md scale-110' : 'bg-white/20 text-white hover:bg-white/35'
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {/* Lines picker + AI Generate */}
          <div className="relative flex items-center gap-1.5 mb-2 flex-wrap">
            {/* Auto / Manual toggle */}
            <button
              onClick={() => { setAutoLinesMode(v => !v); setAiSummary(null) }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all border ${
                autoLinesMode
                  ? 'bg-white text-teal-700 border-white shadow-md'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/35'
              }`}
            >
              {autoLinesMode
                ? `Auto (${extractSlideBullets(slide).length || '?'})`
                : 'Auto'}
            </button>
            {!autoLinesMode && (
              <>
                <span className="text-[10px] text-white/70 font-semibold">Lines:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={summaryLines}
                  onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setSummaryLines(v); setAiSummary(null) }}
                  className="w-12 h-6 rounded-lg text-center text-[11px] font-black bg-white/20 text-white border border-white/30 focus:outline-none focus:bg-white/30 transition-all"
                />
              </>
            )}
            <button onClick={() => generateAISummary(summaryLines)} disabled={summaryLoading}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/20 hover:bg-white/35 text-white transition-all disabled:opacity-60 hover:scale-105 active:scale-95"
            >
              {summaryLoading
                ? <><span className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generating…</>
                : <><Sparkles className="w-2.5 h-2.5" />AI Generate</>}
            </button>
            {aiSummary && (
              <button onClick={() => { setAiSummary(null); setSummaryError(null) }} title="Reset to original"
                className="p-0.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-all"
              ><X className="w-3 h-3" /></button>
            )}
            {summaryError && (
              <span className="w-full text-[10px] text-red-200 font-semibold mt-1.5 flex items-center gap-1">
                ⚠️ {summaryError}
              </span>
            )}
          </div>

          {/* Customize panel */}
          <div className="mb-2">
            <button
              onClick={() => setShowCustomize(v => !v)}
              className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white font-semibold transition-all"
            >
              <span className={`transition-transform duration-200 ${showCustomize ? 'rotate-90' : ''}`}>▶</span>
              Customize prompt
            </button>
            {showCustomize && (
              <div className="mt-2 space-y-2 bg-white/10 rounded-xl p-3">
                {/* Focus */}
                <div>
                  <label className="block text-[10px] text-white/70 font-bold mb-1">Focus on (optional)</label>
                  <input
                    type="text"
                    value={summaryFocus}
                    onChange={e => setSummaryFocus(e.target.value)}
                    placeholder='e.g. "financial implications" or "beginner pitfalls"'
                    className="w-full rounded-lg px-2.5 py-1.5 text-[11px] bg-white/20 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-white/60 transition-all"
                  />
                </div>
                {/* Format */}
                <div>
                  <label className="block text-[10px] text-white/70 font-bold mb-1">Format</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[['paragraph','Paragraph'],['bullets','Bullet List'],['table','Table']].map(([val, label]) => (
                      <button key={val} onClick={() => setSummaryFormat(val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          summaryFormat === val ? 'bg-white text-teal-700 shadow-md' : 'bg-white/20 text-white hover:bg-white/35'
                        }`}>{label}</button>
                    ))}
                  </div>
                </div>
                {/* Tone */}
                <div>
                  <label className="block text-[10px] text-white/70 font-bold mb-1">Tone</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[['educational','Educational'],['professional','Professional'],['casual','Casual'],['technical','Technical'],['beginner','Beginner']].map(([val, label]) => (
                      <button key={val} onClick={() => setSummaryTone(val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          summaryTone === val ? 'bg-white text-teal-700 shadow-md' : 'bg-white/20 text-white hover:bg-white/35'
                        }`}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary text — clipped to effective count (original) or exact AI content */}
          {(() => {
            const clamp = autoLinesMode ? (extractSlideBullets(slide).length || summaryLines) : summaryLines
            if (summaryLoading) return (
              <div className="space-y-1.5 mt-1">
                {Array.from({ length: clamp }).map((_, i) => (
                  <div key={i} className="h-3.5 bg-white/20 rounded animate-pulse" style={{ width: i === clamp - 1 ? '60%' : '100%' }} />
                ))}
              </div>
            )
            return (
              <>
                <p
                  className={`relative text-${summaryFontSize} text-teal-100 leading-relaxed transition-all duration-200`}
                  style={aiSummary ? { whiteSpace: 'pre-line' } : {
                    display: '-webkit-box',
                    WebkitLineClamp: clamp,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {aiSummary || slide.summary}
                </p>
                {aiSummary && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white border border-white/30">
                      <Sparkles className="w-2.5 h-2.5" />✨ AI Generated
                    </span>
                  </div>
                )}
              </>
            )
          })()}
        </div>

        {/* Key Points */}
        <div>
          <h4 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-gradient-to-b from-teal-600 to-cyan-600 rounded-full" />
            Key Points
          </h4>

          {/* Count picker + AI Generate row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-gray-500 font-semibold">Points:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={keyPointCount}
              onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setKeyPointCount(v); setAiKeyPoints(null); setKpError(null) }}
              className="w-12 h-7 rounded-lg text-center text-xs font-black bg-gray-100 text-gray-700 border border-gray-300 focus:outline-none focus:border-teal-400 transition-all"
            />
            <button
              onClick={() => generateAIKeyPoints(keyPointCount)}
              disabled={kpLoading}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {kpLoading
                ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generating…</>
                : <><Sparkles className="w-3 h-3" />AI Generate</>}
            </button>
            {aiKeyPoints && aiKeyPoints.length > 0 && (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  <Sparkles className="w-2.5 h-2.5" />✨ AI
                </span>
                <button onClick={() => { setAiKeyPoints(null); setKpError(null) }} title="Reset to original"
                  className="p-0.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                ><X className="w-3 h-3" /></button>
              </>
            )}
          </div>
          {kpError && (
            <p className="text-xs text-red-500 font-semibold mb-2 flex items-center gap-1">⚠️ {kpError}</p>
          )}

          <ul className="space-y-3">
            {(aiKeyPoints && aiKeyPoints.length > 0
              ? aiKeyPoints
              : getKeyPoints(slide).slice(0, keyPointCount)
            ).map((point, index) => (
              <li key={index} className="group flex gap-3 text-gray-700 bg-white p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-100 hover:border-teal-200">
                <span className="text-teal-600 font-black text-base group-hover:scale-125 transition-transform duration-300 shrink-0">{index + 1}.</span>
                <span className={`flex-1 font-medium leading-relaxed text-${summaryFontSize} transition-all duration-200`}>{point}</span>
              </li>
            ))}
            {kpLoading && [1,2,3].map(i => (
              <li key={`sk-${i}`} className="flex gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <span className="w-5 h-4 bg-teal-100 rounded animate-pulse" />
                <span className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
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
                        <div className={`bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white p-4 rounded-2xl rounded-br-sm text-${summaryFontSize} leading-relaxed shadow-md transition-all duration-300 hover:shadow-lg`}>
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
                  <div className={`group/ai max-w-[85%] p-4 rounded-2xl rounded-bl-sm text-${summaryFontSize} leading-relaxed shadow-md transition-all duration-300 hover:shadow-lg bg-white text-gray-800 border border-gray-200 relative`}>
                    <p className="font-medium pr-6">{msg.text}</p>
                    {/* Per-message replay button */}
                    <button
                      onClick={() => speakSequence([
                        { text: msg.text, pitch: 1.1, rate: 0.87, voiceHint: 'indian', type: 'answer', label: 'Answer' }
                      ], true)}
                      title="Read aloud"
                      className="absolute top-2 right-2 opacity-0 group-hover/ai:opacity-100 p-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-500 transition-all duration-200"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
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

          {/* Voice reply toggle removed — use Voice Assistant button above */}

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
        {voiceInputSupported && messages.length === 0 && !isListening && !question && (
          <p className="text-center text-xs text-gray-400 mt-2">
            🎤 Tap the mic — your voice will appear in the input box
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
// Parse <li> bullet text from slide detailedContent HTML
// Returns an array of plain-text bullet strings
function extractSlideBullets(slide) {
  if (!slide?.detailedContent) return []
  const matches = [...slide.detailedContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
  return matches
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 2)
}