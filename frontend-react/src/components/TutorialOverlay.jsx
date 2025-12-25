import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

/**
 * TutorialOverlay
 * Creates a semi-transparent mask with a "hole" over a target element.
 * 
 * @param {Object} targetRect - DOMRect of the element to highlight
 * @param {String} title - Step title
 * @param {String} message - Instruction message
 * @param {Number} currentStep - Current step index
 * @param {Number} totalSteps - Total number of steps
 * @param {Function} onNext - Next step callback
 * @param {Function} onPrev - Prev step callback
 * @param {Function} onSkip - Skip tutorial callback
 */
const TutorialOverlay = ({ 
  targetRect, 
  title, 
  message, 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onSkip,
  showNext = true
}) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate position for the tooltip based on the targetRect
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 24;
    let top = targetRect.bottom + padding;
    let left = targetRect.left + (targetRect.width / 2);

    // Flip to top if not enough space at bottom
    if (top + 200 > window.innerHeight) {
      top = targetRect.top - padding - 200; // 200 is rough height
    }

    // Keep within horizontal bounds
    left = Math.max(padding + 150, Math.min(window.innerWidth - padding - 150, left));

    return { 
      top, 
      left,
      transform: 'translateX(-50%)'
    };
  };

  const tooltipPos = getTooltipPosition();

  // SVG Mask Logic
  const maskId = "tutorial-mask";
  const holePadding = 8;
  
  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
      {/* SVG Overlay Mask */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <motion.rect
                x={targetRect.left - holePadding}
                y={targetRect.top - holePadding}
                width={targetRect.width + (holePadding * 2)}
                height={targetRect.height + (holePadding * 2)}
                rx="16"
                fill="black"
                initial={false}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              />
            )}
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0, 0, 0, 0.7)" 
          mask={`url(#${maskId})`}
          className="pointer-events-none"
          style={{ backdropFilter: 'blur(2px)' }}
        />
      </svg>

      {/* Target Interaction Highlight (optional ring) */}
      {targetRect && (
        <motion.div
          initial={false}
          animate={{
            top: targetRect.top - holePadding,
            left: targetRect.left - holePadding,
            width: targetRect.width + (holePadding * 2),
            height: targetRect.height + (holePadding * 2),
          }}
          className="absolute border-2 border-blue-400 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] pointer-events-none"
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 border-4 border-blue-400/30 rounded-2xl scale-125"
          />
        </motion.div>
      )}

      {/* Centered or Contextual Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: tooltipPos.transform
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute pointer-events-auto w-[320px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Module {currentStep + 1} / {totalSteps}</span>
            </div>
            <button onClick={onSkip} className="text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">
              {title}
            </h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onPrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                  currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <ChevronLeft size={16} /> Back
              </button>

              {showNext && (
                <button
                  onClick={onNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
                >
                  {currentStep === totalSteps - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="h-1 bg-slate-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              className="h-full bg-blue-600"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialOverlay;
