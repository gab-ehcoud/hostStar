import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, ThumbsUp, Award } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LeaderboardProps {
  onNavigate: (page: Page, entryId?: string) => void;
}

interface LeaderboardEntry {
  id: string;
  title: string;
  hostName: string;
  hostType: string;
  totalVotes: number;
  juryScore: number;
  overallScore: number;
  mediaUrls: string[];
}

export function Leaderboard({ onNavigate }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [categoryFilter]);

  const fetchLeaderboard = async () => {
    try {
      const url = categoryFilter === 'all'
        ? `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/leaderboard`
        : `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/leaderboard?category=${categoryFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setEntries(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-600" />;
      default:
        return <div className="w-8 h-8 flex items-center justify-center text-gray-500">{rank}</div>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2">Leaderboard</h1>
          <p className="text-xl text-gray-600">
            Top performing hosts ranked by overall score
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Filter by category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="cultural">Cultural & Heritage</option>
              <option value="adventure">Adventure & Trekking</option>
              <option value="culinary">Culinary Experiences</option>
              <option value="wellness">Wellness & Yoga</option>
              <option value="homestay">Homestay & Accommodation</option>
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && entries.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* 2nd Place */}
            <div className="md:order-1 md:mt-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="h-48 relative">
                  {entries[1]?.mediaUrls[0] && (
                    <ImageWithFallback
                      src={entries[1].mediaUrls[0]}
                      alt={entries[1].title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-xl">
                      2
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl mb-1 line-clamp-2">{entries[1]?.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{entries[1]?.hostName}</p>
                  <div className="text-2xl mb-2">{entries[1]?.overallScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="md:order-2">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-2xl overflow-hidden transform md:scale-105">
                <div className="h-56 relative">
                  {entries[0]?.mediaUrls[0] && (
                    <ImageWithFallback
                      src={entries[0].mediaUrls[0]}
                      alt={entries[0].title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <Crown className="w-16 h-16 text-yellow-300" />
                  </div>
                </div>
                <div className="p-6 text-center text-white">
                  <h3 className="text-2xl mb-1 line-clamp-2">{entries[0]?.title}</h3>
                  <p className="text-sm text-yellow-200 mb-3">{entries[0]?.hostName}</p>
                  <div className="text-3xl mb-2">{entries[0]?.overallScore.toFixed(1)}</div>
                  <div className="text-xs text-yellow-200">Overall Score</div>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="md:order-3 md:mt-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="h-48 relative">
                  {entries[2]?.mediaUrls[0] && (
                    <ImageWithFallback
                      src={entries[2].mediaUrls[0]}
                      alt={entries[2].title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xl text-white">
                      3
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl mb-1 line-clamp-2">{entries[2]?.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{entries[2]?.hostName}</p>
                  <div className="text-2xl mb-2">{entries[2]?.overallScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Rank</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Host</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Entry</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Type</th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Votes</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>Jury</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>Score</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Loading leaderboard...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No entries found for this category
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={entry.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          rank <= 3 ? 'bg-orange-50/30' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getRankBadgeClass(rank)}`}>
                            {rank <= 3 ? getRankIcon(rank) : <span>{rank}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                              {entry.hostName[0]}
                            </div>
                            <div>{entry.hostName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="line-clamp-2">{entry.title}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.hostType === 'travel'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {entry.hostType === 'travel' ? 'Travel' : 'Service'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">{entry.totalVotes || 0}</td>
                        <td className="px-6 py-4 text-center">{entry.juryScore?.toFixed(1) || 0}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg">{entry.overallScore.toFixed(1)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => onNavigate('profile', entry.id)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score Legend */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg mb-3 text-blue-900">How Scoring Works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <ThumbsUp className="w-4 h-4" />
                <span>Public Votes (40%)</span>
              </div>
              <p className="text-xs text-blue-700">Each vote counts towards your overall score</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Award className="w-4 h-4" />
                <span>Jury Score (60%)</span>
              </div>
              <p className="text-xs text-blue-700">Expert evaluation of your hosting quality</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Trophy className="w-4 h-4" />
                <span>Overall Score</span>
              </div>
              <p className="text-xs text-blue-700">Combined score determining your rank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
