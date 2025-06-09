import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { AuthService } from '../services/auth';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { success, error } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      error('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      error('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      error('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register({
        name: name.trim(),
        email: email.trim(),
        password: password
      });

      // Update auth store
      login(response.user, response.access_token);

      success('Registration Successful', `Welcome to Lemur AI, ${response.user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      error('Registration Failed', err.message || 'Failed to create account. Please try again.');
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
              Create your account
            </h2>
            <p className="mt-2 text-dark-600 dark:text-dark-400">
              Or{' '}
              <Link to="/login" className="link">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <div className="mt-8">

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="h-5 w-5 text-gray-400" />}
                placeholder="Aditi Sirigineedi"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="aditi@synatechsolutions.com"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
              />

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<UserPlus className="h-5 w-5" />}
                >
                  Create Account
                </Button>
              </div>
            </form>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
