'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface StudioSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export function StudioSearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm nội dung...',
  className,
  containerClassName,
}: StudioSearchInputProps) {
  return (
    <div className={cn('relative group flex-1', containerClassName)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-foreground/40 transition-colors z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'pl-11 pr-10 h-11 border-[0.5px] border-border/40 bg-transparent rounded-sm focus-visible:ring-0 focus-visible:border-foreground/30 transition-all font-medium text-sm placeholder:text-muted-foreground/20 shadow-none hover:border-border/60',
          className,
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-sm hover:bg-muted/10 text-muted-foreground/40 animate-in fade-in scale-95 duration-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
