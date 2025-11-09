
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  icon: React.ReactNode;
  text: string;
  gradient?: string;
  className?: string;
  animated?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ icon, text, gradient, className, animated = false }) => {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundImage: animated ? undefined : gradient,
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
    <div style={badgeStyle} className={cn(className, animated && 'pioneer-badge-animated')}>
      <div style={iconStyle}>{icon}</div>
      <span style={textStyle}>{text}</span>
    </div>
  );
};
