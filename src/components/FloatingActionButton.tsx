'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon = '+', 
  className = '' 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-blue-600 hover:bg-blue-700
        text-white text-xl font-bold
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        transition-all duration-200
        border-none
        ${className}
      `}
      size="icon"
    >
      {icon}
    </Button>
  );
}