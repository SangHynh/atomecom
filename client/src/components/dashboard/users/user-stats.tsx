'use client';

import React from 'react';
import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatItemProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  accentColor: string;
  glowColor: string;
  iconBg: string;
  isLoading?: boolean;
  tooltip?: string;
}

function StatItem({
  label,
  value,
  icon: Icon,
  description,
  accentColor,
  glowColor,
  iconBg,
  isLoading,
  tooltip,
}: StatItemProps) {
  if (isLoading) {
    return (
      <div className="relative rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl shadow-sm overflow-hidden p-4">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-border/30 rounded-full" />
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-24" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-2xl border bg-background/60 backdrop-blur-xl overflow-hidden group cursor-pointer transition-all duration-300',
              'hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]',
              `border-border/40 hover:border-${accentColor}/30`,
              `hover:shadow-${glowColor}/10`,
            )}
          >
            {/* Top accent line */}
            <div
              className={cn(
                'absolute inset-x-0 top-0 h-0.5 transition-all duration-300',
                `bg-gradient-to-r ${accentColor}`,
                'opacity-60 group-hover:opacity-100',
              )}
            />
            {/* Subtle glow bg */}
            <div
              className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                `bg-gradient-to-br ${glowColor} to-transparent`,
              )}
            />

            <div className="relative z-10 p-2.5 md:p-3.5 lg:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 transition-colors duration-200 truncate',
                      'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter leading-none tabular-nums">
                      {value}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground mt-1.5 truncate">
                    {description}
                  </p>
                </div>
                <div
                  className={cn(
                    'shrink-0 h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center transition-all duration-500',
                    'group-hover:scale-110 group-hover:rotate-[8deg]',
                    iconBg,
                  )}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="z-[100]">
          <p>{tooltip || `${label}: ${value}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function UserStats({
  total = 0,
  active = 0,
  banned = 0,
  deactive = 0,
  verified = 0,
  isLoading = false,
}: {
  total?: number;
  active?: number;
  banned?: number;
  deactive?: number;
  verified?: number;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('users.stats.total'),
      value: total,
      icon: Users,
      description: t('users.stats.growth_hint'),
      accentColor: 'from-primary to-primary/80',
      glowColor: 'from-primary/5',
      iconBg: 'bg-primary/20 text-primary shadow-lg shadow-primary/20',
      tooltip: t('users.stats.total_desc', {
        defaultValue: 'Total accounts registered in the system',
      }),
    },
    {
      label: t('users.stats.active'),
      value: active,
      icon: UserCheck,
      description: t('users.stats.realtime'),
      accentColor: 'from-primary to-primary/70',
      glowColor: 'from-primary/5',
      iconBg: 'bg-primary/20 text-primary shadow-lg shadow-primary/20',
      tooltip: t('users.stats.active_desc', {
        defaultValue: 'Users currently active',
      }),
    },
    {
      label: t('users.stats.verified'),
      value: verified,
      icon: ShieldCheck,
      description: `${Math.round((verified / (total || 1)) * 100)}% ${t('users.stats.of_total', { defaultValue: 'of total' })}`,
      accentColor: 'from-primary/90 to-primary/60',
      glowColor: 'from-primary/5',
      iconBg: 'bg-primary/10 text-primary shadow-lg shadow-primary/10',
      tooltip: t('users.stats.verified_desc', {
        defaultValue: 'Users who verified their email address',
      }),
    },
    {
      label: t('users.stats.restricted'),
      value: `${banned + deactive}`,
      icon: UserX,
      description: t('users.stats.security'),
      accentColor: 'from-rose-500 to-red-500',
      glowColor: 'from-rose-500/5',
      iconBg: 'bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10',
      tooltip: t('users.stats.restricted_desc', {
        banned,
        deactive,
        defaultValue: `Restricted: ${banned} Banned, ${deactive} Deactive`,
      }),
    },
  ];

  return (
    <div className="grid grid-flow-col auto-cols-[minmax(160px,1fr)] md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto pb-3 mb-3 snap-x snap-mandatory scrollbar-none">
      {stats.map((stat, i) => (
        <div key={i} className="snap-start min-w-0">
          <StatItem {...stat} isLoading={isLoading} />
        </div>
      ))}
    </div>
  );
}
