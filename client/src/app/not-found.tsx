'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl text-center space-y-8"
      >
        {/* Error Code */}
        <div className="font-editorial text-[120px] leading-none text-foreground">
          404
        </div>

        {/* Thin Divider */}
        <div className="w-16 h-px bg-foreground/20 mx-auto" />

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-foreground">
            {t('errors.page_not_found', { defaultValue: 'Page Not Found' })}
          </h1>
          <p className="text-sm text-muted-foreground/60 font-medium max-w-md mx-auto leading-relaxed">
            {t('errors.page_not_found_desc', {
              defaultValue:
                'The page you are looking for has been moved, removed, renamed, or might never have existed in our catalog.',
            })}
          </p>
        </div>

        {/* Actions - Neo Editorial Style */}
        <div className="flex items-center justify-center gap-4 pt-8">
          <Button
            asChild
            variant="ghost"
            className="rounded-sm font-black uppercase text-[10px] tracking-[0.15em] h-11 px-6 text-muted-foreground/50 hover:text-foreground"
          >
            <button type="button" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2 -ml-1" />
              {t('common.go_back', { defaultValue: 'Go Back' })}
            </button>
          </Button>

          <Button
            asChild
            className="bg-foreground text-background hover:bg-foreground/90 rounded-sm font-black uppercase tracking-[0.15em] text-[10px] h-11 px-8 transition-transform active:scale-95"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2 -ml-1" />
              {t('common.go_home', { defaultValue: 'Return Home' })}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
