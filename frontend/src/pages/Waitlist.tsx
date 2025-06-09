import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Users, CheckCircle, ArrowLeft, Zap, Brain, Calendar, FileText, Repeat, GitMerge } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemeToggle } from '../components/ThemeToggle';
import { cn } from '../utils/cn';

interface WaitlistData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  currentTools: string;
  painPoints: string[];
  interests: string[];
}

export const Waitlist: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<WaitlistData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    teamSize: '',
    currentTools: '',
    painPoints: [],
    interests: []
  });

  const painPointOptions = [
    'Manual meeting notes and follow-ups',
    'Lost opportunities due to poor follow-up',
    'Inconsistent proposal creation',
    'Difficulty tracking client relationships',
    'Time-consuming administrative tasks',
    'Lack of meeting insights and analytics'
  ];

  const interestOptions = [
    'AI-powered meeting notes',
    'Automated follow-up emails',
    'Smart proposal generation',
    'CRM integration',
    'Client relationship insights',
    'Meeting analytics and reporting'
  ];

  const teamSizeOptions = [
    'Just me (Solo consultant)',
    '2-5 people',
    '6-15 people',
    '16-50 people',
    '50+ people'
  ];

  const handleInputChange = (field: keyof WaitlistData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'painPoints' | 'interests', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = () => {
    console.log('Waitlist submission:', formData);
    setIsSubmitted(true);
  };

  const canProceedToStep2 = formData.firstName && formData.lastName && formData.email && formData.company;
  const canSubmit = canProceedToStep2 && formData.role && formData.teamSize;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300"
        style={{
          background: 'var(--glass-bg)',
          borderBottom: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-md)'
        }}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="xl" variant="default" />
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link to="/" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {!isSubmitted ? (
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Product Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:sticky lg:top-24"
              >
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
                  style={{
                    background: 'var(--gradient-secondary)',
                    border: '1px solid var(--border-accent)'
                  }}>
                  <Sparkles className="h-4 w-4" style={{ color: 'var(--text-accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-accent)' }}>
                    Early Access Program
                  </span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                  Transform Your IT Consulting Business with AI
                </h1>

                <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Join the waitlist for the complete business automation platform that handles everything 
                  from your first client meeting to your first proposal.
                </p>

                {/* Key Features */}
                <div className="space-y-6 mb-8">
                  {[
                    {
                      icon: Brain,
                      title: 'Smart Note-Taking',
                      description: 'AI joins your calls, takes structured notes, and syncs with your CRM automatically.'
                    },
                    {
                      icon: Zap,
                      title: 'Action-Oriented Insights',
                      description: 'Extract key points and generate contextual action items, follow-ups, and briefs.'
                    },
                    {
                      icon: Repeat,
                      title: 'Personalized Follow-Ups',
                      description: 'Craft emails using meeting context, past projects, and proven case studies.'
                    },
                    {
                      icon: FileText,
                      title: 'Auto-Generated Proposals',
                      description: 'Create tailored scopes of work and proposals backed by your project history.'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 p-2 rounded-lg" style={{ background: 'var(--bg-accent)' }}>
                        <feature.icon className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {feature.title}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Social Proof */}
                <div className="p-6 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Join 2,847+ IT Consultants
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Forward-thinking consultants are already on the waitlist. Get exclusive early access, 
                    shape the product roadmap, and transform your business before your competitors.
                  </p>
                </div>
              </motion.div>

              {/* Right Side - Waitlist Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:mt-12"
              >
                <div className="card p-8">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className={cn(
                      "h-2 flex-1 rounded-full transition-all duration-300",
                      step >= 1 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                    )} />
                    <div className={cn(
                      "h-2 flex-1 rounded-full transition-all duration-300",
                      step >= 2 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                    )} />
                    <div className={cn(
                      "h-2 flex-1 rounded-full transition-all duration-300",
                      step >= 3 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                    )} />
                  </div>

                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Get Early Access
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Tell us about yourself and your business
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name *"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="John"
                        />
                        <Input
                          label="Last Name *"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Doe"
                        />
                      </div>

                      <Input
                        label="Email Address *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@company.com"
                      />

                      <Input
                        label="Company Name *"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your IT Consulting Firm"
                      />

                      <Button
                        onClick={() => setStep(2)}
                        disabled={!canProceedToStep2}
                        className="w-full"
                        size="lg"
                      >
                        Continue
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          About Your Role
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Help us understand your business better
                        </p>
                      </div>

                      <Input
                        label="Your Role *"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        placeholder="e.g., Founder, CTO, Senior Consultant"
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Team Size *
                        </label>
                        <div className="space-y-2">
                          {teamSizeOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleInputChange('teamSize', option)}
                              className={cn(
                                "w-full p-3 rounded-lg border text-left transition-all duration-200",
                                formData.teamSize === option
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              )}
                              style={{
                                background: formData.teamSize === option ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                          Back
                        </Button>
                        <Button
                          onClick={() => setStep(3)}
                          disabled={!formData.role || !formData.teamSize}
                          className="flex-1"
                        >
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Almost Done!
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Help us prioritize features for you
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                          Biggest Challenge (select all that apply)
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {painPointOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleArrayToggle('painPoints', option)}
                              className={cn(
                                "w-full p-3 rounded-lg border text-left transition-all duration-200 flex items-center gap-3",
                                formData.painPoints.includes(option)
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              )}
                              style={{
                                background: formData.painPoints.includes(option) ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                              }}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center",
                                formData.painPoints.includes(option)
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300 dark:border-gray-600"
                              )}>
                                {formData.painPoints.includes(option) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm">{option}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                          Back
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className="flex-1"
                          leftIcon={<Zap className="h-4 w-4" />}
                        >
                          Join Waitlist
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-12"
            >
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Welcome to the Future! 🚀
                </h1>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  You're now on the Lemur AI waitlist
                </p>
              </div>
              
              <div className="space-y-4 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                <p>✨ You'll be among the first to access our AI-powered platform</p>
                <p>📧 We'll send you exclusive updates and early access invites</p>
                <p>🎯 Your feedback will help shape the future of IT consulting</p>
              </div>
              
              <div className="p-4 rounded-lg mb-6" style={{ background: 'var(--bg-accent)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Expected launch: Q2 2024
                </p>
              </div>

              <Link to="/">
                <Button size="lg" variant="outline">
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
