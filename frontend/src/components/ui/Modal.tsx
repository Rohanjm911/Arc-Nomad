'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
    >
      <div
        className={twMerge(
          clsx(
            'w-full rounded-[28px] bg-[#16161c]/95 backdrop-blur-2xl border border-white/[0.12] p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)] relative overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col',
            maxWidths[maxWidth]
          )
        )}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pt-4 pr-1 scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
};
