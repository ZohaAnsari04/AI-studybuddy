import React from 'react';
import { Sparkles, LogOut, LogIn } from 'lucide-react';
import { UserProfile } from '../../types';
import { PillNav, PillNavItem } from './PillNav';

interface TopBarProps {
  user: UserProfile | null;
  activeTab?: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

const navItems: PillNavItem[] = [
  { label: 'Home', href: '#dashboard' },
  { label: 'Study Material', href: '#upload' },
  { label: 'Ask AI', href: '#chat' },
  { label: 'Quiz', href: '#quizzes' },
  { label: 'Revision', href: '#revision' },
  { label: 'Settings', href: '#settings' }
];

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeTab = 'dashboard',
  onNavigate,
  onOpenAuth,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-50 w-full min-h-[4.5rem] glass-nav px-4 lg:px-8 flex items-center justify-between gap-4 py-2 border-b border-slate-800/80 bg-[#080b0f]/90 backdrop-blur-2xl shadow-lg shadow-black/30">
      {/* Brand title */}
      <div className="flex items-center gap-2.5">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="font-black text-lg tracking-tight gradient-text">
            StudySphere AI
          </span>
        </div>
      </div>

      {/* PillNav Main Navigation Bar */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto py-1">
        <PillNav
          logo="/favicon.svg"
          logoAlt="StudySphere AI"
          items={navItems}
          activeHref={`#${activeTab}`}
          baseColor="#080e1a"
          pillColor="#0e1726"
          pillTextColor="#94a3b8"
          hoveredPillTextColor="#ffffff"
          ease="power2.easeOut"
          initialLoadAnimation={true}
          onItemClick={(item, e) => {
            e.preventDefault();
            const tab = item.href.replace('#', '');
            onNavigate(tab);
          }}
        />
      </div>

      {/* Right side controls & user authentication */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Quick Ask AI button */}
        <button
          onClick={() => onNavigate('chat')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold glow-cyan cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI</span>
        </button>

        {/* User Profile or Sign In */}
        {user ? (
          <div className="flex items-center gap-3 pl-1">
            <div className="flex items-center gap-2">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40"
              />
              <span className="hidden xl:inline text-xs font-bold text-white max-w-[120px] truncate">{user.name}</span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
