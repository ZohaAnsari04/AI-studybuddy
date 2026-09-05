import React from 'react';
import './GlareHover.css';

export interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const GlareHover: React.FC<GlareHoverProps> = ({
  width = '100%',
  height = '100%',
  background = 'rgba(15, 28, 34, 0.65)',
  borderRadius = '16px',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {},
  onClick
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const isFlex = className.includes('flex');

  const vars = {
    '--gh-width': width,
    '--gh-height': height,
    '--gh-bg': background,
    '--gh-br': borderRadius,
    '--gh-angle': `${glareAngle}deg`,
    '--gh-duration': `${transitionDuration}ms`,
    '--gh-size': `${glareSize}%`,
    '--gh-rgba': rgba,
    '--gh-border': borderColor
  } as React.CSSProperties;

  return (
    <div
      onClick={onClick}
      className={`glare-hover ${isFlex ? 'glare-hover--flex' : ''} ${playOnce ? 'glare-hover--play-once' : ''} ${className}`}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
};

export default GlareHover;
