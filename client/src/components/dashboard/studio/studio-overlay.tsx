'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudioOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-7xl'
  sidePanelWidth?: string; // e.g. 'md:w-2/5'
  leftClassName?: string;
  rightClassName?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  reverseLayout?: boolean;
}

export function StudioOverlay({
  isOpen,
  onClose,
  leftContent,
  rightContent,
  maxWidth = 'max-w-7xl',
  sidePanelWidth = 'md:w-[350px] lg:w-[400px]',
  leftClassName,
  rightClassName,
  onBack,
  showBackButton = false,
  reverseLayout = false,
}: StudioOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 lg:p-12 overflow-hidden"
        >
          {/* Backdrop with extreme blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/40 backdrop-blur-[40px] cursor-zoom-out"
          />

          {/* Studio Container */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            className={cn(
              'relative w-full h-full md:h-[90vh] bg-background/80 border-[0.5px] border-border/40 rounded-none md:rounded-sm shadow-none overflow-hidden flex flex-col',
              reverseLayout ? 'md:flex-row-reverse' : 'md:flex-row',
              maxWidth,
            )}
          >
            {/* Header / Desktop Controls */}
            <div className="absolute top-5 right-5 z-50 flex gap-2">
              {showBackButton && onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-sm bg-background/50 hover:bg-muted font-bold uppercase tracking-widest text-[9px] gap-1.5 px-3 h-8 shadow-none border-[0.5px] border-border/40"
                  onClick={onBack}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Trở lại
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-sm bg-background/50 hover:bg-foreground hover:text-background backdrop-blur transition-all shadow-none h-8 w-8 border-[0.5px] border-border/40"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Left Column */}
            <div
              className={cn(
                'relative bg-muted/10 overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-border/40 overflow-y-auto custom-scrollbar transition-all duration-500',
                sidePanelWidth,
                leftClassName,
              )}
            >
              {leftContent}
            </div>

            {/* Right Column */}
            <div
              className={cn(
                'overflow-y-auto custom-scrollbar bg-background/40 backdrop-blur-sm relative flex-1 min-h-0',
                rightClassName,
              )}
            >
              {rightContent}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
