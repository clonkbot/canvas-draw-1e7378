import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthScreen } from "./components/AuthScreen";
import { Canvas } from "./components/Canvas";
import { Gallery } from "./components/Gallery";
import { Header } from "./components/Header";
import { Palette, ImageIcon } from "lucide-react";

type View = "canvas" | "gallery";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [view, setView] = useState<View>("canvas");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-400 font-mono tracking-wider text-sm">Loading canvas...</span>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <Header />

      {/* View Toggle */}
      <div className="flex justify-center py-4 px-4 border-b border-stone-800/50">
        <div className="flex bg-stone-900 rounded-full p-1 gap-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView("canvas")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
              view === "canvas"
                ? "bg-amber-400 text-stone-900"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Draw</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView("gallery")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
              view === "gallery"
                ? "bg-amber-400 text-stone-900"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gallery</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "canvas" ? (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <Canvas />
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-auto"
            >
              <Gallery />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-stone-800/30">
        <p className="text-stone-600 text-xs font-mono tracking-wide">
          Requested by <span className="text-stone-500">@PauliusX</span> · Built by <span className="text-stone-500">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
