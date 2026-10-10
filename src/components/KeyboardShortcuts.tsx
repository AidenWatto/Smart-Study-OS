import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['?'], description: 'Show / hide keyboard shortcuts' },
  { keys: ['D'], description: 'Go to Dashboard' },
  { keys: ['T'], description: 'Go to Tasks' },
  { keys: ['P'], description: 'Go to Planner' },
  { keys: ['C'], description: 'Go to Calendar' },
  { keys: ['F'], description: 'Go to Focus' },
  { keys: ['N'], description: 'Go to Notes' },
  { keys: ['R'], description: 'Go to Resources' },
  { keys: ['A'], description: 'Go to Analytics' },
  { keys: ['/'], description: 'Go to Reports' },
  { keys: ['S'], description: 'Go to Settings' },
  { keys: ['Esc'], description: 'Close any modal or panel' },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-10 h-10 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary-500" />
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
                {shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-2 border-b border-surface-100 dark:border-surface-800 last:border-0"
                  >
                    <span className="text-sm text-surface-600 dark:text-surface-300">{s.description}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {s.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs font-mono text-surface-700 dark:text-surface-300"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
