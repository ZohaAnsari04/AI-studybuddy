import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { UserProfile } from '../../types';

interface TopBarProps {
  user: UserProfile;
  onNavigate: (tab: string) => void;
  onToggleMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onNavigate,
  onToggleMobileSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 glass-nav px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left side mobile menu & tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
        >
          <Menu className="w-6 h-6" />
        </button>

        <span className="text-sm font-semibold text-slate-300 hidden sm:inline-block">
          Your AI-powered study companion
        </span>
      </div>

      {/* Right side controls & user profile */}
      <div className="flex items-center gap-3">
        {/* Quick Ask AI button */}
        <button
          onClick={() => onNavigate('chat')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold glow-cyan cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI</span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40"
          />
          <span className="hidden xl:inline text-xs font-bold text-white">{user.name}</span>
        </div>
      </div>
    </header>
  );
};
