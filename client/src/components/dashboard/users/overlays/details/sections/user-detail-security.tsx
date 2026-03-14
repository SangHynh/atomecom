'use client';

import React from 'react';
import { ShieldCheck, Globe, Laptop, Terminal, Clock } from 'lucide-react';
import { User } from '@atomecom/shared';
import { Badge } from '@/components/ui/badge';
import { parseUserAgent } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserDetailSecurityProps {
  user: User;
}

export function UserDetailSecurity({ user }: UserDetailSecurityProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary/60" />
          {t('users.details.security_session')}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
      </div>

      <div className="rounded-[var(--radius)] border border-border/40 bg-background/60 overflow-hidden divide-y divide-border/20 ring-1 ring-border/10">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-info/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-info" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                {t('users.details.ip')}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground">
                {user.lastIp || 'N/A'}
              </div>
            </div>
          </div>
          {user.isOnline ? (
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-1.5 py-0 border-primary/20 bg-primary/5 text-primary animate-pulse shadow-none"
            >
              ONLINE
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-1.5 py-0 border-border/10 opacity-70"
            >
              OFFLINE
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center">
              <Laptop className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                {t('users.details.device')}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground truncate max-w-[40vw] sm:max-w-[200px]">
                {user.lastDevice ? (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dotted border-muted-foreground/50">
                          {(() => {
                            const { browser, os } = parseUserAgent(
                              user.lastDevice,
                            );
                            return `${browser} on ${os}`;
                          })()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] whitespace-normal break-all">
                        <p className="text-xs font-medium">{user.lastDevice}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </div>
          <Terminal className="h-3 w-3 text-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                {t('users.details.last_login_at')}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground">
                {user.lastLoginAt
                  ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm:ss')
                  : 'N/A'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground">
            {user.lastLoginAt &&
              formatDistanceToNow(new Date(user.lastLoginAt), {
                addSuffix: true,
              })}
          </span>
        </div>
      </div>
    </div>
  );
}





