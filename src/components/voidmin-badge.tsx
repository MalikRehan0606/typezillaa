
"use client";

import React from 'react';
import { Code } from 'lucide-react';

export const VoidminBadge: React.FC = () => {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'white',
    fontSize: '10.8px',
    fontWeight: 400,
    height: '19.425px',
    borderRadius: '4px',
    textShadow: '0 1px 1px rgba(0,0,0,0.25)',
  };

  const iconStyle: React.CSSProperties = {
    padding: '0 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9.72px',
    fontWeight: 900,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.1)',
  };

  const textStyle: React.CSSProperties = {
    padding: '0 6.75px',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={badgeStyle} className="voidmin-badge-animated">
      <div style={iconStyle}><Code size={10} /></div>
      <span style={textStyle}>Voidmin</span>
    </div>
  );
};
