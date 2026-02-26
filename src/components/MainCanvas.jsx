import { ZoomIn, ZoomOut, RotateCcw, Download, Loader2, Mic } from 'lucide-react'
import { motion } from 'framer-motion'

const keyPointsMap = {
  1: ["Handles server-side operations", "Processes business logic", "Manages data security"],
  2: ["Always-on computers", "Handles multiple requests", "Physical or cloud-based"],
  3: ["Enables software communication", "Uses HTTP methods", "Returns JSON data"],
  4: ["Stores application data", "SQL or NoSQL types", "Ensures data persistence"],
  5: ["Verifies user identity", "Controls access rights", "Uses tokens and encryption"],
  6: ["Runs JavaScript on servers", "Simplifies web development", "Non-blocking I/O performance"],
  7: ["Client sends requests", "Server processes and responds", "Uses HTTP status codes"],
  8: ["WebSockets for real-time", "Persistent connections", "Used for chat and live updates"],
}

export default function MainCanvas({ slide, zoom, onZoomIn, onZoomOut, onZoomReset, onExportPDF, isExporting, exportProgress }) {
  const keyPoints = keyPointsMap[slide.id] || ["Essential backend concept", "Critical for web development", "Improves application performance"]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-teal-50/30 relative">
      {/* Full-screen export overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
          <p className="text-lg font-bold text-gray-800">Exporting all slides to PDF…</p>
          <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-sm text-teal-600 font-semibold">{exportProgress}%</p>
        </div>
      )}
      {/* Slide Display Area */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6 flex items-center justify-center">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl w-full"
        >
          <div
            id="slide-export-area"
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 hover:shadow-[0_20px_60px_-15px_rgba(20,184,166,0.3)] transition-all duration-500 hover:-translate-y-1"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s ease' }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Image (60%) */}
              <div className="lg:w-[60%] bg-gray-900 relative overflow-hidden group min-h-[180px] sm:min-h-[300px] lg:min-h-[520px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-transparent to-cyan-900/30 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-3xl" />
              </div>

              {/* Right Side - Content (40%) */}
              <div className="lg:w-[40%] p-4 sm:p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/30 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-2xl" />
                <div className="mb-5 relative">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold rounded-full mb-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <span className="text-base">📚</span>
                    <span>LESSON</span>
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
                    {slide.title}
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 rounded-full" />
                </div>
                <div className="relative group/summary">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium pr-8">
                    {slide.summary}
                  </p>
                  <button
                    onClick={() => {
                      window.speechSynthesis?.cancel()
                      const utter = new SpeechSynthesisUtterance(`${slide.title}. ${slide.summary}`)
                      utter.rate = 0.9; utter.pitch = 1.1
                      const voices = window.speechSynthesis.getVoices()
                      const v = voices.find(v => v.lang.startsWith('en') && ['zira','samantha','victoria','karen'].some(n => v.name.toLowerCase().includes(n))) || voices.find(v => v.lang.startsWith('en'))
                      if (v) utter.voice = v
                      window.speechSynthesis.speak(utter)
                    }}
                    title="Read summary aloud"
                    className="absolute top-0 right-0 p-1 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-200 hover:border-teal-400 opacity-0 group-hover/summary:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <Mic className="w-3 h-3 text-teal-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="border-t border-gray-200/50 bg-gradient-to-r from-white via-teal-50/30 to-white px-3 sm:px-6 py-3 sm:py-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
            className="group p-3 rounded-xl bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 disabled:opacity-30 transition-all duration-300 border border-gray-200 hover:border-teal-300 shadow-md hover:shadow-lg hover:scale-110"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-700 group-hover:text-teal-600 transition-colors" />
          </button>
          
          <span className="px-5 py-2 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition-shadow">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={onZoomIn}
            disabled={zoom >= 2}
            className="group p-3 rounded-xl bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 disabled:opacity-30 transition-all duration-300 border border-gray-200 hover:border-teal-300 shadow-md hover:shadow-lg hover:scale-110"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-700 group-hover:text-teal-600 transition-colors" />
          </button>
          
          <button
            onClick={onZoomReset}
            className="group p-3 rounded-xl bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 border border-gray-200 hover:border-teal-300 shadow-md hover:shadow-lg hover:scale-110"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 text-gray-700 group-hover:text-teal-600 group-hover:rotate-180 transition-all duration-500" />
          </button>
          
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-teal-300 to-transparent mx-2" />
          
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-xl hover:shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-xs font-bold overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isExporting
              ? <Loader2 className="relative w-4 h-4 animate-spin" />
              : <Download className="relative w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            }
            <span className="relative hidden sm:inline">
              {isExporting ? `${exportProgress}%` : 'Export PDF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
