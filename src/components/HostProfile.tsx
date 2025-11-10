import { useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, Award, Trophy, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HostProfileProps {
  entryId: string;
  onNavigate: (page: Page) => void;
}

interface EntryDetail {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrls: string[];
  category: string;
  totalVotes: number;
  juryScore: number;
  overallScore: number;
  status: string;
  uploadedAt: string;
  hostName: string;
  hostType: string;
  hostEmail: string;
}

export function HostProfile({ entryId, onNavigate }: HostProfileProps) {
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);

  useEffect(() => {
    fetchEntry();
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/entries/${entryId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEntry(data.entry);
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading host profile...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Entry not found</h2>
          <button
            onClick={() => onNavigate('voting')}
            className="text-orange-600 hover:text-orange-700"
          >
            Return to voting page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('voting')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Voting</span>
        </button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Media & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Media */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {entry.mediaUrls[selectedMedia] && (
                  <ImageWithFallback
                    src={entry.mediaUrls[selectedMedia]}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Media Thumbnails */}
              {entry.mediaUrls.length > 1 && (
                <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                  {entry.mediaUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMedia(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedMedia === index
                          ? 'border-orange-500 scale-105'
                          : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ImageWithFallback
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl">{entry.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  entry.hostType === 'travel'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {entry.hostType === 'travel' ? '🧭 Travel Host' : '🏠 Service Host'}
                </span>
              </div>

              <div className="mb-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {entry.category}
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{entry.description}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(entry.uploadedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Host Info */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl mb-4">Performance</h3>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-600">Overall Score</span>
                    </div>
                  </div>
                  <div className="text-3xl text-orange-600">{entry.overallScore.toFixed(1)}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-5 h-5 text-pink-600" />
                      <span className="text-sm text-gray-600">Public Votes</span>
                    </div>
                  </div>
                  <div className="text-2xl">{entry.totalVotes || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">40% weightage</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Jury Score</span>
                    </div>
                  </div>
                  <div className="text-2xl">{entry.juryScore?.toFixed(1) || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">60% weightage</div>
                </div>
              </div>
            </div>

            {/* Host Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl mb-4">Host Information</h3>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl">
                  {entry.hostName[0]}
                </div>
                <div>
                  <h4 className="text-lg">{entry.hostName}</h4>
                  <p className="text-sm text-gray-600 capitalize">{entry.hostType} Host</p>
                </div>
              </div>

              {entry.hostEmail && (
                <div className="flex items-center space-x-3 text-gray-600 mb-3">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{entry.hostEmail}</span>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  Want to connect with this host? Vote for them and they'll be featured on the AARNA marketplace!
                </p>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl mb-3">Support This Host</h3>
              <p className="text-sm text-white/90 mb-4">
                Cast your vote to help {entry.hostName} climb the leaderboard and join AARNA's marketplace
              </p>
              <button
                onClick={() => onNavigate('voting')}
                className="w-full py-3 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Vote Now</span>
              </button>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl mb-3">Share This Profile</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help spread the word about this amazing host
              </p>
              <button className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                <ExternalLink className="w-5 h-5" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
