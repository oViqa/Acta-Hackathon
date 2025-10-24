'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface AdminLoginProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AdminLogin({ onSuccess, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both username and password.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the normal login API instead of hardcoded credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username, // username field is actually email
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin role
        if (data.user.role === 'admin') {
          toast({
            title: 'Welcome, Admin!',
            description: 'Successfully logged in to admin dashboard.'
          });
          onSuccess();
        } else {
          toast({
            title: 'Access Denied',
            description: 'This account does not have admin privileges.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Invalid credentials',
          description: data.error || 'Please check your email and password.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Admin Login</h2>
                <p className="text-orange-100 text-sm">Pudding mit Gabel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter admin username"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter admin password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Admin Credentials Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Admin Login:</p>
                  <p>Use your admin email and password to access the dashboard.</p>
                  <p className="text-xs mt-1 text-blue-600">Contact system administrator if you need access.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </div>
            ) : (
              'Sign in to Admin Dashboard'
            )}
          </button>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure admin access only
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
