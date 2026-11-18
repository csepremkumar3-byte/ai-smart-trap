import React, { useState } from 'react';
import { authenticateUser } from '../data/authRoles';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = authenticateUser(username, password);
      setIsSubmitting(false);
      if (res.success) {
        onLogin(res.user);
      } else {
        setError(res.error);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f0] flex items-center justify-center p-4 sm:p-6 font-sans text-[#1c2826]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e2e7df] shadow-lg p-7 sm:p-9 space-y-6">
        {/* Clean Header */}
        <div className="text-center space-y-3">
          <img
            src="/cicr-logo.png"
            alt="ICAR-CICR Logo"
            className="w-16 h-16 rounded-full mx-auto object-contain drop-shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#145334]">
              AI Smart Trap
            </h1>
            <p className="text-xs text-[#5f6e63] mt-0.5 font-medium">
              AI Pink Bollworm Monitoring
            </p>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Clean Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="text-xs font-bold text-[#1c2826] block mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#78887e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#d5ded2] bg-[#fbfcfb] text-xs font-semibold text-[#1c2826] placeholder-[#94a398] focus:outline-none focus:ring-1 focus:ring-[#145334] focus:border-[#145334]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-bold text-[#1c2826] block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#78887e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d5ded2] bg-[#fbfcfb] text-xs font-semibold text-[#1c2826] placeholder-[#94a398] focus:outline-none focus:ring-1 focus:ring-[#145334] focus:border-[#145334]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#145334] hover:bg-[#0f3d26] active:scale-[0.99] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
