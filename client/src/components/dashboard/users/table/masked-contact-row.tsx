'use client';

import React from 'react';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaskedContactRowProps {
  /** Icon element shown in the icon box */
  icon: React.ReactNode;
  /** Field label */
  label: string;
  /** Raw value (for copy-to-clipboard) */
  value: string | undefined;
  /** Display value when hidden */
  maskedValue: string;
  /** Whether the current user can reveal/copy sensitive data */
  canView: boolean;
  /** Whether the value is currently revealed */
  isVisible: boolean;
  /** Toggle reveal state */
  onToggleVisible: () => void;
  /** Copy raw value to clipboard */
  onCopy: (v: string) => void;
  /** Fallback text when value is not provided */
  fallback?: string;
}

/**
 * A contact info row with masked display, reveal toggle, and copy-to-clipboard.
 * Used for email and phone in UserDetailSheet.
 */
export function MaskedContactRow({
  icon,
  label,
  value,
  maskedValue,
  canView,
  isVisible,
  onToggleVisible,
  onCopy,
  fallback = '—',
}: MaskedContactRowProps) {
  const displayValue = value ? (isVisible ? value : maskedValue) : fallback;

  return (
    <div className="flex items-center gap-3 group">
      <div className="h-9 w-9 rounded-[var(--radius)] bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <span className="text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">{displayValue}</p>
          {canView && value && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-transparent hover:text-primary"
                onClick={onToggleVisible}
              >
                {isVisible ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              {isVisible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-transparent hover:text-primary"
                  onClick={() => onCopy(value)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





