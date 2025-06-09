import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, BarChart, Calendar, Bell, ChevronDown, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils/cn';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { success } = useToastStore();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart className="h-5 w-5" /> },
    { path: '/meetings', label: 'Meetings', icon: <Calendar className="h-5 w-5" /> },
    { path: '/clients', label: 'Clients', icon: <Users className="h-5 w-5" /> },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeProfile = () => setIsProfileOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    success('Logged Out', 'You have been successfully logged out.');
    navigate('/');
    closeProfile();
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300"
      style={{
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'var(--backdrop-blur)'
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Logo variant="default" size="md" />
        </div>

        {isAuthenticated && (
          <>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive(item.path)
                        ? 'shadow-md border backdrop-filter backdrop-blur-sm'
                        : 'hover:shadow-sm transition-all duration-200'
                    )}
                    style={{
                      background: isActive(item.path) ? 'var(--bg-accent)' : 'transparent',
                      color: isActive(item.path) ? 'var(--text-accent)' : 'var(--text-secondary)',
                      borderColor: isActive(item.path) ? 'var(--border-accent)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <div className="relative ml-3">
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-medium md:block" style={{ color: 'var(--text-secondary)' }}>
                    {user?.name}
                  </span>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full ring-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 backdrop-filter backdrop-blur-sm"
                    style={{
                      background: 'var(--bg-accent)',
                      color: 'var(--text-primary)',
                      ringColor: 'var(--border-accent)'
                    }}
                    onClick={toggleProfile}
                  >
                    {user?.name?.[0] || <User className="h-5 w-5" />}
                  </button>
                </div>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={closeProfile}
                      />

                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                        style={{
                          background: 'var(--bg-primary)',
                          borderColor: 'var(--border-secondary)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <div className="p-6">
                          {/* User Info Header */}
                          <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold"
                              style={{
                                background: 'var(--bg-accent)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              {user?.name?.[0] || <User className="h-6 w-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                {user?.name || 'User'}
                              </p>
                              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                {user?.email || 'user@example.com'}
                              </p>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-4 space-y-1">
                            <button
                              onClick={() => {
                                navigate('/settings?tab=account');
                                closeProfile();
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                color: 'var(--text-secondary)',
                                background: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                            >
                              <Settings className="h-4 w-4" />
                              Account Settings
                            </button>

                            <button
                              onClick={() => {
                                // Navigate to profile section of settings
                                navigate('/settings?tab=profile');
                                closeProfile();
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                color: 'var(--text-secondary)',
                                background: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                            >
                              <User className="h-4 w-4" />
                              Profile
                            </button>

                            <button
                              onClick={() => {
                                // Navigate to notifications section of settings
                                navigate('/settings?tab=notifications');
                                closeProfile();
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                color: 'var(--text-secondary)',
                                background: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                            >
                              <Bell className="h-4 w-4" />
                              Notifications
                            </button>
                          </div>

                          {/* Logout Button */}
                          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                color: 'var(--text-danger)',
                                background: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-danger-subtle)';
                                e.currentTarget.style.color = 'var(--text-danger)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-danger)';
                              }}
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="ml-2 block rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 md:hidden"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="btn btn-outline hidden sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="btn btn-primary hidden sm:inline-flex"
            >
              Sign up
            </Link>

            {/* Mobile menu button for non-authenticated users */}
            <button
              className="ml-2 block rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 sm:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu for authenticated users */}
      {isMenuOpen && isAuthenticated && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium',
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                onClick={closeMenu}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu for non-authenticated users */}
      {isMenuOpen && !isAuthenticated && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={closeMenu}
            >
              <User className="h-5 w-5" />
              Log in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={closeMenu}
            >
              <User className="h-5 w-5" />
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};