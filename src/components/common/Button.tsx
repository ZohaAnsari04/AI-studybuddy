import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2.5 text-sm font-semibold gap-2',
    lg: 'px-6 py-3.5 text-base font-bold gap-3'
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30 glow-cyan',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 light:bg-slate-100 light:text-slate-900 light:hover:bg-slate-200',
    outline:
      'bg-transparent border border-slate-700 text-slate-200 hover:border-cyan-500 hover:text-cyan-300 light:border-slate-300 light:text-slate-800',
    ghost:
      'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white light:hover:bg-slate-200/60 light:text-slate-700',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-block">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
