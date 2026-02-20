'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AdminHeader } from '@/components/dashboard/header';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGuard from '@/components/providers/auth-guard';
import { USER_ROLE } from '@atomecom/shared';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <AuthGuard allowedRoles={[USER_ROLE.ADMIN, USER_ROLE.OWNER]}>
      <div className="flex h-screen bg-background overflow-hidden relative">
        {/* Mobile-only Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-3 left-4 z-[45] p-2 hover:bg-muted/30 rounded-xl transition-colors text-muted-foreground flex items-center justify-center w-10 h-10 group"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <AnimatePresence initial={false}>
              {sidebarOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>

        {/* Sidebar - Desktop & Mobile */}
        <Sidebar
          isOpen={sidebarOpen}
          toggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            'flex flex-col flex-1 w-0 overflow-hidden relative transition-all duration-300',
            sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]',
          )}
        >
          <AdminHeader
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            isOpen={sidebarOpen}
          />

          <main className="flex-1 overflow-hidden focus:outline-none">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                key="dashboard-content"
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
