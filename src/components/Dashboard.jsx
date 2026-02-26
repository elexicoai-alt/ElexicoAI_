import { useState } from 'react'
import jsPDF from 'jspdf'
import LeftSidebar from './LeftSidebar'
import MainCanvas from './MainCanvas'
import AIInsightsPanel from './AIInsightsPanel'
import NavigationControls from './NavigationControls'
import { slidesData } from '../data/slides'
import { Menu, X } from 'lucide-react'

export default function Dashboard() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleSlideChange = (index) => {
    setCurrentSlide(index)
    setZoom(1) // Reset zoom when changing slides
    setIsSidebarOpen(false) // Close mobile sidebar
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleZoomReset = () => {
    setZoom(1)
  }

  const handleExportPDF = async () => {
    if (isExporting) return
    setIsExporting(true)
    setExportProgress(0)

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

    try {
      // ── Fetch all slide images as base64 data URLs ──────────
      setExportProgress(5)
      const images = await Promise.all(
        slidesData.map(async (slide) => {
          try {
            const resp = await fetch(slide.image)
            if (!resp.ok) throw new Error('HTTP ' + resp.status)
            const blob = await resp.blob()
            return await new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
          } catch {
            return null // placeholder if image unavailable
          }
        })
      )
      setExportProgress(30)

      // ── PDF layout constants (A4 landscape: 297 × 210 mm) ──
      const PW = 297, PH = 210
      const IMGW = 160          // image panel width
      const GAP = 3             // divider strip
      const CX = IMGW + GAP + 3 // content text start x
      const CW = PW - CX - 5   // available text width

      const TEAL   = [13, 148, 136]
      const T_DARK = [15, 118, 110]
      const WHITE  = [255, 255, 255]
      const GRAY   = [55, 65, 81]
      const LGRAY  = [248, 250, 252]

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      slidesData.forEach((slide, i) => {
        if (i > 0) pdf.addPage([PW, PH], 'landscape')

        // Background
        pdf.setFillColor(...LGRAY)
        pdf.rect(0, 0, PW, PH, 'F')

        // ── Image panel (left) ─────────────────────────────────
        pdf.setFillColor(17, 24, 39)
        pdf.rect(0, 0, IMGW, PH, 'F')
        if (images[i]) {
          try { pdf.addImage(images[i], 'JPEG', 0, 0, IMGW, PH, '', 'FAST') } catch { /* keep dark bg */ }
        }

        // Teal divider strip
        pdf.setFillColor(...TEAL)
        pdf.rect(IMGW, 0, GAP, PH, 'F')

        // ── Header bar (right panel top) ───────────────────────
        pdf.setFillColor(...TEAL)
        pdf.rect(IMGW + GAP, 0, PW - IMGW - GAP, 46, 'F')

        // Slide number badge
        pdf.setFillColor(...WHITE)
        pdf.circle(CX + 6, 15, 6.5, 'F')
        pdf.setTextColor(...T_DARK)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        const numStr = String(i + 1)
        pdf.text(numStr, CX + 6 - pdf.getTextWidth(numStr) / 2, 18.3)

        // Title
        pdf.setTextColor(...WHITE)
        pdf.setFontSize(13.5)
        pdf.setFont('helvetica', 'bold')
        const titleLines = pdf.splitTextToSize(slide.title, CW - 20)
        pdf.text(titleLines, CX + 16, 13)

        // Sub-label
        pdf.setFontSize(6.5)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(204, 245, 240)
        const subY = titleLines.length > 1 ? 34 : 26
        pdf.text(
          `BACKEND DEVELOPMENT  •  LESSON ${i + 1} OF ${slidesData.length}`,
          CX + 16, subY
        )

        // ── Summary ────────────────────────────────────────────
        let y = 56
        pdf.setFontSize(7.5)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...TEAL)
        pdf.text('SUMMARY', CX, y)
        pdf.setFillColor(...TEAL)
        pdf.rect(CX, y + 1.2, 23, 0.7, 'F')
        y += 7

        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...GRAY)
        const summaryLines = pdf.splitTextToSize(slide.summary, CW).slice(0, 5)
        pdf.text(summaryLines, CX, y)
        y += summaryLines.length * 4.8 + 7

        // ── Key Points ─────────────────────────────────────────
        pdf.setFontSize(7.5)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...TEAL)
        pdf.text('KEY POINTS', CX, y)
        pdf.setFillColor(...TEAL)
        pdf.rect(CX, y + 1.2, 28, 0.7, 'F')
        y += 7

        const keyPoints = keyPointsMap[slide.id] || [
          "Essential backend concept",
          "Critical for web development",
          "Improves performance",
        ]
        keyPoints.forEach((point) => {
          if (y > PH - 18) return
          pdf.setFillColor(...TEAL)
          pdf.circle(CX + 2, y - 1.5, 1.5, 'F')
          pdf.setFontSize(8.5)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(...GRAY)
          pdf.text(point, CX + 6, y)
          y += 7
        })

        // ── Footer ─────────────────────────────────────────────
        pdf.setFillColor(...T_DARK)
        pdf.rect(IMGW + GAP, PH - 11, PW - IMGW - GAP, 11, 'F')
        pdf.setTextColor(...WHITE)
        pdf.setFontSize(7.5)
        pdf.setFont('helvetica', 'bold')
        pdf.text('ElexicoAI', CX, PH - 4)
        pdf.setFont('helvetica', 'normal')
        const pg = `Page ${i + 1} / ${slidesData.length}`
        pdf.text(pg, PW - pdf.getTextWidth(pg) - 4, PH - 4)

        setExportProgress(30 + Math.round(((i + 1) / slidesData.length) * 68))
      })

      setExportProgress(100)
      pdf.save('ElexicoAI_Backend_Course.pdf')
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed: ' + (err?.message || String(err)))
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(slidesData.length - 1, prev + 1))
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600" />
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2.5 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 rounded-xl transition-all duration-300 hover:scale-110 border border-transparent hover:border-teal-200"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-1.5 h-9 bg-gradient-to-b from-teal-600 via-cyan-600 to-emerald-600 rounded-full shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-b from-teal-600 via-cyan-600 to-emerald-600 rounded-full blur-sm opacity-50" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">ElexicoAI</h1>
          </div>
        </div>
        <button
          onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
          className="lg:hidden group px-5 py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2.5 relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
          <span className="relative">AI</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block w-64 border-r border-gray-200 bg-white overflow-y-auto">
          <LeftSidebar
            slides={slidesData}
            currentSlide={currentSlide}
            onSlideSelect={handleSlideChange}
          />
        </div>

        {/* Left Sidebar - Mobile Overlay */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-72 sm:w-80 h-full bg-white overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
              <LeftSidebar
                slides={slidesData}
                currentSlide={currentSlide}
                onSlideSelect={handleSlideChange}
              />
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto">
          <MainCanvas
            slide={slidesData[currentSlide]}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onExportPDF={handleExportPDF}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />
        </div>

        {/* AI Insights Panel - Desktop */}
        <div className="hidden lg:flex lg:flex-col w-80 xl:w-[28rem] border-l border-gray-200 bg-white overflow-hidden">
          <AIInsightsPanel slide={slidesData[currentSlide]} />
        </div>

        {/* AI Insights Panel - Mobile Drawer */}
        {isAIPanelOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setIsAIPanelOpen(false)}>
        <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white overflow-hidden shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="p-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
                <button onClick={() => setIsAIPanelOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
          </div>
              <div className="flex-1 overflow-y-auto">
                <AIInsightsPanel slide={slidesData[currentSlide]} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        currentSlide={currentSlide}
        totalSlides={slidesData.length}
        onPrev={handlePrevSlide}
        onNext={handleNextSlide}
      />
    </div>
  )
}
