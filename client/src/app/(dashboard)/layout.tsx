'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AdminHeader } from '@/components/dashboard/header';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGuard from '@/components/providers/auth-guard';
import { USER_ROLE } from '@atomecom/shared';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthGuard allowedRoles={[USER_ROLE.ADMIN, USER_ROLE.OWNER]}>
      <div className="flex h-screen bg-muted/30 overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar
          isOpen={sidebarOpen}
          toggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 relative overflow-hidden focus:outline-none">
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
