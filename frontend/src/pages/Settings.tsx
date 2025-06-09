import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Bell, Calendar, User, Lock, Globe, Zap, Trash2, Building, MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemeToggle } from '../components/ThemeToggle';
import { useThemeStore } from '../stores/themeStore';
import { CalendarIntegrationService, CalendarConnection } from '../services/calendarIntegration';
import {
  changeAvatar,
  saveProfile,
  saveNotificationSettings,
  saveCompanyDetails,
  connectIntegration,
  updatePassword,
  deleteAccount
} from '../utils/button-actions';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'integrations' | 'account'>('profile');

  // Calendar integration state
  const [calendarConnection, setCalendarConnection] = useState<CalendarConnection | null>(null);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Company form state
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyZip, setCompanyZip] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [summaryEmails, setSummaryEmails] = useState(true);
  const [actionItemReminders, setActionItemReminders] = useState(true);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    document.title = 'Settings | Lemur AI';
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');

      // Load calendar connection status
      loadCalendarConnection();
    }
  }, [user]);

  // Handle URL parameters for direct tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'company', 'notifications', 'integrations', 'account'].includes(tab)) {
      setActiveTab(tab as any);
    }

    // Check for calendar connection success/error
    const calendarSuccess = searchParams.get('calendar_success');
    const calendarError = searchParams.get('calendar_error');

    if (calendarSuccess === 'true') {
      // Reload calendar connection status
      loadCalendarConnection();
      // Remove the parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('calendar_success');
        return newParams;
      });
    }

    if (calendarError === 'true') {
      // Remove the parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('calendar_error');
        return newParams;
      });
    }
  }, [searchParams]);

  // Load calendar connection status
  const loadCalendarConnection = async () => {
    if (!user?.id) return;

    try {
      const connection = await CalendarIntegrationService.checkConnectionStatus(user.id);
      setCalendarConnection(connection);
    } catch (error) {
      console.error('Failed to load calendar connection:', error);
    }
  };

  // Handle Google Calendar connection
  const handleConnectGoogleCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      await CalendarIntegrationService.openCalendarOAuth();
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  // Handle calendar disconnection
  const handleDisconnectCalendar = () => {
    if (!user?.id) return;

    CalendarIntegrationService.disconnectCalendar(user.id);
    setCalendarConnection(prev => prev ? { ...prev, connected: false } : null);
  };

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    setSearchParams({ tab: tabId });
  };



  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Calendar },
    { id: 'account', label: 'Account', icon: Lock },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Account Settings
            </h1>
            <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Manage your account settings, preferences, and company information
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div
                className="rounded-xl p-6 shadow-lg ring-1 backdrop-blur-sm"
                style={{
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          background: isActive ? 'var(--bg-accent)' : 'transparent',
                          color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                          border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                        onClick={() => handleTabChange(tab.id)}
                      >
                        <TabIcon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div
                className="rounded-xl p-8 shadow-lg ring-1 backdrop-blur-sm"
                style={{
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="border-b pb-6" style={{ borderColor: 'var(--border-secondary)' }}>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Profile Settings
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Manage your personal information and account preferences
                    </p>
                  </div>

                  {/* Avatar Section */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Profile Picture
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div
                          className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-transparent"
                          style={{ ringColor: 'var(--border-accent)' }}
                        >
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center text-xl font-bold"
                              style={{
                                background: 'var(--gradient-primary)',
                                color: 'white'
                              }}
                            >
                              {user?.name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Button
                          size="sm"
                          onClick={changeAvatar}
                          className="mb-2"
                        >
                          Change Avatar
                        </Button>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          JPG, GIF or PNG. Maximum file size 1MB. Recommended size 400x400px.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Input
                          label="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Input
                          label="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          type="email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appearance Settings */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                      Appearance
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                          Theme Preference
                        </label>
                        <div className="flex items-center gap-6">
                          <label
                            className="flex items-center gap-3 cursor-pointer rounded-lg p-4 ring-1 transition-all duration-200 hover:scale-[1.02]"
                            style={{
                              background: !isDarkMode ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
                              borderColor: !isDarkMode ? 'var(--border-accent)' : 'var(--border-primary)',
                              color: !isDarkMode ? 'var(--text-accent)' : 'var(--text-secondary)'
                            }}
                          >
                            <input
                              id="theme-light"
                              name="theme"
                              type="radio"
                              checked={!isDarkMode}
                              readOnly
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">Light Mode</span>
                          </label>

                          <label
                            className="flex items-center gap-3 cursor-pointer rounded-lg p-4 ring-1 transition-all duration-200 hover:scale-[1.02]"
                            style={{
                              background: isDarkMode ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
                              borderColor: isDarkMode ? 'var(--border-accent)' : 'var(--border-primary)',
                              color: isDarkMode ? 'var(--text-accent)' : 'var(--text-secondary)'
                            }}
                          >
                            <input
                              id="theme-dark"
                              name="theme"
                              type="radio"
                              checked={isDarkMode}
                              readOnly
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">Dark Mode</span>
                          </label>

                          <div className="ml-4">
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <Button
                      onClick={() => saveProfile(name, email)}
                      className="px-8 py-3"
                    >
                      Save Changes
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'company' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="border-b pb-6" style={{ borderColor: 'var(--border-secondary)' }}>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Company Information
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Manage your company details and business information for proposals and client communications
                    </p>
                  </div>

                  {/* Basic Company Information */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Building className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Basic Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Input
                          label="Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Industry
                        </label>
                        <select
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          className="input w-full"
                        >
                          <option value="">Select your industry</option>
                          <option value="technology">Technology</option>
                          <option value="consulting">IT Consulting</option>
                          <option value="finance">Finance & Banking</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="retail">Retail & E-commerce</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="real-estate">Real Estate</option>
                          <option value="marketing">Marketing & Advertising</option>
                          <option value="legal">Legal Services</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Company Size
                        </label>
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="input w-full"
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees (Startup)</option>
                          <option value="11-50">11-50 employees (Small)</option>
                          <option value="51-200">51-200 employees (Medium)</option>
                          <option value="201-500">201-500 employees (Large)</option>
                          <option value="501-1000">501-1000 employees (Enterprise)</option>
                          <option value="1000+">1000+ employees (Corporation)</option>
                        </select>
                      </div>

                      <div>
                        <Input
                          label="Website"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://www.yourcompany.com"
                          leftIcon={<Globe className="h-4 w-4" />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Phone className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Contact Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Input
                          label="Business Phone"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          leftIcon={<Phone className="h-4 w-4" />}
                        />
                      </div>

                      <div>
                        <Input
                          label="Business Email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="contact@yourcompany.com"
                          leftIcon={<Mail className="h-4 w-4" />}
                          type="email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Business Address
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Input
                          label="Street Address"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="123 Business Street, Suite 100"
                          leftIcon={<MapPin className="h-4 w-4" />}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                          <Input
                            label="City"
                            value={companyCity}
                            onChange={(e) => setCompanyCity(e.target.value)}
                            placeholder="San Francisco"
                          />
                        </div>

                        <div>
                          <Input
                            label="State/Province"
                            value={companyState}
                            onChange={(e) => setCompanyState(e.target.value)}
                            placeholder="California"
                          />
                        </div>

                        <div>
                          <Input
                            label="ZIP/Postal Code"
                            value={companyZip}
                            onChange={(e) => setCompanyZip(e.target.value)}
                            placeholder="94105"
                          />
                        </div>
                      </div>

                      <div>
                        <Input
                          label="Country"
                          value={companyCountry}
                          onChange={(e) => setCompanyCountry(e.target.value)}
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Description */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Building className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Company Description
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                        About Your Company
                      </label>
                      <textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Provide a brief description of your company, services, mission, and what makes you unique. This information will be used in proposals and client communications to showcase your expertise."
                        rows={5}
                        className="input w-full resize-none"
                      />
                      <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        💡 This information will be automatically included in proposals and client communications to establish credibility and showcase your expertise.
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <Button
                      onClick={() => saveCompanyDetails({
                        name: companyName,
                        industry: companyIndustry,
                        size: companySize,
                        website: companyWebsite,
                        phone: companyPhone,
                        email: companyEmail,
                        address: companyAddress,
                        city: companyCity,
                        state: companyState,
                        zip: companyZip,
                        country: companyCountry,
                        description: companyDescription,
                      })}
                      className="px-8 py-3"
                    >
                      Save Company Details
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="border-b pb-6" style={{ borderColor: 'var(--border-secondary)' }}>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Notification Settings
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Customize how and when you receive notifications about meetings and activities
                    </p>
                  </div>

                  {/* Email Notifications */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Bell className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Email Notifications
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start justify-between p-4 rounded-lg ring-1" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Meeting Notifications
                          </h4>
                          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Get notified about upcoming meetings, schedule changes, and meeting invitations
                          </p>
                        </div>
                        <div className="ml-6 flex items-center">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-start justify-between p-4 rounded-lg ring-1" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Meeting Summary Emails
                          </h4>
                          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Receive detailed email summaries with transcripts, action items, and insights after each meeting
                          </p>
                        </div>
                        <div className="ml-6 flex items-center">
                          <input
                            type="checkbox"
                            checked={summaryEmails}
                            onChange={() => setSummaryEmails(!summaryEmails)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-start justify-between p-4 rounded-lg ring-1" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Action Item Reminders
                          </h4>
                          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Get reminded about pending action items and upcoming deadlines to stay on track
                          </p>
                        </div>
                        <div className="ml-6 flex items-center">
                          <input
                            type="checkbox"
                            checked={actionItemReminders}
                            onChange={() => setActionItemReminders(!actionItemReminders)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <Button
                      onClick={() => saveNotificationSettings({ emailNotifications, summaryEmails, actionItemReminders })}
                      className="px-8 py-3"
                    >
                      Save Notification Settings
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'integrations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="border-b pb-6" style={{ borderColor: 'var(--border-secondary)' }}>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Integrations
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Connect your favorite tools and platforms to streamline your workflow
                    </p>
                  </div>

                  {/* Calendar Integrations */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Calendar Integrations
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="flex items-center justify-between p-6 rounded-xl ring-1 transition-all duration-200 hover:scale-[1.01]"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ background: 'var(--gradient-primary)' }}
                          >
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Google Calendar
                              </h4>
                              {calendarConnection?.connected && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {calendarConnection?.connected
                                ? `Connected • Last sync: ${calendarConnection.lastSync?.toLocaleDateString() || 'Never'}`
                                : 'Automatically sync meetings and events with your Google Calendar'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {calendarConnection?.connected ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDisconnectCalendar}
                              className="text-red-600 hover:text-red-700"
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleConnectGoogleCalendar}
                              isLoading={isConnectingCalendar}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between p-6 rounded-xl ring-1 transition-all duration-200 hover:scale-[1.01]"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)' }}
                          >
                            <Globe className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              Microsoft Outlook
                            </h4>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Sync your Outlook calendar and email for seamless integration
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => connectIntegration('Microsoft Outlook')}>
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Platforms */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Meeting Platforms
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="flex items-center justify-between p-6 rounded-xl ring-1 transition-all duration-200 hover:scale-[1.01]"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ background: 'linear-gradient(135deg, #2d8cff 0%, #0066cc 100%)' }}
                          >
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              Zoom
                            </h4>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Automatically join Zoom meetings and capture recordings
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => connectIntegration('Zoom')}>
                          Connect
                        </Button>
                      </div>

                      <div
                        className="flex items-center justify-between p-6 rounded-xl ring-1 transition-all duration-200 hover:scale-[1.01]"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ background: 'linear-gradient(135deg, #6264a7 0%, #464775 100%)' }}
                          >
                            <Globe className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              Microsoft Teams
                            </h4>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Integrate with Teams for meeting transcription and analysis
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => connectIntegration('Microsoft Teams')}>
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="border-b pb-6" style={{ borderColor: 'var(--border-secondary)' }}>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Account Security
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Manage your account security settings and data preferences
                    </p>
                  </div>

                  {/* Password Security */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Password Security
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Input
                          label="Current Password"
                          type="password"
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>

                        <div>
                          <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div
                        className="rounded-lg p-4 ring-1"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Password Requirements
                        </h4>
                        <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• At least 8 characters long</li>
                          <li>• Contains uppercase and lowercase letters</li>
                          <li>• Includes at least one number</li>
                          <li>• Contains at least one special character</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => updatePassword(currentPassword, newPassword)}
                          className="px-6 py-2"
                        >
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <User className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Account Management
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="flex items-center justify-between p-4 rounded-lg ring-1"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <div>
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Export Account Data
                          </h4>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Download a copy of all your meetings, notes, and account information
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Export Data
                        </Button>
                      </div>

                      <div
                        className="flex items-center justify-between p-4 rounded-lg ring-1"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                      >
                        <div>
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Two-Factor Authentication
                          </h4>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div
                    className="rounded-xl p-6 ring-1"
                    style={{
                      background: 'var(--bg-danger-subtle)',
                      borderColor: 'var(--border-danger)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Trash2 className="h-5 w-5" style={{ color: 'var(--text-danger)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-danger)' }}>
                        Danger Zone
                      </h3>
                    </div>

                    <div
                      className="rounded-lg p-4 ring-1"
                      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-danger)' }}
                    >
                      <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Delete Account
                      </h4>
                      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Permanently delete your account and all associated data. This action cannot be undone and will immediately remove access to all meetings, notes, and company information.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={deleteAccount}
                        style={{
                          borderColor: 'var(--border-danger)',
                          color: 'var(--text-danger)',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-danger-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};