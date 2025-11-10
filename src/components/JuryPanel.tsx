import { useState, useEffect } from 'react';
import { UserCircle, Star, Send, Eye, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface JuryPanelProps {
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
  juryScore: number;
  totalVotes: number;
}

export function JuryPanel({ onNavigate }: JuryPanelProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [juryId, setJuryId] = useState('');
  const [juryName, setJuryName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scoringEntry, setScoringEntry] = useState<Entry | null>(null);
  const [score, setScore] = useState(50);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if jury is already authenticated
    const savedJuryId = localStorage.getItem('jury_id');
    const savedJuryName = localStorage.getItem('jury_name');
    if (savedJuryId && savedJuryName) {
      setJuryId(savedJuryId);
      setJuryName(savedJuryName);
      setIsAuthenticated(true);
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, []);

  const handleJuryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (juryId && juryName) {
      localStorage.setItem('jury_id', juryId);
      localStorage.setItem('jury_name', juryName);
      setIsAuthenticated(true);
      fetchEntries();
    }
  };

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

  const handleSubmitScore = async () => {
    if (!scoringEntry) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/jury/score`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            entryId: scoringEntry.id,
            juryId,
            score,
            feedback,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Score submitted successfully!');
        setScoringEntry(null);
        setScore(50);
        setFeedback('');
        fetchEntries(); // Refresh entries
      } else {
        throw new Error(data.error || 'Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mb-4">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl mb-2">Jury Panel</h1>
            <p className="text-xl text-gray-600">
              Expert scoring for HostStaar entries
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleJuryLogin} className="space-y-6">
              <div>
                <label htmlFor="juryId" className="block text-sm mb-2">
                  Jury ID
                </label>
                <input
                  id="juryId"
                  type="text"
                  required
                  placeholder="Enter your jury ID"
                  value={juryId}
                  onChange={(e) => setJuryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="juryName" className="block text-sm mb-2">
                  Your Name
                </label>
                <input
                  id="juryName"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={juryName}
                  onChange={(e) => setJuryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
              >
                Access Jury Panel
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

            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
              <p className="mb-2">Demo Mode: Use any ID and name to access</p>
              <p className="text-xs text-purple-700">In production, this would require proper authentication</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Scoring Modal
  if (scoringEntry) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6">
              <h2 className="text-2xl mb-2">Score Entry</h2>
              <p className="text-purple-100">{scoringEntry.title}</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Media Preview */}
                <div>
                  <h3 className="text-lg mb-3">Media</h3>
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4">
                    {scoringEntry.mediaUrls[0] && (
                      <ImageWithFallback
                        src={scoringEntry.mediaUrls[0]}
                        alt={scoringEntry.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {scoringEntry.mediaUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {scoringEntry.mediaUrls.slice(1, 4).map((url, index) => (
                        <div key={index} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                          <ImageWithFallback
                            src={url}
                            alt={`Media ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Entry Details */}
                <div>
                  <h3 className="text-lg mb-3">Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Host:</span> {scoringEntry.hostName}
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>{' '}
                      <span className="capitalize">{scoringEntry.hostType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span> {scoringEntry.category}
                    </div>
                    <div>
                      <span className="text-gray-600">Public Votes:</span> {scoringEntry.totalVotes || 0}
                    </div>
                    <div>
                      <span className="text-gray-600">Current Jury Score:</span>{' '}
                      {scoringEntry.juryScore?.toFixed(1) || 'Not scored'}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{scoringEntry.description}</p>
                  </div>
                </div>
              </div>

              {/* Scoring Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-3">
                    Score (0-100): <span className="text-2xl text-purple-600">{score}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    placeholder="Provide constructive feedback for the host..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setScoringEntry(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitScore}
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Score</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entries List
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl mb-2">Jury Panel</h1>
            <p className="text-xl text-gray-600">Welcome, {juryName}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('jury_id');
              localStorage.removeItem('jury_name');
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-lg mb-2">Scoring Guidelines</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="mb-1">Authenticity (25%)</div>
              <div className="text-xs text-gray-600">Genuine hosting experience</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="mb-1">Quality (25%)</div>
              <div className="text-xs text-gray-600">Media and content quality</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="mb-1">Uniqueness (25%)</div>
              <div className="text-xs text-gray-600">Standout offering</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="mb-1">Professionalism (25%)</div>
              <div className="text-xs text-gray-600">Presentation and clarity</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No entries available for scoring</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="h-48 bg-gray-200 relative">
                  {entry.mediaUrls[0] && (
                    <ImageWithFallback
                      src={entry.mediaUrls[0]}
                      alt={entry.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg mb-1 line-clamp-2">{entry.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">by {entry.hostName}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div>Votes: {entry.totalVotes || 0}</div>
                    <div className="flex items-center space-x-1">
                      {entry.juryScore > 0 && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{entry.juryScore.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setScoringEntry(entry)}
                    className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>Score Entry</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
