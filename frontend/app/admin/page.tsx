'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService, Crime } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { VerificationBadge } from '../../components/VerificationBadge/VerificationBadge';
import { isTokenExpired } from '../../utils/token';
import { formatDate } from '../../utils/date';

export default function AdminDashboard() {
  const router = useRouter();
  const authService = new AuthService();
  const adminService = new AdminService();

  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getAccessToken();
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, try refresh
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          // Try admin refresh first for admin pages
          const tokens = await authService.refreshAdminToken() || await authService.refreshUserToken();
          if (!tokens) {
            router.push('/admin/login');
            return;
          }
        } else {
          router.push('/admin/login');
          return;
        }
      }
      
      loadCrimes();
    };

    checkAuth();
  }, [router]);

  const loadCrimes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAllCrimes();
      setCrimes(data);
    } catch (err: any) {
      console.error('Failed to load crimes:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load crimes');
      if (err?.status === 401 || err?.status === 403) {
        authService.logout();
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crime? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await adminService.deleteCrime(id);
      setCrimes(crimes.filter(crime => crime.id !== id));
    } catch (err: any) {
      console.error('Failed to delete crime:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to delete crime');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Crime['verificationStatus']) => {
    try {
      setUpdatingId(id);
      const updated = await adminService.updateCrimeStatus(id, newStatus);
      setCrimes(crimes.map(crime => crime.id === id ? updated : crime));
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crimes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No crimes found
                  </td>
                </tr>
              ) : (
                crimes.map((crime) => (
                  <tr key={crime.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {crime.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {crime.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={crime.verificationStatus}
                        onChange={(e) => handleStatusChange(crime.id, e.target.value as Crime['verificationStatus'])}
                        disabled={updatingId === crime.id}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="UNVERIFIED">UNVERIFIED</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="FALSE">FALSE</option>
                        <option value="AI_GENERATED">AI_GENERATED</option>
                      </select>
                      {updatingId === crime.id && (
                        <span className="ml-2 text-xs text-gray-500">Updating...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(crime.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(crime.id)}
                        disabled={deletingId === crime.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === crime.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total: {crimes.length} crime(s)
      </div>
    </main>
  );
}
