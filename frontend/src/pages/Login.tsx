import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { AuthService } from '../services/auth';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const newErrors: {email?: string; password?: string} = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.login({ email, password });

      // Update auth store
      login(response.user, response.access_token);

      success('Welcome Back!', `Hello ${response.user.name}!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      showError('Login Failed', error.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes - try both new auth and fallback to old
  const handleDemoLogin = async () => {
    setIsLoading(true);

    try {
      // Try new authentication first
      const response = await AuthService.login({
        email: 'demo@lemurai.com',
        password: 'demo1234'
      });

      login(response.user, response.access_token);
      success('Demo Login', `Welcome ${response.user.name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      // Fallback to old demo login if new auth fails
      try {
        // Create a demo user object for backward compatibility
        const demoUser = {
          id: '1',
          email: 'demo@lemurai.com',
          name: 'Demo User',
          created_at: new Date().toISOString(),
          google_calendar_connected: false
        };

        login(demoUser, 'demo-token');
        success('Demo Login', 'Welcome to the demo!');
        navigate(from, { replace: true });
      } catch (fallbackError) {
        showError('Login Failed', 'Demo login is currently unavailable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-primary-50 dark:bg-dark-950">
      <header className="flex items-center justify-between p-4">
        <Logo size="xl" variant="default" />
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-md space-y-8 animate-fade-in"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-dark-900 dark:text-dark-50">
              Log in to your account
            </h2>
            <p className="mt-2 text-dark-600 dark:text-dark-400">
              Or{' '}
              <Link to="/register" className="link">
                create a new account
              </Link>
            </p>
          </div>

          <div className="mt-8">

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="you@example.com"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-lemur-600 focus:ring-lemur-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="link">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<LogIn className="h-5 w-5" />}
                >
                  Log in
                </Button>

                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  onClick={handleDemoLogin}
                  isLoading={isLoading}
                >
                  Try Demo Account
                </Button>
              </div>

              {/* Demo Accounts Info */}
              <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Demo Accounts Available:
                </p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div>📧 demo@lemurai.com / demo1234</div>
                  <div>📧 aditi@synatechsolutions.com / synatech@Aditi</div>
                  <div>📧 amansanghi@synatechsolutions.com / synatech@Aman</div>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};