import React from 'react';
import { Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { PillNav, PillNavItem } from './PillNav';

interface TopBarProps {
  user: UserProfile;
  activeTab?: string;
  isDemoMode?: boolean;
  onNavigate: (tab: string) => void;
  onExitDemoMode?: () => void;
  onLaunchDemoMode?: () => void;
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
  isDemoMode,
  onNavigate,
  onExitDemoMode,
  onLaunchDemoMode
}) => {
  return (
    <header className="sticky top-0 z-50 w-full min-h-[4.5rem] glass-nav px-4 lg:px-8 flex items-center justify-between gap-4 py-2 border-b border-slate-800/80 bg-[#080b0f]/90 backdrop-blur-2xl shadow-lg shadow-black/30">
      {/* Brand title and Demo status */}
      <div className="flex items-center gap-2.5">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="font-black text-lg tracking-tight gradient-text">
            StudySphere AI
          </span>
        </div>
        {isDemoMode && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Demo Mode</span>
          </div>
        )}
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

      {/* Right side controls & user profile */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Quick Demo Workspace toggle button */}
        {isDemoMode ? (
          <button
            onClick={onExitDemoMode}
            className="hidden md:flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
          >
            Exit Demo
          </button>
        ) : (
          <button
            onClick={onLaunchDemoMode}
            className="hidden md:flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
          >
            Try Demo
          </button>
        )}

        {/* Quick Ask AI button */}
        <button
          onClick={() => onNavigate('chat')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold glow-cyan cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI</span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-1">
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

export default TopBar;

