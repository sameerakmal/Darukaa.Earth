import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Lock, Mail, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shadow-xs mb-4">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Darukaa<span className="text-emerald-600">.Earth</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Geospatial Environmental &amp; Climate Platform
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border border-slate-200 shadow-sm bg-white p-2 rounded-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-slate-900 font-bold font-sans">
              Register workspace account
            </CardTitle>
            <CardDescription className="text-slate-500 font-sans text-xs">
              Register to start managing carbon and biodiversity geospatial projects
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@darukaa.earth"
                    className="pl-9 bg-white border-slate-200 focus:border-emerald-600 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pl-9 bg-white border-slate-200 focus:border-emerald-600 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="pl-9 bg-white border-slate-200 focus:border-emerald-600 text-xs rounded-lg"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="emerald"
                disabled={isSubmitting || !email || !password || !confirmPassword}
                className="w-full mt-2 font-semibold gap-2 shadow-xs py-2.5 text-xs rounded-lg"
                size="default"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-sans">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-700 hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
