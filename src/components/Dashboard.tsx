import { useState, useEffect } from 'react';
import { Upload, Trophy, TrendingUp, Award, Plus, Eye, ThumbsUp } from 'lucide-react';
import { UploadSection } from './UploadSection';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User, Page } from '../App';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page, entryId?: string) => void;
}

interface Entry {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
  totalVotes: number;
  juryScore: number;
  overallScore: number;
  status: string;
  uploadedAt: string;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalVotes: 0,
    averageScore: 0,
    rank: 0,
  });

  useEffect(() => {
    fetchEntries();
  }, [user.id]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/users/${user.id}/entries`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEntries(data.entries);
        
        // Calculate stats
        const totalVotes = data.entries.reduce((sum: number, e: Entry) => sum + (e.totalVotes || 0), 0);
        const totalScore = data.entries.reduce((sum: number, e: Entry) => sum + (e.overallScore || 0), 0);
        const averageScore = data.entries.length > 0 ? totalScore / data.entries.length : 0;

        setStats({
          totalEntries: data.entries.length,
          totalVotes,
          averageScore: Math.round(averageScore * 10) / 10,
          rank: 0, // Would need to fetch from leaderboard
        });
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchEntries();
  };

  if (showUpload) {
    return (
      <UploadSection
        user={user}
        onSuccess={handleUploadSuccess}
        onCancel={() => setShowUpload(false)}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-xl text-gray-600 capitalize">
            {user.hostType} Host Dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Upload className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-3xl mb-1">{stats.totalEntries}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ThumbsUp className="w-8 h-8 text-pink-500" />
            </div>
            <div className="text-3xl mb-1">{stats.totalVotes}</div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl mb-1">{stats.averageScore}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-3xl mb-1">-</div>
            <div className="text-sm text-gray-600">Your Rank</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 rounded-2xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-xl hover:shadow-2xl text-left"
          >
            <Plus className="w-12 h-12 mb-4" />
            <h3 className="text-2xl mb-2">Submit New Entry</h3>
            <p className="text-white/90">Upload your hosting story and compete for votes</p>
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="bg-white border-2 border-gray-200 p-8 rounded-2xl hover:border-orange-300 hover:bg-orange-50 transition-all shadow-lg text-left"
          >
            <Trophy className="w-12 h-12 mb-4 text-yellow-500" />
            <h3 className="text-2xl mb-2">View Leaderboard</h3>
            <p className="text-gray-600">See where you stand among other hosts</p>
          </button>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Your Submissions</h2>
            <button
              onClick={fetchEntries}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading your entries...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl mb-2 text-gray-600">No entries yet</h3>
              <p className="text-gray-500 mb-6">
                Submit your first entry to start competing!
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                Upload Your Story
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl">{entry.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            entry.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : entry.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{entry.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{entry.totalVotes || 0} votes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>Jury: {entry.juryScore?.toFixed(1) || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4" />
                          <span>Score: {entry.overallScore?.toFixed(1) || 0}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('profile', entry.id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
