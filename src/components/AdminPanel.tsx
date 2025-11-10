import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminPanelProps {
  onNavigate: (page: Page) => void;
}

interface Entry {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
  hostName: string;
  hostType: string;
  category: string;
  status: string;
  uploadedAt: string;
  totalVotes: number;
  juryScore: number;
  overallScore: number;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin is already authenticated
    const savedAuth = localStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, this would be server-side)
    if (adminPassword === 'admin123' || adminPassword) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      fetchEntries();
    } else {
      alert('Invalid password');
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/admin/entries`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (entryId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    setUpdating(entryId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/admin/entries/${entryId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setEntries(entries.map(e => e.id === entryId ? { ...e, status: newStatus } : e));
        if (viewingEntry?.id === entryId) {
          setViewingEntry({ ...viewingEntry, status: newStatus });
        }
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const filteredEntries = filterStatus === 'all'
    ? entries
    : entries.filter(e => e.status === filterStatus);

  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    approved: entries.filter(e => e.status === 'approved').length,
    rejected: entries.filter(e => e.status === 'rejected').length,
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl mb-2">Admin Panel</h1>
            <p className="text-xl text-gray-600">
              Content moderation & management
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm mb-2">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
              >
                Access Admin Panel
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('voting')}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Back to voting page
                </button>
              </div>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="mb-2">Demo Mode: Use any password to access</p>
              <p className="text-xs text-blue-700">In production, this would require secure authentication</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entry Detail View
  if (viewingEntry) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setViewingEntry(null)}
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back to entries
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-2">{viewingEntry.title}</h2>
                  <p className="text-blue-100">by {viewingEntry.hostName}</p>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm ${
                    viewingEntry.status === 'approved'
                      ? 'bg-green-500 text-white'
                      : viewingEntry.status === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {viewingEntry.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Media */}
                <div>
                  <h3 className="text-lg mb-4">Media ({viewingEntry.mediaUrls.length})</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingEntry.mediaUrls.map((url, index) => (
                      <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg mb-4">Entry Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Host:</span>
                      <span>{viewingEntry.hostName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{viewingEntry.hostType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span>{viewingEntry.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{new Date(viewingEntry.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Public Votes:</span>
                      <span>{viewingEntry.totalVotes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jury Score:</span>
                      <span>{viewingEntry.juryScore?.toFixed(1) || 'Not scored'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall Score:</span>
                      <span>{viewingEntry.overallScore?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingEntry.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleUpdateStatus(viewingEntry.id, 'approved')}
                  disabled={updating === viewingEntry.id || viewingEntry.status === 'approved'}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(viewingEntry.id, 'rejected')}
                  disabled={updating === viewingEntry.id || viewingEntry.status === 'rejected'}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(viewingEntry.id, 'pending')}
                  disabled={updating === viewingEntry.id || viewingEntry.status === 'pending'}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Set Pending</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Admin View
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl mb-2">Admin Panel</h1>
            <p className="text-xl text-gray-600">Content Moderation</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchEntries}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('admin_authenticated');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-3xl mb-1 text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending Review</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-3xl mb-1 text-green-700">{stats.approved}</div>
            <div className="text-sm text-green-700">Approved</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-3xl mb-1 text-red-700">{stats.rejected}</div>
            <div className="text-sm text-red-700">Rejected</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Filter:</span>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Entry</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Host</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Status</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Votes</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Score</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Submitted</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading entries...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="line-clamp-2">{entry.title}</div>
                      </td>
                      <td className="px-6 py-4">{entry.hostName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          entry.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : entry.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{entry.totalVotes || 0}</td>
                      <td className="px-6 py-4 text-center">{entry.overallScore?.toFixed(1) || 0}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {new Date(entry.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setViewingEntry(entry)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(entry.id, 'approved')}
                            disabled={updating === entry.id || entry.status === 'approved'}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(entry.id, 'rejected')}
                            disabled={updating === entry.id || entry.status === 'rejected'}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
