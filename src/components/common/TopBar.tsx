import React from 'react';
import { UserProfile } from '../../types';
import { PillNav, PillNavItem } from './PillNav';
import { AskAIButton } from './AskAIButton';

interface TopBarProps {
  user?: UserProfile | null;
  activeTab?: string;
  onNavigate: (tab: string) => void;
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
  onNavigate
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

      {/* Right side controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Quick Ask AI button */}
        <AskAIButton
          onClick={() => onNavigate('chat')}
          className="hidden sm:inline-flex"
        />

        {/* User Profile Avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-1">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-xl object-cover border border-cyan-500/40"
            />
            <span className="hidden xl:inline text-xs font-semibold text-slate-200 max-w-[120px] truncate">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
