import React from 'react';
import { SpecularButton } from './SpecularButton';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  lineColor?: string;
  baseColor?: string;
  tint?: string;
  tintOpacity?: number;
  intensity?: number;
  followMouse?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  lineColor,
  baseColor,
  tint,
  tintOpacity,
  intensity,
  followMouse = true,
  ...props
}) => {
  const variantConfig = {
    primary: {
      lineColor: lineColor || '#00f2fe',
      baseColor: baseColor || '#0284c7',
      textColor: '#ffffff',
      tint: tint || '#0284c7',
      tintOpacity: tintOpacity !== undefined ? tintOpacity : 0.25,
      blur: 8,
      className: 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 glow-cyan'
    },
    secondary: {
      lineColor: lineColor || '#38bdf8',
      baseColor: baseColor || '#1e293b',
      textColor: '#67e8f9',
      tint: tint || '#0f172a',
      tintOpacity: tintOpacity !== undefined ? tintOpacity : 0.7,
      blur: 12,
      className: 'bg-slate-900/80 hover:bg-slate-800/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60'
    },
    outline: {
      lineColor: lineColor || '#00f2fe',
      baseColor: baseColor || '#334155',
      textColor: '#e2e8f0',
      tint: tint || '#0f172a',
      tintOpacity: tintOpacity !== undefined ? tintOpacity : 0.3,
      blur: 6,
      className: 'bg-slate-950/40 hover:bg-slate-900/50 border border-slate-700 text-slate-200 hover:border-cyan-500 hover:text-cyan-300'
    },
    ghost: {
      lineColor: lineColor || '#94a3b8',
      baseColor: baseColor || '#334155',
      textColor: '#cbd5e1',
      tint: tint || '#ffffff',
      tintOpacity: tintOpacity !== undefined ? tintOpacity : 0.05,
      blur: 0,
      className: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white'
    },
    danger: {
      lineColor: lineColor || '#f43f5e',
      baseColor: baseColor || '#881337',
      textColor: '#ffffff',
      tint: tint || '#e11d48',
      tintOpacity: tintOpacity !== undefined ? tintOpacity : 0.3,
      blur: 8,
      className: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/30 border border-rose-400/40'
    }
  };

  const currentVariant = variantConfig[variant];

  return (
    <SpecularButton
      size={size}
      radius={size === 'sm' ? 10 : size === 'lg' ? 16 : 12}
      lineColor={currentVariant.lineColor}
      baseColor={currentVariant.baseColor}
      textColor={currentVariant.textColor}
      tint={currentVariant.tint}
      tintOpacity={currentVariant.tintOpacity}
      blur={currentVariant.blur}
      intensity={intensity !== undefined ? intensity : 1.2}
      shineSize={12}
      shineFade={35}
      thickness={1.2}
      speed={0.4}
      followMouse={followMouse}
      proximity={220}
      icon={icon}
      disabled={disabled}
      className={`${currentVariant.className} ${className}`}
      {...props}
    >
      {children}
    </SpecularButton>
  );
};

export default Button;
