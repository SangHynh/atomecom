'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserForm } from '../form/user-form';
import { User } from '@atomecom/shared';
import { cn } from '@/lib/utils';

interface UserFormOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: User;
  isLoading?: boolean;
}

export function UserFormOverlay({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: UserFormOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 lg:p-12 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/40 backdrop-blur-[24px] cursor-zoom-out"
          />

          {/* Centered Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            className={cn(
              'relative w-full h-full md:h-auto md:max-h-[85vh] max-w-2xl bg-background border-[0.5px] border-border/40 rounded-none md:rounded-md shadow-2xl overflow-hidden flex flex-col z-50',
            )}
          >
            {/* Close button */}
            <div className="absolute top-5 right-5 z-[60]">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-md bg-background/50 backdrop-blur hover:bg-foreground hover:text-background transition-all border border-border/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <UserForm
                user={initialData}
                onSubmit={onSubmit}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
