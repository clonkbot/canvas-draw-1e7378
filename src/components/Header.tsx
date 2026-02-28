import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { Brush, LogOut } from "lucide-react";

export function Header() {
  const { signOut } = useAuthActions();

  return (
    <header className="bg-stone-900/80 backdrop-blur-sm border-b border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Brush className="w-5 h-5 sm:w-6 sm:h-6 text-stone-900" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-100 tracking-tight">
            Canvas<span className="text-amber-400">Draw</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-stone-500 font-mono -mt-0.5 hidden sm:block">Real-time drawing</p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signOut()}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl text-stone-300 hover:text-stone-100 transition-all text-sm"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </motion.button>
    </header>
  );
}
