import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  MessageSquare,
  FileQuestion,
  Calendar,
  Settings,
  BrainCircuit,
  Play
} from 'lucide-react';
import { NOVAOrb } from '../ai/NOVAOrb';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isDemoMode: boolean;
  onExitDemoMode?: () => void;
  onLaunchDemoMode?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isDemoMode,
  onExitDemoMode,
  onLaunchDemoMode,
  isMobileOpen,
  onCloseMobile
}) => {
  // Exact 6 Core PDF Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'upload', label: 'My Study Material', icon: UploadCloud, highlight: true },
    { id: 'chat', label: 'Ask AI', icon: MessageSquare },
    { id: 'quizzes', label: 'Quiz', icon: FileQuestion },
    { id: 'revision', label: 'Revision Plan', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass-card border-r border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0 bg-slate-950/95' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand logo header */}
      <div>
        <div
          onClick={() => handleItemClick('dashboard')}
          className="flex items-center gap-3 px-2 py-3 mb-4 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight gradient-text leading-tight">
              StudySphere AI
            </h1>
            <p className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase">
              Your AI Study Companion
            </p>
          </div>
        </div>

        {/* DEMO MODE ISOLATION BANNER */}
        {isDemoMode ? (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-amber-300 text-xs">
            <span className="font-extrabold tracking-wider uppercase text-[10px] flex items-center gap-1">
              ⚡ DEMO WORKSPACE
            </span>
            <button
              onClick={onExitDemoMode}
              className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={onLaunchDemoMode}
              className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Try Demo Workspace
            </button>
          </div>
        )}

        {/* Streamlined Core Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* NOVA AI Status Card at Bottom */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 flex items-center gap-3 shadow-lg">
          <NOVAOrb size="sm" state="IDLE" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              NOVA AI
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                ACTIVE
              </span>
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {isDemoMode ? 'Demo Workspace' : 'Personal Study Space'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
