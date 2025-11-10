import { Menu, X, Home, Trophy, Users, LogOut, LayoutDashboard, UserCircle, Shield } from 'lucide-react';
import { useState } from 'react';
import type { User, Page } from '../App';

interface NavigationProps {
  user: User | null;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Navigation({ user, currentPage, onNavigate, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { page: 'voting' as Page, label: 'Vote', icon: Users },
    { page: 'leaderboard' as Page, label: 'Leaderboard', icon: Trophy },
  ];

  if (user) {
    navItems.unshift({ page: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard });
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">HostStaar India</h1>
              <p className="text-xs text-gray-500">Powered by AARNA</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentPage === item.page
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user ? (
              <div className="flex items-center space-x-4 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.hostType} Host</p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Login
              </button>
            )}

            {/* Admin/Jury Access */}
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
              <button
                onClick={() => onNavigate('jury')}
                className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                title="Jury Panel"
              >
                <UserCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                title="Admin Panel"
              >
                <Shield className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === item.page
                        ? 'bg-orange-100 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {user ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.hostType} Host</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Login
                </button>
              )}

              <div className="pt-2 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    onNavigate('jury');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Jury Panel</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
