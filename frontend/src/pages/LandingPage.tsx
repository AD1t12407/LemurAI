import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CalendarCheck, Brain, Lightbulb, Repeat, CheckCircle, Clock, MessageSquare, FileText, Users, Sparkles, ChevronLeft, ChevronRight, Plus, Mic, Target, Mail, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo.tsx';
import { AnimatedNavbar } from '../components/AnimatedNavbar.tsx';
import { TypingText } from '../components/TypingText.tsx';
import { Button } from '../components/Button.tsx';
import { useSmoothScroll } from '../hooks/useSmoothScroll.ts';
import {
  heroAnimations,
  staggerAnimations,
  buttonAnimations,
  scrollAnimations,
  pulseAnimation,
  viewportSettings,
} from '../utils/animations.ts';



export const LandingPage: React.FC = () => {
  // Email capture state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enable smooth scrolling for anchor links
  useSmoothScroll();

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200]);
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Submit to waitlist endpoint
      const response = await fetch('https://backend-lemur-waitlist-omqb.onrender.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Show success message and clear email
        alert('Thank you for joining our waitlist! We\'ll be in touch soon.');
        setEmail('');
      } else {
        // Show error message
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      // Show error message
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle scroll to email section
  const scrollToEmailSection = () => {
    const emailSection = document.getElementById('email-signup');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      {/* Futuristic Background Elements - Hidden on mobile for better performance */}
      <div className="fixed inset-0 z-0 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Animated Header */}
      <AnimatedNavbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-40"
          style={{
            background: 'var(--bg-gradient)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center'
          }}>
          <div className="mx-auto max-w-7xl w-full">
            <motion.div
              className="text-center"
              style={{ y: heroY }}
            >
              {/* AI Badge */}
              <motion.div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 sm:px-4 sm:py-2 sm:mb-8"
                style={{
                  background: 'var(--gradient-secondary)',
                  border: '1px solid var(--border-accent)',
                  backdropFilter: 'var(--backdrop-blur)'
                }}
                variants={heroAnimations.badge}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={pulseAnimation}
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: 'var(--text-accent)' }} />
                </motion.div>
                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-accent)' }}>
                  Complete Business Automation for Consultants
                </span>
              </motion.div>

              <motion.h1
                className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ color: 'var(--text-primary)' }}
                variants={heroAnimations.title}
                initial="hidden"
                animate="visible"
              >
                <motion.span className="block">From Lead to Deal</motion.span>
                <motion.span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  <TypingText text="with Lemur AI" delay={1.2} />
                </motion.span>
              </motion.h1>

              <motion.p
                className="mx-auto mt-4 max-w-3xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 lg:text-xl"
                style={{ color: 'var(--text-secondary)' }}
                variants={heroAnimations.subtitle}
                initial="hidden"
                animate="visible"
              >
                The complete business automation platform for consulting firms and freelancers.
                From the first meeting to the first proposal, we handle the heavy lifting so you can focus on closing deals.
              </motion.p>

              {/* Creative Email Capture */}
              <motion.div
                id="email-signup"
                className="mx-auto mt-8 max-w-2xl sm:mt-10 px-4 sm:px-0"
                variants={heroAnimations.buttons}
                initial="hidden"
                animate="visible"
              >
                {/* Email Capture Form */}
                <motion.form
                  onSubmit={handleEmailSubmit}
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-0">
                    {/* Email Input */}
                    <motion.div
                      className="relative flex-1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email to join the waitlist"
                        required
                        className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-3 sm:pr-4 sm:pr-32 text-sm sm:text-base rounded-2xl sm:rounded-r-none border-2 border-blue-200 dark:border-blue-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                        style={{
                          color: 'var(--text-primary)',
                          background: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                        }}
                      />


                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={!email || isSubmitting}
                      className="h-12 sm:h-14 px-2 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold text-sm sm:text-base rounded-2xl sm:rounded-l-none border-2 border-blue-600 hover:border-blue-700 disabled:border-blue-400 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 group shadow-lg hover:shadow-xl disabled:cursor-not-allowed min-w-[55px] sm:min-w-[140px]"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="hidden sm:inline">Joining...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Join Waitlist</span>
                          <span className="sm:hidden">Join</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl -z-10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.form>

                {/* Secondary Action */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.a
                    href="#how-it-works"
                    className="group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      See how it works first
                    </span>
                    <motion.div
                      className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-200"
                      animate={{ y: [0, 2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.div>
                  </motion.a>
                </motion.div>


              </motion.div>
            </motion.div>



          </div>
        </section>



        {/* How It Works - Clean Workflow */}
        <section id="how-it-works" className="relative z-20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24" style={{ background: 'var(--bg-secondary)' }}>
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
                How Lemur AI Works
              </h2>
              <p className="mx-auto max-w-2xl text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
                From lead to deal - see how our AI automates your entire consulting workflow
              </p>
            </motion.div>

            {/* Steps 1-3 Container with Connecting Line */}
            <motion.div
              className="space-y-20 relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Connecting Line for Steps 1-3 Only */}
              <motion.div
                className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200 dark:from-blue-700 dark:via-blue-600 dark:to-blue-700 transform -translate-x-1/2 hidden lg:block"
                initial={{ scaleY: 0, opacity: 0 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                viewport={{ once: true }}
                style={{ originY: 0, height: '1600px' }}
              />

              {/* Step 1: Centralized Brain - Learning System */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    1
                  </div>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  className="card shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Text Content */}
                    <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-xl font-bold mb-4 sm:text-2xl lg:text-3xl sm:mb-6" style={{ color: 'var(--text-primary)' }}>
                          Centralized Brain - We Learn About You
                        </h3>
                        <p className="text-base mb-6 leading-relaxed sm:text-lg sm:mb-8" style={{ color: 'var(--text-secondary)' }}>
                          Our AI builds a comprehensive knowledge base from all your client interactions, project histories, and uploaded documents.
                          Every meeting, proposal, and client touchpoint becomes part of your organization's collective intelligence, enabling smarter recommendations and personalized insights.
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium sm:px-4 sm:py-2 sm:text-sm" style={{ background: 'var(--bg-accent)', color: 'var(--text-accent)', border: '1px solid var(--border-accent)' }}>
                            Knowledge Graph
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium sm:px-4 sm:py-2 sm:text-sm" style={{ background: 'var(--bg-accent)', color: 'var(--text-accent)', border: '1px solid var(--border-accent)' }}>
                            Project History
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium sm:px-4 sm:py-2 sm:text-sm" style={{ background: 'var(--bg-accent)', color: 'var(--text-accent)', border: '1px solid var(--border-accent)' }}>
                            Document Learning
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Knowledge Dashboard Visualization */}
                    <div className="p-4 flex items-center justify-center sm:p-6 lg:p-8" style={{ background: 'var(--bg-accent)' }}>
                      <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <div className="card shadow-lg overflow-hidden">
                          {/* Dashboard Header */}
                          <div className="p-3 border-b sm:p-4" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                            <h4 className="text-base font-semibold flex items-center gap-2 sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                              <Brain className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--text-accent)' }} />
                              Knowledge Base
                            </h4>
                          </div>

                          {/* Knowledge Stats */}
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <motion.div
                                className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                              >
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">247</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Client Projects</div>
                              </motion.div>
                              <motion.div
                                className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                              >
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">1.2k</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">Documents</div>
                              </motion.div>
                            </div>

                            {/* Recent Learning Activity */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">Recent Learning</h5>
                              <motion.div
                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-300">TechCorp SOW patterns analyzed</span>
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 1.4 }}
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-300">Client preferences updated</span>
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 1.6 }}
                              >
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-300">Meeting insights integrated</span>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Step 2: Calendar Integration & Sync */}
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    2
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
                  <motion.div
                    className="order-2 lg:order-1"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      Calendar Integration & Sync
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                      Connect your Google Calendar and Outlook seamlessly with one-click OAuth integration.
                      Lemur AI automatically syncs your meetings, creates calendar events, and ensures your schedule stays perfectly organized across all platforms.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        Google Calendar
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        Outlook Sync
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        Auto-Sync
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="order-1 lg:order-2"
                    initial={{ opacity: 0, x: 50, rotateY: 15 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    whileHover={{ scale: 1.02, rotateY: -5 }}
                    viewport={{ once: true }}
                  >
                    {/* Calendar Component Mockup */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xl overflow-hidden">
                      {/* Calendar Header */}
                      <motion.div
                        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">December 2024</h4>
                          <div className="flex items-center gap-1">
                            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                        </div>
                        <motion.button
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="h-4 w-4" />
                          Schedule Meeting
                        </motion.button>
                      </motion.div>

                      {/* Calendar Grid */}
                      <div className="p-4">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                          {/* Sample calendar days with meetings */}
                          {[
                            { date: 1, meetings: [] },
                            { date: 2, meetings: [] },
                            { date: 3, meetings: ['Team Sync'] },
                            { date: 4, meetings: [] },
                            { date: 5, meetings: ['Client Call', 'Review'] },
                            { date: 6, meetings: [] },
                            { date: 7, meetings: [] },
                            { date: 8, meetings: [] },
                            { date: 9, meetings: ['Strategy'] },
                            { date: 10, meetings: [] },
                            { date: 11, meetings: [] },
                            { date: 12, meetings: ['Demo'] },
                            { date: 13, meetings: [] },
                            { date: 14, meetings: [] },
                          ].map((day, index) => (
                            <motion.div
                              key={index}
                              className="min-h-[60px] p-1 border border-transparent rounded-lg cursor-pointer hover:border-blue-200 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 transition-all"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 1.2 + index * 0.02 }}
                              viewport={{ once: true }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                {day.date}
                              </div>
                              <div className="space-y-1">
                                {day.meetings.slice(0, 2).map((meeting, idx) => (
                                  <motion.div
                                    key={idx}
                                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 truncate"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 1.4 + index * 0.02 + idx * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {meeting}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Integration Status */}
                        <motion.div
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.8 }}
                          viewport={{ once: true }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Google Calendar</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Outlook</span>
                              </div>
                            </div>
                            <motion.div
                              className="text-xs text-green-600 dark:text-green-400 font-medium"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              Synced 2 min ago
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3: Smart Meeting Recording */}
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    3
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
                  <motion.div
                    className="order-1 lg:order-1"
                    initial={{ opacity: 0, x: -50, rotateY: 15 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    whileHover={{ scale: 1.02, rotateY: -5 }}
                    viewport={{ once: true }}
                  >
                    {/* Realistic Meeting Interface Mockup */}
                    <div className="card p-0 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                      {/* Meeting Header */}
                      <motion.div
                        className="bg-gray-900 text-white p-4 flex items-center justify-between"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="ml-4 text-sm font-medium">Client Strategy Call</span>
                        </div>
                        <motion.div
                          className="flex items-center gap-2 text-sm"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Recording</span>
                        </motion.div>
                      </motion.div>

                      {/* Video Grid */}
                      <div className="p-4 bg-gray-100 dark:bg-gray-800">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Participant 1 */}
                          <motion.div
                            className="relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                            viewport={{ once: true }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Sarah Chen
                            </div>
                            <motion.div
                              className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>

                          {/* Participant 2 */}
                          <motion.div
                            className="relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 1.4 }}
                            viewport={{ once: true }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Mike Rodriguez
                            </div>
                            <motion.div
                              className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            />
                          </motion.div>

                          {/* AI Bot */}
                          <motion.div
                            className="relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video col-span-2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 1.6 }}
                            viewport={{ once: true }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <motion.div
                                className="text-center text-white"
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                  <Logo className="h-8 w-8" showText={false} />
                                </div>
                                <div className="text-sm font-normal text-white">LemurAI</div>
                                
                              </motion.div>
                            </div>
                            <motion.div
                              className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                              AI Active
                            </motion.div>
                          </motion.div>
                        </div>

                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="order-2 lg:order-2"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Smart Meeting Recording
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                      Lemur AI seamlessly joins your video calls as an intelligent participant, capturing every detail with enterprise-grade recording technology.
                      Our AI bot automatically detects speakers, optimizes audio quality, and ensures crystal-clear documentation of your meetings.
                    </p>
                    <motion.div
                      className="flex flex-wrap gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <span className="badge badge-primary">Auto-Join</span>
                      
                      <span className="badge badge-primary">Speaker Detection</span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Phase 1: Insights Generation */}
              <motion.div
                className="relative mb-16 mt-32"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Phase Header */}
                <div className="text-center mb-12">
                  <motion.div
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-blue-200 dark:border-blue-700 mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-semibold text-blue-900 dark:text-blue-300">Insights Generation</span>
                  </motion.div>
                  <motion.p
                    className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    Transform raw meeting data into structured insights through transcription, summarization, and action item extraction
                  </motion.p>
                </div>

                {/* Phase 1 Steps Container */}
                <motion.div
                  className="space-y-16 relative"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  {/* Connecting Line for Steps 4-6 */}
                  <motion.div
                    className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200 dark:from-blue-700 dark:via-purple-700 dark:to-blue-700 transform -translate-x-1/2 hidden lg:block"
                    initial={{ scaleY: 0, opacity: 0 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                    viewport={{ once: true }}
                    style={{ originY: 0, height: '1200px' }}
                  />


                  {/* Step 4: AI Transcription Engine */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                  >
                    {/* Step Number */}
                    <motion.div
                      className="flex justify-center mb-8"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 1.0, type: "spring", stiffness: 200 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                        4
                      </div>
                    </motion.div>

                    {/* Content Card */}
                    <motion.div
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5, transition: { duration: 0.3 } }}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Text Content */}
                        <div className="p-12 flex flex-col justify-center">
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 1.4 }}
                            viewport={{ once: true }}
                          >
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                              AI Transcription Engine
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                              Advanced speech-to-text processing with speaker identification and confidence scoring.
                              Our AI engine understands context, handles multiple speakers, and maintains accuracy even with technical jargon and industry terminology.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                Real-time
                              </span>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                Speaker ID
                              </span>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                98.5% Accuracy
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Transcription Interface */}
                        <div className="p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <motion.div
                            className="w-full max-w-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 1.6 }}
                            viewport={{ once: true }}
                          >
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                              <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Mic className="h-5 w-5 text-blue-600" />
                                   Transcription
                                </h4>
                              </div>
                              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                                <motion.div
                                  className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.5, delay: 1.8 }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Sarah Chen</span>
                                    <span className="text-xs text-gray-500">14:32</span>
                                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200 px-1 rounded"></span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    "I think we should focus on the API integration first..."
                                  </p>
                                </motion.div>
                                <motion.div
                                  className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.5, delay: 2.0 }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Mike Rodriguez</span>
                                    <span className="text-xs text-gray-500">14:33</span>
                                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200 px-1 rounded"></span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    "Absolutely. The authentication layer needs to be solid..."
                                  </p>
                                </motion.div>
                                <motion.div
                                  className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.5, delay: 2.2 }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">AI Processing</span>
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                    Analyzing key topics and sentiment...
                                  </p>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Step 5: Context-Aware Summarization */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    viewport={{ once: true }}
                  >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    5
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
                  <motion.div
                    className="order-1 lg:order-1"
                    initial={{ opacity: 0, x: -50, rotateY: 15 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    whileHover={{ scale: 1.02, rotateY: -5 }}
                    viewport={{ once: true }}
                  >
                    <div className="card p-6 bg-white dark:bg-gray-800 shadow-xl">
                      <motion.div
                        className="flex items-center justify-between mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white">Smart Summary</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-600 dark:text-blue-400">AI Generated</span>
                        </div>
                      </motion.div>
                      <div className="space-y-4">
                        <motion.div
                          className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                          viewport={{ once: true }}
                        >
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Key Discussion Points</h5>
                          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            <motion.li
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 1.4 }}
                              viewport={{ once: true }}
                            >
                              <motion.div
                                className="w-2 h-2 rounded-full bg-blue-500"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              API integration timeline and requirements
                            </motion.li>
                            <motion.li
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 1.6 }}
                              viewport={{ once: true }}
                            >
                              <motion.div
                                className="w-2 h-2 rounded-full bg-purple-500"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                              />
                              Authentication security considerations
                            </motion.li>
                            <motion.li
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 1.8 }}
                              viewport={{ once: true }}
                            >
                              <motion.div
                                className="w-2 h-2 rounded-full bg-green-500"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                              />
                              Frontend component architecture
                            </motion.li>
                          </ul>
                        </motion.div>
                        
                      
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="order-2 lg:order-2"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Context-Aware Summarization
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                      Intelligent content analysis that understands meeting context, identifies key topics, and generates structured summaries.
                      Our AI analyzes sentiment, engagement levels, and discussion patterns to provide actionable insights beyond basic transcription.
                    </p>
                    <motion.div
                      className="flex flex-wrap gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <span className="badge badge-primary">Sentiment Analysis</span>
                      <span className="badge badge-primary">Topic Detection</span>
                      <span className="badge badge-primary">Smart Insights</span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

                  {/* Step 6: Action Item Extraction */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    viewport={{ once: true }}
                  >
                    {/* Step Number */}
                    <motion.div
                      className="flex justify-center mb-8"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 1.4, type: "spring", stiffness: 200 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                        6
                      </div>
                    </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Action Item Extraction
                    </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    Automatically identifies tasks, commitments, and deadlines<p></p>
                     from meeting conversations with intelligent priority assignment.<p></p>
                    Our system recognizes action-oriented language and assigns <p></p>
                    ownership based on context and participant roles.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-primary">Auto-Detection</span>
                    <span className="badge badge-primary">Priority Scoring</span>
                    <span className="badge badge-primary">Smart Assignment</span>
                  </div>
                </div>
                <motion.div
                  className="order-1 lg:order-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card p-6 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Extracted Action Items</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">3 items</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded font-medium">HIGH PRIORITY</span>
                          <span className="text-xs text-gray-500">Due: Tomorrow</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Complete API authentication documentation</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Assigned to: Sarah Chen</p>
                      </div>
                      <div className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded font-medium">MEDIUM</span>
                          <span className="text-xs text-gray-500">Due: Next Week</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Review frontend component designs</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Assigned to: Mike Rodriguez</p>
                      </div>
                      <div className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded font-medium">LOW</span>
                          <span className="text-xs text-gray-500">Due: End of Month</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule follow-up meeting</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Assigned to: Team Lead</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>
              </motion.div>

              {/* Phase 2: Actions from Insights */}
              <motion.div
                className="relative mt-32 mb-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Phase Header */}
                <div className="text-center mb-12">
                  <motion.div
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full border border-green-200 dark:border-green-700 mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-semibold text-green-900 dark:text-green-300"> AI Agents in Action</span>
                  </motion.div>
                  <motion.p
                    className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    Transform insights into actionable deliverables: personalized follow-ups, professional SOWs, and client-ready proposals
                  </motion.p>
                </div>

                {/* Connecting Line for Steps 7-9 */}
                <motion.div
                  className="absolute left-1/2 top-48 w-px bg-gradient-to-b from-green-200 via-emerald-200 to-green-200 dark:from-green-700 dark:via-emerald-700 dark:to-green-700 transform -translate-x-1/2 hidden lg:block"
                  initial={{ scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  viewport={{ once: true }}
                  style={{ originY: 0, height: '1600px' }}
                />
              </motion.div>

              {/* Step 7: Follow-Up Generation */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: 180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    7
                  </div>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: 40, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, rotateX: -2, transition: { duration: 0.3 } }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                    {/* Text Content */}
                    <div className="p-12 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                          Personalized Follow-Up Generation
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Automatically compose personalized follow-up emails based on meeting content, participant context, and historical interactions.
                          Our AI matches tone, includes relevant action items, and schedules optimal send times for maximum engagement.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Personalized Tone
                          </span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Smart Scheduling
                          </span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Action Items
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Email Interface */}
                    <div className="p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                      <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-green-600" />
                              Follow-up Email
                            </h4>
                          </div>
                          <div className="p-4 space-y-3">
                            <motion.div
                              className="space-y-2"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 1.2 }}
                            >
                              <div className="text-xs text-gray-500">To: sarah.martinez@techcorp.com</div>
                              <div className="text-xs text-gray-500">Subject: Next Steps - Lemur AI Implementation</div>
                            </motion.div>
                            <motion.div
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 1.4 }}
                            >
                              Hi Sarah,<br/><br/>
                              Thank you for the excellent discussion about implementing Lemur AI for your consulting team...
                              <br/><br/>
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ✓ Personalized based on meeting context
                              </div>
                            </motion.div>
                            <motion.button
                              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 1.6 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Send Email
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Step 8: Professional SOW Generation */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    8
                  </div>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: 40, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, rotateX: -2, transition: { duration: 0.3 } }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                    {/* Text Content */}
                    <div className="p-12 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                          Professional SOW Generation
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Transform meeting discussions into comprehensive, professional Scope of Work documents with detailed deliverables, timelines, and requirements.
                          Our AI extracts project specifications and structures them into client-ready SOW documents with proper formatting and professional presentation.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">Auto-Structure</span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">Professional Format</span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">Client-Ready</span>
                        </div>
                      </motion.div>
                    </div>

                  <motion.div
                    className="order-1 lg:order-2"
                    initial={{ opacity: 0, x: 50, rotateY: -15 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    whileHover={{ scale: 1.02, rotateY: 5 }}
                    viewport={{ once: true }}
                  >
                    {/* Professional Document Editor Interface */}
                    <div className="card p-0 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                      {/* Document Header */}
                      <motion.div
                        className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">SOW_ClientProject_v2.docx</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Auto-generated • Last saved 2 min ago</p>
                            </div>
                          </div>
                          <motion.div
                            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>AI Generating</span>
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Document Content */}
                      <div className="p-6 max-h-80 overflow-y-auto">
                        {/* Document Title */}
                        <motion.div
                          className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                          viewport={{ once: true }}
                        >
                          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            SCOPE OF WORK
                          </h1>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            API Integration & Authentication System Development
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Project Reference: SOW-2024-001 | Date: {new Date().toLocaleDateString()}
                          </p>
                        </motion.div>

                        {/* Project Overview */}
                        <motion.div
                          className="mb-6"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.4 }}
                          viewport={{ once: true }}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded text-blue-600 dark:text-blue-400 text-sm flex items-center justify-center font-bold">1</span>
                            Project Overview
                          </h3>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              Development of a comprehensive API integration system with robust authentication mechanisms,
                              designed to streamline data flow between client systems and enhance security protocols.
                            </p>
                          </div>
                        </motion.div>

                        {/* Deliverables */}
                        <motion.div
                          className="mb-6"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.6 }}
                          viewport={{ once: true }}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded text-green-600 dark:text-green-400 text-sm flex items-center justify-center font-bold">2</span>
                            Key Deliverables
                          </h3>
                          <div className="space-y-3">
                            <motion.div
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 1.8 }}
                              viewport={{ once: true }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              </motion.div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">API Authentication Documentation</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Complete technical specifications and implementation guide</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Phase 1</span>
                            </motion.div>
                            <motion.div
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 2.0 }}
                              viewport={{ once: true }}
                            >
                              <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Frontend Component Architecture</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Responsive UI components with modern design patterns</p>
                              </div>
                              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded">Phase 2</span>
                            </motion.div>
                            <motion.div
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 2.2 }}
                              viewport={{ once: true }}
                            >
                              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Integration Testing Suite</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Comprehensive testing framework and quality assurance</p>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">Phase 3</span>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Timeline & Budget */}
                        <motion.div
                          className="grid grid-cols-2 gap-4"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 2.4 }}
                          viewport={{ once: true }}
                        >
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Timeline</h4>
                            <motion.p
                              className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              6 weeks
                            </motion.p>
                            <p className="text-xs text-purple-700 dark:text-purple-300">Estimated delivery</p>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Investment</h4>
                            <motion.p
                              className="text-2xl font-bold text-green-600 dark:text-green-400"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                              $45,000
                            </motion.p>
                            <p className="text-xs text-green-700 dark:text-green-300">Fixed price</p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Document Actions */}
                      <motion.div
                        className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 2.6 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span>Auto-saving...</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-outline text-xs px-3 py-1">Preview</button>
                          <button className="btn btn-primary text-xs px-3 py-1">Export PDF</button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 9: AI Proposal Generation */}
              <motion.div
                className="relative mt-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Step Number */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-900">
                    9
                  </div>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Text Content */}
                    <div className="p-12 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                          AI Proposal Generation
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                          Generate comprehensive project proposals with integrated CRM data, dynamic pricing models, and performance analytics.
                          Our AI combines meeting insights with historical project data to create compelling, accurate proposals that win more business.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Smart Templates
                          </span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Performance Analytics
                          </span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Dynamic Pricing
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Document Viewer */}
                    <div className="p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                      <motion.div
                        className="relative max-w-xs"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        {/* Document Stack Effect */}
                        <div className="absolute inset-0 bg-white shadow-lg transform rotate-1 translate-x-1 translate-y-1 rounded-sm"></div>
                        <div className="absolute inset-0 bg-white shadow-md transform rotate-0.5 translate-x-0.5 translate-y-0.5 rounded-sm"></div>

                        {/* Main Document */}
                        <div className="relative bg-white shadow-xl border border-gray-300 rounded-sm" style={{ aspectRatio: '210/297', height: '320px' }}>
                          <div className="h-full p-4 text-black text-xs overflow-hidden" style={{ fontFamily: 'Times, serif' }}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3 pb-1 border-b border-gray-300">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">L</span>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-gray-900">LEMUR AI</div>
                                  <div className="text-xs text-gray-600">Consulting Solutions</div>
                                </div>
                              </div>
                              <div className="text-right text-xs text-gray-600">
                                <div className="font-semibold">PROPOSAL</div>
                                <div>No. 2024-001</div>
                              </div>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-3">
                              <h1 className="text-sm font-bold text-gray-900 mb-1">
                                DIGITAL TRANSFORMATION
                              </h1>
                              <h2 className="text-xs text-gray-700 mb-1">
                                AI-Powered Meeting Intelligence
                              </h2>
                              <div className="text-xs font-semibold text-blue-600">
                                Prepared for TechCorp Solutions
                              </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="mb-3">
                              <h3 className="text-xs font-bold text-gray-900 mb-1 border-b border-gray-300 pb-1">
                                EXECUTIVE SUMMARY
                              </h3>
                              <p className="text-xs text-gray-800 leading-tight mb-2">
                                TechCorp Solutions seeks to modernize their client meeting processes and improve proposal
                                generation efficiency using Lemur AI's meeting intelligence platform.
                              </p>
                            </div>

                            {/* Scope of Work */}
                            <div className="mb-3">
                              <h3 className="text-xs font-bold text-gray-900 mb-1 border-b border-gray-300 pb-1">
                                SCOPE OF WORK
                              </h3>
                              <div className="space-y-1">
                                <div className="flex items-start gap-1">
                                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                                  <span className="text-xs text-gray-800">AI Meeting Recording Setup</span>
                                </div>
                                <div className="flex items-start gap-1">
                                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                                  <span className="text-xs text-gray-800">CRM Integration</span>
                                </div>
                                <div className="flex items-start gap-1">
                                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                                  <span className="text-xs text-gray-800">Proposal Generation System</span>
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-xs text-gray-600 border-t border-gray-300 pt-1">
                              <div>Lemur AI</div>
                              <div>Page 1 of 8</div>
                            </div>
                          </div>
                        </div>

                        {/* Document Controls */}
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-xs text-gray-600 dark:text-gray-300 px-2">1 / 8</span>
                          <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
                </motion.div>
              </motion.div>
          </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-20 px-4 py-8 sm:py-12 lg:py-16 xl:py-24 sm:px-6 lg:px-8 block" style={{ background: 'var(--bg-primary)', minHeight: 'auto' }}>
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl xl:text-4xl mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
                Why Choose Lemur AI
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg" style={{ color: 'var(--text-secondary)' }}>
                Purpose-built for B2B consultants to streamline client meetings and deliver exceptional value.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  title: 'Intelligent Meeting Notes',
                  description: 'Lemur AI joins your calls automatically, capturing structured, actionable notes without manual input.',
                  icon: MessageSquare,
                },
                {
                  title: 'Smart Action Item Detection',
                  description: 'Instantly identifies tasks, commitments, and deadlines—keeping your pipeline moving forward.',
                  icon: CheckCircle,
                },
                {
                  title: 'Personalized Follow-Ups',
                  description: 'Auto-generates context-aware follow-up emails using meeting insights, client tone, and historical data.',
                  icon: Repeat,
                },
                {
                  title: 'Client Knowledge Base',
                  description: 'Maintains a deep, evolving profile of each client—including preferences, project history, stakeholders, and communication patterns.',
                  icon: Brain,
                },
                {
                  title: 'Automated Proposal Generation',
                  description: 'Transforms meetings into ready-to-send proposals and scopes of work—backed by data from past projects and team input.',
                  icon: FileText,
                },
                {
                  title: 'End-to-End Pre-Sales Workflow Automation',
                  description: 'From lead intake to proposal delivery, Lemur AI automates every manual touchpoint so your team can focus on closing.',
                  icon: CalendarCheck,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="card flex flex-col p-4 group cursor-pointer sm:p-6 opacity-100"
                >
                  <div
                    className="mb-3 rounded-full p-2 w-fit sm:mb-4 sm:p-3"
                    style={{ background: 'var(--bg-accent)' }}
                  >
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--text-accent)' }} />
                  </div>
                  <h3 className="text-lg font-semibold transition-colors duration-300 sm:text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h3>
                  <p className="mt-2 flex-grow text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
          style={{
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-primary)'
          }}>
          {/* Animated Background Effects */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"
            style={{ y: backgroundY }}
          />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
            animate={pulseAnimation}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
            animate={{
              ...pulseAnimation,
              transition: { ...pulseAnimation.transition, delay: 1 }
            }}
          />

          <div className="mx-auto max-w-7xl relative z-10">
            <motion.div
              className="text-center"
              variants={scrollAnimations.fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: 'var(--text-primary)' }}
                variants={scrollAnimations.scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
              >
                Ready to Transform Your Business?
              </motion.h2>
              <motion.p
                className="mx-auto mt-4 max-w-2xl text-lg"
                style={{ color: 'var(--text-secondary)' }}
                variants={scrollAnimations.fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                transition={{ delay: 0.2 }}
              >
                Join innovative consultants who are using Lemur AI to automate their entire client journey from lead to deal.
              </motion.p>
              <motion.div
                className="mt-8 flex justify-center gap-4"
                variants={staggerAnimations.fastContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
              >
                <motion.div variants={staggerAnimations.item}>
                  <motion.div
                    variants={buttonAnimations.primary}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={scrollToEmailSection}
                    style={{ cursor: 'pointer' }}
                  >
                    <Button
                      size="lg"
                      className="shadow-lg hover:shadow-xl transition-all duration-300"
                      leftIcon={<Users className="h-5 w-5" />}
                    >
                      Join Waitlist
                    </Button>
                  </motion.div>
                </motion.div>
                <motion.div variants={staggerAnimations.item}>
                  <a href="#how-it-works">
                    <motion.div
                      variants={buttonAnimations.outline}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="backdrop-blur-sm"
                      >
                        Learn More
                      </Button>
                    </motion.div>
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-4 py-12 sm:px-6 lg:px-8" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo size="xl" variant="default" />
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                AI-powered meeting intelligence for B2B consulting.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#features" className="link">Features</a></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Get Started</button></li>
                <li><a href="#how-it-works" className="link">How it Works</a></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Early Access</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><button onClick={scrollToEmailSection} className="link text-left">About</button></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Updates</button></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Join Team</button></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Contact</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><button onClick={scrollToEmailSection} className="link text-left">Get Help</button></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Documentation</button></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Community</button></li>
                <li><button onClick={scrollToEmailSection} className="link text-left">Feedback</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="text-center text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Lemur AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};