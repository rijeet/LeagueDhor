'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '../../services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authService = new AuthService();
      await authService.login({ email, password });
      // Set flag to show popup after login
      localStorage.setItem('showPopupAfterLogin', 'true');
      // Dispatch custom event to trigger popup immediately
      window.dispatchEvent(new Event('showPopupAfterLogin'));
      // Redirect to the intended page or home
      router.push(redirect || '/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#DC143C] to-[#8B0000] bg-clip-text text-transparent">
            Login
          </h1>
          <p className="text-sm text-gray-400">
            Enter the shadows — your identity remains hidden
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border-2 border-[#DC143C]/30 rounded-lg shadow-2xl shadow-[#DC143C]/10 p-8 space-y-6 backdrop-blur-sm">
          {error && (
            <div className="bg-[#8B0000]/20 border-2 border-[#DC143C] text-[#FF6B6B] px-4 py-3 rounded-md backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#DC143C] transition-colors cursor-pointer focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#DC143C] to-[#8B0000] text-white font-bold rounded-md hover:from-[#FF1744] hover:to-[#DC143C] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#DC143C]/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span>
                <span>Entering...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>⚔</span>
                <span>Enter</span>
              </span>
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="text-[#DC143C] hover:text-[#FF1744] font-semibold hover:underline transition-colors">
              Join the cause
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
