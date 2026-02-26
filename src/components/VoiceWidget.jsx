import { useState, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Mic, ChevronDown, ChevronUp } from 'lucide-react'

// Floating voice assistant status widget — listens to custom events from AIInsightsPanel
export default function VoiceWidget() {
  const [enabled, setEnabled] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [lines, setLines] = useState([])       // [{ label, text, type }]
  const [collapsed, setCollapsed] = useState(false)

  // Listen for voice activity events dispatched by AIInsightsPanel
  useEffect(() => {
    const onVoice = (e) => {
      const { text, label, type, speaking: spk } = e.detail
      setSpeaking(spk)
      if (spk && text) {
        setLines(prev => {
          // Replace last entry if same type+label, else append (max 4 lines)
          const next = [...prev]
          const last = next[next.length - 1]
          if (last && last.label === label) {
            next[next.length - 1] = { label, text, type }
          } else {
            next.push({ label, text, type })
          }
          return next.slice(-4)
        })
      }
      if (!spk) setSpeaking(false)
    }
    window.addEventListener('elexico-voice', onVoice)
    return () => window.removeEventListener('elexico-voice', onVoice)
  }, [])

  // Listen for enabled-state changes broadcast by AIInsightsPanel
  useEffect(() => {
    const onToggle = (e) => setEnabled(e.detail.enabled)
    window.addEventListener('elexico-voice-enabled', onToggle)
    return () => window.removeEventListener('elexico-voice-enabled', onToggle)
  }, [])

  const toggle = useCallback(() => {
    const next = !enabled
    setEnabled(next)
    // Tell AIInsightsPanel to honour this
    window.dispatchEvent(new CustomEvent('elexico-voice-toggle', { detail: { enabled: next } }))
    if (!next) {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
  }, [enabled])

  const typeColor = (type) => {
    if (type === 'title')    return 'text-teal-300'
    if (type === 'summary')  return 'text-cyan-200'
    if (type === 'keypoint') return 'text-emerald-300'
    if (type === 'question') return 'text-yellow-300'
    if (type === 'answer')   return 'text-white'
    return 'text-gray-300'
  }

  const typeBadge = (type) => {
    if (type === 'title')    return { label: 'TITLE',     bg: 'bg-teal-700/60' }
    if (type === 'summary')  return { label: 'SUMMARY',   bg: 'bg-cyan-700/60' }
    if (type === 'keypoint') return { label: 'KEY POINT', bg: 'bg-emerald-700/60' }
    if (type === 'question') return { label: 'QUESTION',  bg: 'bg-yellow-700/60' }
    if (type === 'answer')   return { label: 'ANSWER',    bg: 'bg-indigo-700/60' }
    return { label: type?.toUpperCase() || '', bg: 'bg-gray-700/60' }
  }

  return (
    <div className="fixed right-4 top-24 z-40 w-72 select-none">
      {/* Header bar */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-teal-700 via-cyan-700 to-emerald-700 rounded-t-2xl px-4 py-2.5 shadow-xl">
        {/* Animated bars when speaking */}
        <div className="flex items-end gap-[3px] h-5">
          {[1,2,3,4].map(i => (
            <div
              key={i}
              className={`w-1 rounded-full bg-white transition-all duration-150 ${
                speaking && enabled
                  ? 'animate-bounce'
                  : 'h-1 opacity-40'
              }`}
              style={{
                height: speaking && enabled ? `${8 + (i % 3) * 5}px` : '4px',
                animationDelay: `${i * 80}ms`
              }}
            />
          ))}
        </div>

        <span className="flex-1 text-xs font-black text-white tracking-wide uppercase">
          Voice Assistant
        </span>

        {/* Speaking indicator dot */}
        {speaking && enabled && (
          <span className="flex items-center gap-1 text-[10px] text-green-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Speaking
          </span>
        )}

        {/* On/Off toggle */}
        <button
          onClick={toggle}
          title={enabled ? 'Mute voice' : 'Unmute voice'}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            enabled
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-red-500/80 hover:bg-red-500 text-white'
          }`}
        >
          {enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="bg-gray-900/95 backdrop-blur-md rounded-b-2xl shadow-2xl border border-white/10 overflow-hidden">
          {!enabled ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <VolumeX className="w-8 h-8 text-gray-500" />
              <p className="text-xs text-gray-500 font-medium">Voice is muted</p>
              <button
                onClick={toggle}
                className="mt-1 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-all"
              >
                Turn On
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <Mic className="w-7 h-7 text-teal-500 animate-pulse" />
              <p className="text-xs text-teal-400 font-medium">Waiting for slide…</p>
            </div>
          ) : (
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {lines.map((line, i) => {
                const badge = typeBadge(line.type)
                const isLast = i === lines.length - 1
                return (
                  <div
                    key={i}
                    className={`rounded-xl p-3 transition-all duration-300 ${
                      isLast && speaking
                        ? 'bg-white/10 border border-teal-500/50 shadow-lg shadow-teal-500/10'
                        : 'bg-white/5 border border-white/5'
                    }`}
                  >
                    <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mb-1.5 ${badge.bg} text-white/90 tracking-widest`}>
                      {badge.label}
                    </span>
                    <p className={`text-xs leading-relaxed font-medium ${typeColor(line.type)} line-clamp-3`}>
                      {line.text}
                    </p>
                    {isLast && speaking && (
                      <div className="mt-2 h-0.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
