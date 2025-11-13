import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="currentColor" className="text-brand-primary-400"/>
                    <stop offset="100%" stopColor="currentColor" className="text-brand-accent-400"/>
                </linearGradient>
            </defs>
             <path d="M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10Z" stroke="url(#logoGradient)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
             <path d='M58 60 C 58 66, 68 66, 68 60' stroke='url(#logoGradient)' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
        </svg>
      <span className="text-xl font-bold text-brand-text-primary tracking-tight">
          WinkDrops
      </span>
    </div>
  );
};