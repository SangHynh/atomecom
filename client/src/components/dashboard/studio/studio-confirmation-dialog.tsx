'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, Trash2, Info, AlertTriangle, Ban } from 'lucide-react';

interface StudioConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary' | 'ban';
  isLoading?: boolean;
}

export function StudioConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: StudioConfirmationDialogProps) {
  const Icon =
    variant === 'danger'
      ? Trash2
      : variant === 'warning'
        ? AlertTriangle
        : variant === 'info'
          ? Info
          : variant === 'ban'
            ? Ban
            : AlertCircle;

  const colors = {
    danger:
      'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
    warning:
      'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
    primary:
      'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
    ban: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
  };

  const buttonClass = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
    info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    ban: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-sm p-0 overflow-hidden border-[0.5px] border-border/40 shadow-none bg-background/95 backdrop-blur-xl z-[200]">
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={cn(
                'h-16 w-16 rounded-sm flex items-center justify-center border-[0.5px] animate-in zoom-in-50 duration-300',
                colors[variant],
              )}
            >
              <Icon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold tracking-tight uppercase leading-none">
                {title}
              </DialogTitle>
              <DialogDescription
                asChild
                className="text-[11px] font-bold text-muted-foreground/70 leading-relaxed px-4"
              >
                <div>{description}</div>
              </DialogDescription>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 p-4 grid grid-cols-2 gap-3 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-md font-bold text-[10px] uppercase tracking-wide active:scale-95 transition-all h-11 border border-border/10 hover:bg-muted/50 shadow-none text-muted-foreground"
            disabled={isLoading}
          >
            {cancelText || 'Hủy'}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'rounded-md font-bold text-[10px] uppercase tracking-wide active:scale-95 transition-all border border-transparent shadow-none h-11',
              buttonClass[variant],
            )}
            disabled={isLoading}
          >
            {isLoading ? '...' : confirmText || 'Xác nhận'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
