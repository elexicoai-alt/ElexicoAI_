import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function NavigationControls({ currentSlide, totalSlides, onPrev, onNext }) {
  return (
    <div className="border-t border-gray-200/50 bg-gradient-to-r from-white via-teal-50/30 to-white px-3 sm:px-6 py-2.5 sm:py-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 disabled:opacity-30 transition-all duration-300 text-sm font-bold border border-gray-200 hover:border-teal-300 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-teal-600 group-hover:-translate-x-0.5 transition-all" />
          <span className="hidden sm:inline text-gray-700 group-hover:text-teal-600 transition-colors">Previous</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-xl shadow-xl">
          <span className="text-sm font-black">{currentSlide + 1}</span>
          <span className="text-sm opacity-60 font-bold">/</span>
          <span className="text-sm font-black">{totalSlides}</span>
        </div>

        <button
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 disabled:opacity-30 transition-all duration-300 text-sm font-bold border border-gray-200 hover:border-teal-300 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
        >
          <span className="hidden sm:inline text-gray-700 group-hover:text-teal-600 transition-colors">Next</span>
          <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  )
}
