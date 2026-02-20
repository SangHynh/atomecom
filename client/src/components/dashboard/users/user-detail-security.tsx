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
    <div className="space-y-4 pt-2 px-2">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80">
          {t('users.details.security_session')}
        </h3>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden divide-y divide-border/30">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                {t('users.details.ip')}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                {user.lastIp || 'N/A'}
              </div>
            </div>
          </div>
          {user.isOnline ? (
            <Badge
              variant="outline"
              className="text-[8px] font-black px-1.5 py-0 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 animate-pulse"
            >
              ONLINE
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[8px] font-black px-1.5 py-0 border-border/50 opacity-50"
            >
              OFFLINE
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Laptop className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                {t('users.details.device')}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground truncate max-w-[200px]">
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
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                {t('users.details.last_login_at')}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                {user.lastLoginAt
                  ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm:ss')
                  : 'N/A'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground opacity-50">
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
