import { useState, useEffect } from 'react';
import { Heart, ThumbsUp, Eye, Filter, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User, Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VotingPageProps {
  user: User | null;
  onNavigate: (page: Page, entryId?: string) => void;
}

interface Entry {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrls: string[];
  category: string;
  totalVotes: number;
  juryScore: number;
  overallScore: number;
  hostName: string;
  hostType: string;
}

export function VotingPage({ user, onNavigate }: VotingPageProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedEntries, setVotedEntries] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [votingEntry, setVotingEntry] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
    loadVotedEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, categoryFilter, searchQuery]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/entries`,
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

  const loadVotedEntries = () => {
    const saved = localStorage.getItem('voted_entries');
    if (saved) {
      try {
        setVotedEntries(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error('Error loading voted entries:', error);
      }
    }
  };

  const saveVotedEntry = (entryId: string) => {
    const updated = new Set(votedEntries);
    updated.add(entryId);
    setVotedEntries(updated);
    localStorage.setItem('voted_entries', JSON.stringify(Array.from(updated)));
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.hostName.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  };

  const handleVote = async (entryId: string) => {
    if (!user) {
      alert('Please login to vote!');
      onNavigate('login');
      return;
    }

    if (votedEntries.has(entryId)) {
      alert('You have already voted for this entry!');
      return;
    }

    setVotingEntry(entryId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/votes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            entryId,
            voterId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        saveVotedEntry(entryId);
        // Update the entry's vote count locally
        setEntries(entries.map(e =>
          e.id === entryId ? { ...e, totalVotes: data.totalVotes } : e
        ));
      } else {
        throw new Error(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert(error instanceof Error ? error.message : 'Failed to vote. Please try again.');
    } finally {
      setVotingEntry(null);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'cultural', label: 'Cultural & Heritage' },
    { value: 'adventure', label: 'Adventure & Trekking' },
    { value: 'culinary', label: 'Culinary Experiences' },
    { value: 'wellness', label: 'Wellness & Yoga' },
    { value: 'homestay', label: 'Homestay & Accommodation' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">Vote for Your Favorite Hosts</h1>
          <p className="text-xl text-gray-600">
            Help India's best hosts shine by casting your vote
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, host name, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredEntries.length} of {entries.length} entries</span>
            <span>You've voted for {votedEntries.size} entries</span>
          </div>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading entries...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl mb-2 text-gray-600">No entries found</h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back soon for new entries!'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => {
              const hasVoted = votedEntries.has(entry.id);
              const isVoting = votingEntry === entry.id;

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gray-200">
                    {entry.mediaUrls[0] && (
                      <ImageWithFallback
                        src={entry.mediaUrls[0]}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        entry.hostType === 'travel'
                          ? 'bg-orange-500 text-white'
                          : 'bg-pink-500 text-white'
                      }`}>
                        {entry.hostType === 'travel' ? '🧭 Travel' : '🏠 Service'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl mb-2 line-clamp-2">{entry.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">by {entry.hostName}</p>
                    <p className="text-gray-700 mb-4 line-clamp-3">{entry.description}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{entry.totalVotes || 0} votes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Score: {entry.overallScore?.toFixed(1) || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('profile', entry.id)}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleVote(entry.id)}
                        disabled={hasVoted || isVoting}
                        className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                          hasVoted
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600'
                        }`}
                      >
                        {isVoting ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : hasVoted ? (
                          <>
                            <Heart className="w-4 h-4 fill-current" />
                            <span>Voted</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            <span>Vote</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
