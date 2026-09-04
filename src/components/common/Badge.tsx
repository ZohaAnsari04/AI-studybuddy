import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mastered' | 'learning' | 'needs_review' | 'not_started' | 'cyan' | 'purple' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm'
}) => {
  const variantStyles = {
    mastered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    learning: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    needs_review: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    not_started: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    low: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};
