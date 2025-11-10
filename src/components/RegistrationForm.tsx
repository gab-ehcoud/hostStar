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
    hostType: 'travel' as 'travel' | 'service',
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
          <h1 className="text-4xl mb-2">Join HostStaar India</h1>
          <p className="text-xl text-gray-600">
            Register to showcase your hosting talent
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Host Type Selection */}
            <div>
              <label className="block text-sm mb-3">Select Your Host Category *</label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hostType: 'travel' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.hostType === 'travel'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">🧭</div>
                  <div className="text-lg mb-1">Travel Host</div>
                  <div className="text-sm text-gray-600">
                    Guides, Storytellers, Adventure Leaders
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hostType: 'service' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.hostType === 'service'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">🏠</div>
                  <div className="text-lg mb-1">Service Host</div>
                  <div className="text-sm text-gray-600">
                    Homestays, Cafés, Wellness Providers
                  </div>
                </button>
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
