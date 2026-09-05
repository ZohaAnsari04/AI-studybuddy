import React from 'react';

export interface AskAIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  onClick?: () => void;
}

export const RobotIcon: React.FC<{ className?: string }> = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${className}`}
    aria-hidden="true"
  >
    {/* Antenna stalk & node */}
    <path
      d="M10 2.25V4.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="stroke-slate-400 group-hover:stroke-slate-300 transition-colors duration-150"
    />
    <circle
      cx="10"
      cy="2"
      r="1"
      className="fill-slate-400 group-hover:fill-cyan-400 transition-colors duration-150"
    />

    {/* Subtle ears / side tabs */}
    <path
      d="M2.5 10.75C2.5 10.06 2.8 9.5 3.5 9.5M17.5 10.75C17.5 10.06 17.2 9.5 16.5 9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="stroke-slate-500 group-hover:stroke-slate-400 transition-colors duration-150"
    />

    {/* Rounded robot head */}
    <rect
      x="3.25"
      y="4.75"
      width="13.5"
      height="11.5"
      rx="3.25"
      stroke="currentColor"
      strokeWidth="1.5"
      className="stroke-slate-300 group-hover:stroke-slate-100 transition-colors duration-150"
    />

    {/* Subtle blue/cyan eyes */}
    <circle
      cx="7.5"
      cy="10.25"
      r="1.25"
      className="fill-cyan-400 group-hover:fill-cyan-300 transition-colors duration-150"
    />
    <circle
      cx="12.5"
      cy="10.25"
      r="1.25"
      className="fill-cyan-400 group-hover:fill-cyan-300 transition-colors duration-150"
    />

    {/* Friendly minimal mouth */}
    <path
      d="M8.5 13.5C9 14 11 14 11.5 13.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className="stroke-slate-400 group-hover:stroke-slate-200 transition-colors duration-150"
    />
  </svg>
);

export const AskAIButton: React.FC<AskAIButtonProps> = ({
  className = '',
  onClick,
  disabled,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 h-9 px-3.5 py-1.5 rounded-[11px] bg-[#0c131d] hover:bg-[#141e2e] active:bg-[#0a1018] active:scale-[0.98] border border-[#1e2a3b] hover:border-[#2e4057] text-[13px] font-medium text-slate-200 hover:text-white shadow-sm shadow-black/40 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out ${className}`}
      style={{
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
      {...rest}
    >
      <RobotIcon className="w-[18px] h-[18px] text-slate-300" />
      <span className="leading-none tracking-normal">Ask AI</span>
    </button>
  );
};

export default AskAIButton;
