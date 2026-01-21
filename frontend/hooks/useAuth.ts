import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/auth.service';

interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo, requireAuth = true } = options;
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getAccessToken();
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          if (requireAuth && redirectTo) {
            router.push(redirectTo);
          }
          return;
        }

        // Check if token is expired by decoding it
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            // Token is expired, try to refresh
            console.log('Token expired, attempting refresh...');
            const refreshToken = authService.getRefreshToken();
            
            if (refreshToken) {
              // Try to refresh user token first, then admin
              const userTokens = await authService.refreshUserToken();
              if (userTokens) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
              }
              
              const adminTokens = await authService.refreshAdminToken();
              if (adminTokens) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
              }
            }
            
            // Refresh failed, logout
            authService.logout();
            setIsAuthenticated(false);
            setIsLoading(false);
            if (requireAuth && redirectTo) {
              router.push(redirectTo);
            }
            return;
          }
          
          // Token is valid
          setIsAuthenticated(true);
        } catch (error) {
          // Token is malformed
          console.error('Invalid token format:', error);
          authService.logout();
          setIsAuthenticated(false);
          if (requireAuth && redirectTo) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (requireAuth && redirectTo) {
          router.push(redirectTo);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, requireAuth]);

  return { isAuthenticated, isLoading, authService };
}
