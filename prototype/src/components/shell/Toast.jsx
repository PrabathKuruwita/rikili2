import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2Icon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { toastMessage } = useApp();
  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.96,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-pop"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2Icon className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-slate-800">
            {toastMessage}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
