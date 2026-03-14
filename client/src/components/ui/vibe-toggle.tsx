'use client';

import * as React from 'react';
import { Palette, Check } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VIBES = [
  { id: 'default', name: 'Brutalist', desc: 'Sắc sảo, thực dụng' },
  { id: 'soft', name: 'Modern Soft', desc: 'Bo tròn, thân thiện' },
  { id: 'luxury', name: 'Luxury Noir', desc: 'Sang trọng, khoảng lặng' },
  { id: 'gothic', name: 'Gothic Noir', desc: 'Ma mị & Góc cạnh' },
];

export function VibeToggle() {
  const [currentVibe, setCurrentVibe] = React.useState('default');

  React.useEffect(() => {
    const savedVibe = localStorage.getItem('app-vibe') || 'default';
    setCurrentVibe(savedVibe);
    document.documentElement.setAttribute('data-vibe', savedVibe);
  }, []);

  const setThemeVibe = (vibe: string) => {
    setCurrentVibe(vibe);
    document.documentElement.setAttribute('data-vibe', vibe);
    localStorage.setItem('app-vibe', vibe);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-9 w-9 flex items-center justify-center hover:bg-muted/30 transition-all rounded-[var(--radius)] group relative">
          <Palette className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
          <span className="sr-only">Toggle vibe</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-[var(--radius)] border border-border/40 shadow-none bg-background/95 backdrop-blur-xl p-1.5"
      >
        <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 px-3 py-2.5">
          Chọn phong cách (Vibe)
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/10 mx-2" />
        
        {VIBES.map((vibe) => (
          <DropdownMenuItem
            key={vibe.id}
            onClick={() => setThemeVibe(vibe.id)}
            className="focus:bg-foreground focus:text-background rounded-[var(--radius)] cursor-pointer px-3 py-2 transition-colors flex items-center justify-between group"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-wide">
                {vibe.name}
              </span>
              <span className="text-[8px] opacity-40 font-bold uppercase tracking-tight group-focus:opacity-60 transition-opacity">
                {vibe.desc}
              </span>
            </div>
            {currentVibe === vibe.id && <Check className="h-3 w-3 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
