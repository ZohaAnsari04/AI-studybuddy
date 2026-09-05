import React, { useState } from 'react';
import { BrainCircuit, Lock, Mail, User, X } from 'lucide-react';
import { Button } from '../common/Button';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';
import { StorageService } from '../../lib/storage/db';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } else {
        const profile = StorageService.createNewUserAccount('Google Student User', 'student.google@university.edu');
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured && supabase) {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim() || email.split('@')[0]
              }
            }
          });
          if (error) throw error;

          if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              name: fullName.trim() || email.split('@')[0],
              email: data.user.email || email,
              avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.user.id)}`
            };
            // Create profile in Supabase profiles table
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: profile.email,
              name: profile.name,
              avatar_url: profile.avatarUrl
            });
            StorageService.saveUser(profile);
            onAuthSuccess(profile);
            onClose();
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: data.user.email || email,
              avatarUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.user.id)}`
            };
            StorageService.saveUser(profile);
            onAuthSuccess(profile);
            onClose();
          }
        }
      } else {
        // Local mode when Supabase credentials are not yet supplied
        const resolvedName = fullName.trim() || email.split('@')[0];
        const formattedName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);
        const profile = StorageService.createNewUserAccount(formattedName, email);
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl border border-cyan-500/40 p-8 shadow-2xl relative overflow-hidden bg-slate-950/95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center mx-auto mb-3">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {mode === 'signin' ? 'Sign In to StudySphere AI' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Access your personal syllabus and study materials'
              : 'Start your personalized AI-powered study space'}
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-md transition-all mb-4 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Or with email
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
              {loading
                ? 'Authenticating...'
                : mode === 'signin'
                ? 'Sign In to Workspace'
                : 'Create Account & Begin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
