import { useState } from "react";
import { motion } from "motion/react";
import { FileText, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { api } from "../services/api";

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { user, token } = await api.auth.login({ email, password });
      onLogin(user, token);
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccess = async (role: "ADMIN" | "USER") => {
    setIsLoading(true);
    setError("");
    try {
      // Ensure data is seeded first
      await api.seed.run();
      const credentials = role === "ADMIN" 
        ? { email: "admin@example.com", password: "password123" }
        : { email: "demo@gmail.com", password: "12341234" };
        
      const { user, token } = await api.auth.login(credentials);
      onLogin(user, token);
    } catch (err: any) {
      setError("Failed to access demo. Please try seeding data first.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
              <FileText className="text-white w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Streamline your <span className="text-blue-400">complaint management</span> workflow.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              An enterprise-grade platform for handling user feedback, resolving issues, and tracking performance with real-time analytics.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Support</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2.5rem] shadow-premium p-10 border border-slate-100">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
              <p className="text-slate-500 mt-2">Enter your credentials or use quick access</p>
            </div>

            <div className="mb-8 space-y-4">
              <button
                onClick={() => handleQuickAccess("ADMIN")}
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    QUICK ACCESS (ADMIN)
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                onClick={() => handleQuickAccess("USER")}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    QUICK ACCESS (USER)
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="relative mt-8 mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Or use credentials</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-600 text-sm font-medium bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
              <p className="text-sm text-slate-500">Demo Environment</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.0.4 • Production Ready</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
