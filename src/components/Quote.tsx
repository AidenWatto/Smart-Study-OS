import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const quotes = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

export default function DailyQuote() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % quotes.length;
    setIndex(dayIndex);
  }, []);

  const next = () => setIndex(prev => (prev + 1) % quotes.length);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-50/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          onClick={next}
        >
          <Quote className="w-4 h-4 text-primary-500 shrink-0" />
          <div className="max-w-xs">
            <p className="text-xs text-surface-700 dark:text-surface-300 truncate">{quotes[index].text}</p>
            <p className="text-[10px] text-surface-400 truncate">{quotes[index].author}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
