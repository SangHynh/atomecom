'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  MousePointer2,
  ShieldCheck,
  RefreshCcw,
  Database,
  Rocket,
  Layers,
  Code2,
  LayoutGrid,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Architecture() {
  const { t } = useTranslation();

  return (
    <section
      id="architecture"
      className="py-24 sm:py-32 overflow-hidden bg-muted/20 border-y border-border/40 scroll-mt-16"
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-20">
        <div className="flex flex-col items-center gap-16 lg:gap-20 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-8 sm:space-y-10"
          >
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <h3 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-primary font-heading leading-tight">
                {t('landing.arch_title')}
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground/80 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                {t('landing.arch_desc')}
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {[
                {
                  icon: <LayoutGrid className="h-5 w-5" />,
                  title: t('landing.domain_centric'),
                  desc: t('landing.domain_centric_desc'),
                  color: 'group-hover:text-warning',
                },
                {
                  icon: <MousePointer2 className="h-5 w-5" />,
                  title: t('landing.independent_view'),
                  desc: t('landing.independent_view_desc'),
                  color: 'group-hover:text-danger-soft',
                },
                {
                  icon: <ShieldCheck className="h-5 w-5" />,
                  title: t('landing.highly_testable'),
                  desc: t('landing.highly_testable_desc'),
                  color: 'group-hover:text-success',
                },
                {
                  icon: <Activity className="h-5 w-5" />,
                  title: t('landing.decoupled_arch'),
                  desc: t('landing.decoupled_arch_desc'),
                  color: 'group-hover:text-primary',
                },
                {
                  icon: <Database className="h-5 w-5" />,
                  title: t('landing.flexible_tech'),
                  desc: t('landing.flexible_tech_desc'),
                  color: 'group-hover:text-info',
                },
                {
                  icon: <Rocket className="h-5 w-5" />,
                  title: t('landing.future_proof'),
                  desc: t('landing.future_proof_desc'),
                  color: 'group-hover:text-warning',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 p-5 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] bg-background border border-border/40 group hover:border-primary/40 transition-all duration-700 cursor-pointer hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mt-1 rounded-xl sm:rounded-2xl bg-primary/10 p-2 transition-all duration-700 group-hover:bg-primary/20 group-hover:rotate-6">
                    <div
                      className={`text-primary transition-colors duration-700 ${item.color}`}
                    >
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-foreground mb-1 group-hover:text-primary transition-colors duration-700">
                      {item.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative lg:max-w-md w-full px-4 sm:px-0"
          >
            <div className="aspect-square rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-tr from-primary/80 to-primary/40 p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden group cursor-default">
              <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-3xl" />

              <div className="relative h-full flex flex-col justify-center items-center text-white space-y-6 sm:space-y-8">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="h-16 sm:h-20 w-16 sm:w-20 rounded-2xl sm:rounded-3xl border-2 border-white/20 flex items-center justify-center bg-white/10 shadow-2xl transition-all duration-700 group-hover:rotate-[25deg] group-hover:shadow-white/20"
                >
                  <Layers className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
                </motion.div>

                <div className="h-32 sm:h-40 w-32 sm:w-40 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="h-16 sm:h-20 w-16 sm:w-20 rounded-full border-2 border-white flex items-center justify-center bg-white/10 shadow-inner transition-all duration-1000 group-hover:-rotate-[45deg]">
                    <Code2 className="h-7 sm:h-9 w-7 sm:w-9 text-white" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-xl sm:text-2xl font-black tracking-[0.2em] uppercase transition-all duration-700 group-hover:tracking-[0.3em]">
                    {t('landing.ddd_title')}
                  </p>
                  <p className="text-white/80 font-bold text-xs sm:text-sm bg-white/10 px-4 py-1 rounded-full backdrop-blur-md transition-all duration-700 group-hover:bg-white/20">
                    {t('landing.ddd_desc')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
