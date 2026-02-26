import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function SlideOverModal({ slide, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 p-5 flex items-center justify-between z-10 shadow-lg">
          <div>
            <div className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Full Details
            </div>
            <h2 className="text-xl font-bold text-white">{slide.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="group p-2 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="p-8 bg-gradient-to-br from-white to-teal-50/30">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: slide.detailedContent }}
          />
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/80 border-t border-gray-200 p-5 shadow-lg backdrop-blur-sm">
          <button
            onClick={onClose}
            className="w-full px-5 py-3 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-lg text-sm font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Close Details
          </button>
        </div>
      </motion.div>
    </>
  )
}
