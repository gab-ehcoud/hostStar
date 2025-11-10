import { ArrowRight, Star, Trophy, Users, Zap, Heart, Globe } from 'lucide-react';
import type { Page } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1572884907756-1220a4890216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMHRyYXZlbCUyMGd1aWRlfGVufDF8fHx8MTc2Mjc1MzQ4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="India Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-pink-900/70 to-purple-900/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">India's Biggest Host Discovery Contest</span>
          </div>

          <h1 className="text-5xl md:text-7xl mb-6">
            Become India's Next
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              HostStaar
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Showcase your hosting skills, win exciting prizes, and join the AARNA marketplace — 
            India's premier platform for travel experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-2xl hover:shadow-orange-500/50 flex items-center justify-center space-x-2"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('voting')}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30 flex items-center justify-center space-x-2"
            >
              <Trophy className="w-5 h-5" />
              <span>Vote for Hosts</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, label: 'Active Hosts', value: '500+' },
              { icon: Trophy, label: 'Prize Pool', value: '₹10L' },
              { icon: Star, label: 'Public Votes', value: '50K+' },
              { icon: Globe, label: 'Cities', value: '100+' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-2xl mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">How HostStaar Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join India's largest host discovery platform in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Register',
                description: 'Sign up and choose your host type - Travel Guide or Service Provider',
                icon: Users,
                color: 'orange',
              },
              {
                step: 2,
                title: 'Upload',
                description: 'Share your hosting story through photos and videos',
                icon: Zap,
                color: 'pink',
              },
              {
                step: 3,
                title: 'Get Votes',
                description: 'Public votes + Jury scores determine your ranking',
                icon: Heart,
                color: 'purple',
              },
              {
                step: 4,
                title: 'Win & Onboard',
                description: 'Top hosts join AARNA marketplace with exclusive benefits',
                icon: Trophy,
                color: 'yellow',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${item.color}-100 mb-4`}>
                    <Icon className={`w-8 h-8 text-${item.color}-600`} />
                  </div>
                  <div className="mb-2 text-sm text-gray-500">Step {item.step}</div>
                  <h3 className="text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Host Types Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Choose Your Category</h2>
            <p className="text-xl text-gray-600">
              We're looking for India's best hosts across two categories
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Travel Hosts */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
              <div className="h-64 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1595368062405-e4d7840cba14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjB0cmVra2luZyUyMG1vdW50YWluc3xlbnwxfHx8fDE3NjI2NzMxMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Travel Host"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl mb-1">Travel Hosts</h3>
                  <p className="text-sm text-gray-200">Guides, Storytellers, Adventure Leaders</p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500">✓</span>
                    <span>Local tour guides and cultural storytellers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500">✓</span>
                    <span>Trekking and adventure experience leaders</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500">✓</span>
                    <span>Heritage and historical site experts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500">✓</span>
                    <span>Photography and wildlife guides</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Service Hosts */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
              <div className="h-64 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1746549854902-332ec790ac7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGhvc3BpdGFsaXR5JTIwaG9tZXN0YXl8ZW58MXx8fHwxNzYyNzUzNDg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Service Host"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl mb-1">Service Hosts</h3>
                  <p className="text-sm text-gray-200">Homestays, Cafés, Wellness Providers</p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-500">✓</span>
                    <span>Homestay and boutique accommodation owners</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-500">✓</span>
                    <span>Local café and culinary experience hosts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-500">✓</span>
                    <span>Wellness and yoga retreat providers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-pink-500">✓</span>
                    <span>Farm stays and eco-tourism hosts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl mb-6">
            Ready to Become a HostStaar?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of talented hosts competing for recognition and a chance to be featured on AARNA's marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-all shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30 flex items-center justify-center space-x-2"
            >
              <Trophy className="w-5 h-5" />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
