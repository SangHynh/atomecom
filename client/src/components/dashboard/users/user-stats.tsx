'use client';

import React from 'react';
import { Users, UserCheck, UserX, ShieldCheck, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  color: string;
  isLoading?: boolean;
  tooltip?: string;
}

function StatItem({
  label,
  value,
  icon: Icon,
  description,
  color,
  isLoading,
  tooltip,
}: StatItemProps) {
  if (isLoading) {
    return (
      <Card className="border-border/40 bg-background/40 backdrop-blur-xl shadow-sm overflow-hidden p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="border-border/40 bg-background/40 backdrop-blur-xl shadow-sm overflow-hidden group hover:border-primary/30 transition-all duration-300 relative cursor-pointer active:scale-[0.98] w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 group-hover:text-primary transition-colors truncate">
                      {label}
                    </p>
                    <Info className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
                  </div>
                  <div className="flex items-baseline gap-2 truncate">
                    <h3 className="text-2xl font-black tracking-tighter truncate group-hover:scale-105 transition-transform origin-left">
                      {value}
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground opacity-70 truncate px-1.5 py-0.5 rounded-full bg-muted/50">
                      {description}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 shrink-0',
                    color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="z-[100]">
          <p>{tooltip || `${label}: ${value} (${description})`}</p>
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatItem
        label={t('users.stats.total')}
        value={total}
        icon={Users}
        description={t('users.stats.growth_hint')}
        color="bg-blue-600/10 text-blue-600 shadow-blue-500/5"
        isLoading={isLoading}
        tooltip={t('users.stats.total_desc', {
          defaultValue: 'Total accounts registered in the system',
        })}
      />
      <StatItem
        label={t('users.stats.active')}
        value={active}
        icon={UserCheck}
        description={t('users.stats.realtime')}
        color="bg-emerald-600/10 text-emerald-600 shadow-emerald-500/5"
        isLoading={isLoading}
        tooltip={t('users.stats.active_desc', {
          defaultValue:
            'Users currently online or active within the last 5 minutes',
        })}
      />
      <StatItem
        label={t('users.stats.verified')}
        value={verified}
        icon={ShieldCheck}
        description={`${Math.round((verified / (total || 1)) * 100)}%`}
        color="bg-indigo-600/10 text-indigo-600 shadow-indigo-500/5"
        isLoading={isLoading}
        tooltip={t('users.stats.verified_desc', {
          defaultValue:
            'Users who have successfully verified their email address',
        })}
      />
      <StatItem
        label={t('users.stats.restricted')}
        value={`${banned} | ${deactive}`}
        icon={UserX}
        description={t('users.stats.security')}
        color="bg-rose-600/10 text-rose-600 shadow-rose-500/5"
        isLoading={isLoading}
        tooltip={t('users.stats.restricted_desc', {
          banned,
          deactive,
          defaultValue: `Restricted: ${banned} Banned, ${deactive} Deactive`,
        })}
      />
    </div>
  );
}
