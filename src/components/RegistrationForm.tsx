import { useState } from 'react';
import { UserCircle, Phone, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Page, User as UserType } from '../App';

interface RegistrationFormProps {
  onNavigate: (page: Page) => void;
  onSuccess: (user: UserType) => void;
}

export function RegistrationForm({ onNavigate, onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    hostType: '' as 'digital-detox' | 'healthcare-wellness' | 'experiences-entertainment' | 'culture-craft' | 'adventure-exploration' | 'stay-hospitality' | 'culinary-gastronomy' | 'photography' | 'travel' | 'service' | '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90e9685c/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onSuccess(data.user);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2">Join HostStar India</h1>
          <p className="text-xl text-gray-600">
            Register to showcase your hosting talent
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Host Type Selection */}
            <div>
              <label className="block text-sm mb-3">Select Your Host Category *</label>
              <div className="space-y-3">
                <select
                  required
                  value={formData.hostType}
                  onChange={(e) => setFormData({ ...formData, hostType: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Choose your category...</option>
                  <option value="digital-detox">Digital Detox & Mindfulness</option>
                  <option value="healthcare-wellness">Healthcare & Wellness</option>
                  <option value="experiences-entertainment">Experiences & Live Entertainment</option>
                  <option value="culture-craft">Culture & Craft</option>
                  <option value="adventure-exploration">Adventure & Exploration</option>
                  <option value="stay-hospitality">Stay & Hospitality</option>
                  <option value="culinary-gastronomy">Culinary & Gastronomy</option>
                  <option value="photography">Photography</option>
                </select>
                
                {formData.hostType && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Category Details:</h4>
                    {formData.hostType === 'digital-detox' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Nature immersion stays, Silent meditation retreats, Mindfulness day experiences</p>
                        <p><strong>Service Providers:</strong> Yoga instructors, Meditation coaches, Breathwork facilitators</p>
                      </div>
                    )}
                    {formData.hostType === 'healthcare-wellness' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Fitness retreats, Holistic wellness stays, Ayurvedic & naturopathy centers, Spas & therapeutic nutrition focus</p>
                        <p><strong>Service Providers:</strong> Personal trainers, Nutritionists, Wellness consultants, Therapists</p>
                      </div>
                    )}
                    {formData.hostType === 'experiences-entertainment' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Parties & event spaces, Festival grounds, Music venues</p>
                        <p><strong>Service Providers:</strong> DJs, Event planners, Sound & light technicians</p>
                      </div>
                    )}
                    {formData.hostType === 'culture-craft' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Traditional cooking classes, Handicraft workshops, Folk art centers</p>
                        <p><strong>Service Providers:</strong> Local artisans, Culinary experts, Cultural historians</p>
                      </div>
                    )}
                    {formData.hostType === 'adventure-exploration' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Trekking & hiking guides, Camp organizers, Rafting & diving instructors, Wildlife photographers</p>
                        <p><strong>Service Providers:</strong> Adventure guides, Naturalists, Safety experts, Equipment rental providers</p>
                      </div>
                    )}
                    {formData.hostType === 'stay-hospitality' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Homestays & farmstays, Boutique hotels, Houseboats, Heritage homes</p>
                        <p><strong>Service Providers:</strong> Property managers, Hospitality trainers, Local hosts</p>
                      </div>
                    )}
                    {formData.hostType === 'culinary-gastronomy' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Themed dining experiences, Food & beverage experiences, Culinary retreats</p>
                        <p><strong>Service Providers:</strong> Chefs, Sommeliers, Mixologists, Culinary instructors</p>
                      </div>
                    )}
                    {formData.hostType === 'photography' && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Hosts:</strong> Photography workshops and locations</p>
                        <p><strong>Service Providers:</strong> Professional photographers, Videographers & content creators, Travel writers & curators</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You'll receive OTP on this number
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-orange-600 hover:text-orange-700"
              >
                Login here
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg mb-2 text-blue-900">What Happens Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span>1.</span>
              <span>Complete your profile and upload your hosting story</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>2.</span>
              <span>Get votes from the public and scores from our expert jury</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>3.</span>
              <span>Climb the leaderboard and win exciting prizes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>4.</span>
              <span>Top performers get onboarded to AARNA marketplace</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
