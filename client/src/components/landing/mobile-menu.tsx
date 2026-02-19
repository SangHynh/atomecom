'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'lucide-react';
import { X, Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import NextLink from 'next/link';

interface MobileMenuProps {
  navLinks: Array<{ href: string; label: string }>;
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="relative z-[60] h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] bg-background border-l border-border/40 p-8 pt-24 shadow-2xl"
            >
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    onClick={toggleMenu}
                    className="text-lg font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors py-2 border-b border-border/10"
                  >
                    {link.label}
                  </NextLink>
                ))}
              </nav>

              <div className="mt-12 pt-8 border-t border-border/40 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">
                  Account
                </p>
                <NextLink href="/login" onClick={toggleMenu} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl border-border/40 font-bold"
                  >
                    {t('nav.login')}
                  </Button>
                </NextLink>
                <NextLink
                  href="/register"
                  onClick={toggleMenu}
                  className="block"
                >
                  <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                    {t('nav.register')}
                  </Button>
                </NextLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
