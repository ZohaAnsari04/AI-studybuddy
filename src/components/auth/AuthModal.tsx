import React, { useState } from 'react';
import { BrainCircuit, Play, Lock, Mail, X } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';
import { StorageService } from '../../lib/storage/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemoLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onDemoLogin }) => {
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
        // Fallback for development without live Supabase OAuth client keys
        StorageService.createNewUserAccount('Google Student User', 'student.google@university.edu');
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Attempt sign up if user does not exist
          const { error: signUpErr } = await supabase.auth.signUp({ email, password });
          if (signUpErr) throw signUpErr;
        }
      } else {
        const namePart = email.split('@')[0];
        StorageService.createNewUserAccount(namePart.charAt(0).toUpperCase() + namePart.slice(1), email);
      }
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl border-cyan-500/40 p-8 shadow-2xl relative overflow-hidden bg-slate-950/90">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center mx-auto mb-3">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to StudySphere AI</h2>
          <p className="text-xs text-slate-400 mt-1">Access your personal syllabus study space</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* REAL GOOGLE OAUTH BUTTON */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-md transition-all mb-4 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500">OR EMAIL</span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <Button type="submit" variant="secondary" size="md" disabled={loading} className="w-full">
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </Button>
        </form>

        {/* DEMO MODE CTA BUTTON FOR HACKATHON EVALUATION */}
        <div className="mt-6 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
            ⭐ Hackathon Judge Fast Track
          </span>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={<Play className="w-3.5 h-3.5 fill-current text-cyan-400" />}
            onClick={() => {
              onDemoLogin();
              onClose();
            }}
          >
            Try Demo Workspace
          </Button>
        </div>
      </div>
    </div>
  );
};
