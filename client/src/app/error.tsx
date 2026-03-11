'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg border border-destructive/20 bg-destructive/5 rounded-sm p-8 md:p-12 text-center shadow-2xl shadow-destructive/5 relative overflow-hidden"
      >
        {/* Top styling bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-destructive/40" />

        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-sm flex items-center justify-center mb-6">
          <TriangleAlert className="w-6 h-6 text-destructive/80" />
        </div>

        <h2 className="font-editorial text-3xl text-foreground mb-4">
          {t('errors.system_crash', { defaultValue: 'System Exception' })}
        </h2>

        <p className="text-sm text-muted-foreground/70 mb-8 leading-relaxed">
          {t('errors.system_crash_desc', {
            defaultValue:
              'Our core architecture encountered an unexpected block while rendering this interface. Please try refreshing.',
          })}
        </p>

        {/* Technical digest print mechanism */}
        {error.digest && (
          <div className="mb-8 p-3 bg-background/50 border border-border/50 rounded-sm text-left">
            <p className="text-[10px] font-black uppercase text-muted-foreground/40 mb-1">
              Error Digest
            </p>
            <code className="text-xs font-mono text-destructive/80 break-all">
              {error.digest}
            </code>
          </div>
        )}

        <Button
          onClick={() => reset()}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-sm font-black uppercase tracking-[0.15em] text-[10px] h-11 px-8 w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.try_again', { defaultValue: 'Try Again' })}
        </Button>
      </motion.div>
    </div>
  );
}
