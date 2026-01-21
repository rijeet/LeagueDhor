'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../services/auth.service';
import { isTokenExpired } from '../../utils/token';

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authService = new AuthService();
      const token = authService.getAccessToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, try refresh
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          const tokens = await authService.refreshUserToken() || await authService.refreshAdminToken();
          if (!tokens) {
            router.push('/login');
            return;
          }
        } else {
          router.push('/login');
          return;
        }
      }
      
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    const authService = new AuthService();
    authService.logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#DC143C] to-[#8B0000] bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-sm text-gray-400">
            Your anonymous identity — hidden in the shadows
          </p>
        </div>

        <div className="bg-[#0a0a0a] border-2 border-[#DC143C]/30 rounded-lg shadow-2xl shadow-[#DC143C]/10 p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-300">Account Settings</h2>
              <p className="text-gray-400 mb-4">Manage your account settings and preferences.</p>
            </div>
            <div className="pt-6 border-t border-[#2a2a2a]">
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-[#DC143C] to-[#8B0000] hover:from-[#FF1744] hover:to-[#DC143C] text-white rounded-md font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#DC143C]/30"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🚪</span>
                  <span>Logout</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
