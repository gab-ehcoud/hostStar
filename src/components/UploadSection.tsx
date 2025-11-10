import { useState } from 'react';
import { Upload, Image, X, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User } from '../App';

interface UploadSectionProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UploadSection({ user, onSuccess, onCancel }: UploadSectionProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
  });
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedia = () => {
    if (newMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mediaUrls.length === 0) {
      setError('Please add at least one image or video URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/entries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            mediaUrls,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit entry');
      }

      onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl mb-2">Submit Your Entry</h1>
          <p className="text-xl text-gray-600">
            Share your hosting story with the world
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm mb-2">
                Entry Title *
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="e.g., Heritage Walking Tours in Old Delhi"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm mb-2">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="digital-detox">Digital Detox & Mindfulness</option>
                <option value="healthcare-wellness">Healthcare & Wellness</option>
                <option value="experiences-entertainment">Experiences & Live Entertainment</option>
                <option value="culture-craft">Culture & Craft</option>
                <option value="adventure-exploration">Adventure & Exploration</option>
                <option value="stay-hospitality">Stay & Hospitality</option>
                <option value="culinary-gastronomy">Culinary & Gastronomy</option>
                <option value="photography">Photography</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                placeholder="Tell us about your hosting experience, what makes you unique, and why people should vote for you..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 100 characters. Be descriptive and authentic!
              </p>
            </div>

            {/* Media URLs */}
            <div>
              <label className="block text-sm mb-2">
                Images & Videos *
              </label>
              
              <div className="space-y-3">
                {/* Add Media Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image or video URL (e.g., from Google Drive, Imgur, YouTube)"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedia())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Media Preview */}
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {url.includes('youtube.com') || url.includes('youtu.be') ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-50">
                              <span className="text-xs text-red-600">Video</span>
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Add at least 3 high-quality images or videos showcasing your hosting experience
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm mb-2 text-blue-900">Submission Guidelines</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use clear, high-resolution images and videos</li>
                <li>• Ensure content is authentic and represents your actual hosting experience</li>
                <li>• Entries will be reviewed by our team before appearing on the voting page</li>
                <li>• You can submit multiple entries throughout the contest period</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Entry</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
