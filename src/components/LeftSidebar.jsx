export default function LeftSidebar({ slides, currentSlide, onSlideSelect }) {
  return (
    <div className="p-4">
      <div className="mb-4 px-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          Course Content
        </h2>
        <div className="h-0.5 w-12 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 rounded-full" />
      </div>
      <div className="space-y-2.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onSlideSelect(index)}
            className={`group w-full text-left rounded-xl p-3.5 transition-all duration-300 ${
              currentSlide === index
                ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 border border-teal-400 shadow-xl shadow-teal-500/30 scale-[1.02]'
                : 'bg-white border border-gray-200 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 hover:border-teal-300 hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`text-xs font-black px-2 py-1.5 rounded-lg transition-all duration-300 min-w-[28px] text-center ${
                currentSlide === index
                  ? 'bg-white text-teal-600 shadow-lg'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-teal-100 group-hover:to-cyan-100 group-hover:text-teal-700'
              }`}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold mb-1 leading-snug transition-colors ${
                  currentSlide === index ? 'text-white' : 'text-gray-800 group-hover:text-teal-900'
                }`}>
                  {slide.title}
                </h3>
                <p className={`text-xs line-clamp-2 leading-relaxed transition-colors ${
                  currentSlide === index ? 'text-teal-100' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {slide.summary}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
