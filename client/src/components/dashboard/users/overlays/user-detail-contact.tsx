'use client';

import React from 'react';
import {
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  Zap,
  MapPin,
  Copy,
} from 'lucide-react';
import { User, USER_ROLE } from '@atomecom/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, maskEmail, maskPhone } from '@/lib/utils';
import { format } from 'date-fns';
import { MaskedContactRow } from '../views/masked-contact-row';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface UserDetailContactProps {
  user: User;
  currentUser: User | null;
}

export function UserDetailContact({
  user,
  currentUser,
}: UserDetailContactProps) {
  const { t } = useTranslation();
  const [showEmail, setShowEmail] = React.useState(false);
  const [showPhone, setShowPhone] = React.useState(false);

  const canViewSensitive = React.useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === USER_ROLE.OWNER) return true;
    if (currentUser.role === USER_ROLE.ADMIN && user.role === USER_ROLE.USER)
      return true;
    return false;
  }, [currentUser, user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied', { defaultValue: 'Copied to clipboard' }));
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0">
            {t('users.details.contact')}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
        </div>
        <div className="space-y-3">
          <MaskedContactRow
            icon={<Mail className="h-4 w-4" />}
            label={t('users.details.email')}
            value={user.email}
            maskedValue={maskEmail(user.email)}
            canView={canViewSensitive}
            isVisible={showEmail}
            onToggleVisible={() => setShowEmail(!showEmail)}
            onCopy={copyToClipboard}
          />
          <MaskedContactRow
            icon={<Phone className="h-4 w-4" />}
            label={t('users.details.phone')}
            value={user.phone}
            maskedValue={maskPhone(user.phone || '')}
            canView={canViewSensitive}
            isVisible={showPhone}
            onToggleVisible={() => setShowPhone(!showPhone)}
            onCopy={copyToClipboard}
            fallback={t('users.details.not_provided')}
          />
        </div>
      </div>

      {/* Account Metadata */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0">
            {t('users.details.metadata')}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-sm bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-blue-600" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">
                {t('users.table.columns.joined')}
              </p>
            </div>
            <p className="text-xs font-bold">
              {format(new Date(user.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <div
            className="p-3 rounded-sm bg-muted/30 border border-border/30 group cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => copyToClipboard(user.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">
                  {t('users.details.user_id')}
                </p>
              </div>
              <Copy className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-mono font-semibold truncate">
              {user.id}
            </p>
          </div>
        </div>

        {/* Account Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border/10 bg-muted/5 hover:bg-muted/10 transition-all p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-wide">
              <ShoppingBag className="h-3 w-3" />
              {t('users.details.usage')}
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase">
                  {t('users.details.orders')}
                </span>
                <span className="text-[13px] font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase">
                  {t('users.details.spent')}
                </span>
                <span className="text-[13px] font-bold text-primary">
                  $1,250.00
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/10 bg-muted/5 hover:bg-muted/10 transition-all p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px] uppercase tracking-wide">
              <Zap className="h-3 w-3" />
              {t('users.details.value')}
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                <div className="text-[20px] font-bold tracking-tight line-height-1">
                  VIP
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/40">
                  {t('users.details.tier')}
                </div>
              </div>
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] font-bold px-1.5 py-0 shadow-none">
                98% SCORE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0">
            {t('users.details.addresses')}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
        </div>
        {user.addresses && user.addresses.length > 0 ? (
          <div className="space-y-3">
            {user.addresses.map((address: any, index: number) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-md border transition-all',
                  address.isDefault
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-border/10 opacity-70 hover:opacity-100',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-sm flex items-center justify-center shrink-0',
                        address.isDefault ? 'bg-blue-600/20' : 'bg-muted/50',
                      )}
                    >
                      <MapPin
                        className={cn(
                          'h-4 w-4',
                          address.isDefault
                            ? 'text-blue-600'
                            : 'text-muted-foreground',
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold leading-none">
                        {address.street}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {address.city}
                      </p>
                    </div>
                  </div>
                  {address.isDefault && (
                    <Badge className="h-4 bg-primary text-background border-none text-[8px] font-bold px-1.5 uppercase tracking-wide leading-none shadow-none">
                      {t('users.details.default')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 rounded-sm border border-dashed border-border/50 bg-muted/5 opacity-50">
            <MapPin className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('users.details.no_addresses')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
