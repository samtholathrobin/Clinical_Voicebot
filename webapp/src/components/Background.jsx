import React from 'react';

export const Background = () => (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="medical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="20" cy="20" r="8" fill="currentColor"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#medical-pattern)"/>
      </svg>
    </div>
  );