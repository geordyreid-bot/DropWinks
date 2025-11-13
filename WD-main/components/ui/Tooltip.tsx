
import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  return (
    <span className={`relative group inline-block ${className}`}>
      {children}
      <span 
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-brand-secondary-800 text-white text-xs rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
      >
        {content}
        <svg className="absolute text-brand-secondary-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </span>
    </span>
  );
};
