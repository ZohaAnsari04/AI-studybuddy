import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { UserProfile } from '../../types';
import { PillNav, PillNavItem } from './PillNav';

interface TopBarProps {
  user: UserProfile;
  activeTab?: string;
  onNavigate: (tab: string) => void;
  onToggleMobileSidebar: () => void;
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
  onToggleMobileSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 min-h-[4.25rem] glass-nav px-4 lg:px-8 flex items-center justify-between gap-4 py-2">
      {/* Mobile sidebar toggle button for small screens */}
      <button
        onClick={onToggleMobileSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
        aria-label="Toggle Sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* PillNav Main Navigation Component */}
      <div className="flex-1 flex items-center justify-center sm:justify-start lg:justify-center overflow-x-auto py-1">
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
          onMobileMenuClick={onToggleMobileSidebar}
        />
      </div>

      {/* Right side controls & user profile */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Quick Ask AI button */}
        <button
          onClick={() => onNavigate('chat')}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold glow-cyan cursor-pointer transition-all"
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

export default TopBar;

