import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { Brush, Mail, Lock, User, Sparkles } from "lucide-react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not sign in as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 45, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-rose-500/10 via-transparent to-transparent rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-4">
            <Brush className="w-10 h-10 text-stone-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-100 tracking-tight">
            Canvas<span className="text-amber-400">Draw</span>
          </h1>
          <p className="text-stone-500 mt-2 font-mono text-sm">Create. Share. Inspire.</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl"
        >
          <h2 className="text-xl font-semibold text-stone-100 mb-6 text-center">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="w-full bg-stone-800 border border-stone-700 rounded-xl py-3 sm:py-3.5 pl-12 pr-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl py-3 sm:py-3.5 pl-12 pr-4 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm text-center py-2"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 font-semibold py-3 sm:py-3.5 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-stone-700" />
            <span className="text-stone-500 text-sm">or</span>
            <div className="flex-1 h-px bg-stone-700" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full mt-6 bg-stone-800 border border-stone-700 text-stone-300 font-medium py-3 sm:py-3.5 rounded-xl hover:bg-stone-750 hover:border-stone-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <User className="w-5 h-5" />
            Continue as Guest
          </motion.button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-stone-400 hover:text-amber-400 text-sm transition-colors"
            >
              {flow === "signIn" ? (
                <>Don't have an account? <span className="font-medium text-amber-400">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-medium text-amber-400">Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>

        {/* Features hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 text-stone-500 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Real-time sync
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Community gallery
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
