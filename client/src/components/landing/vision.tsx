'use client';

import { motion } from 'framer-motion';
import { Sparkles, MousePointer2, Rocket, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Vision() {
  const { t } = useTranslation();

  return (
    <section
      id="vision"
      className="relative py-24 sm:py-32 bg-muted/40 border-y border-border/40 scroll-mt-16"
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 sm:mb-16 text-center"
        >
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.15em] text-foreground/80 mb-3">
            {t('landing.stats_title')}
          </h3>
          <div className="h-1 w-12 sm:w-16 bg-primary/30 rounded-full mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Sparkles className="h-6 sm:h-7 w-6 sm:w-7" />,
              title: t('landing.stats_innovation'),
              desc: t('landing.stats_innovation_desc'),
              color: 'group-hover:text-amber-500',
            },
            {
              icon: <MousePointer2 className="h-6 sm:h-7 w-6 sm:w-7" />,
              title: t('landing.stats_experience'),
              desc: t('landing.stats_experience_desc'),
              color: 'group-hover:text-rose-500',
            },
            {
              icon: <Rocket className="h-6 sm:h-7 w-6 sm:w-7" />,
              title: t('landing.stats_growth'),
              desc: t('landing.stats_growth_desc'),
              color: 'group-hover:text-indigo-500',
            },
            {
              icon: <ShieldCheck className="h-6 sm:h-7 w-6 sm:w-7" />,
              title: t('landing.stats_security'),
              desc: t('landing.stats_security_desc'),
              color: 'group-hover:text-emerald-500',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                duration: 0.8,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -12, scale: 1.05 }}
              className="flex flex-col items-center gap-6 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-background border border-border/50 shadow-sm transition-all duration-700 group hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer backdrop-blur-md relative overflow-hidden"
            >
              <div
                className={`rounded-2xl sm:rounded-3xl bg-primary/5 p-4 sm:p-5 text-primary transition-all duration-700 group-hover:bg-primary/10 ${item.color} transform group-hover:scale-125 group-hover:rotate-[15deg] group-hover:shadow-lg group-hover:shadow-primary/5`}
              >
                {item.icon}
              </div>
              <div className="text-center space-y-3 sm:space-y-4 relative z-10">
                <h4 className="text-lg sm:text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-700">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed font-medium line-clamp-4 group-hover:text-muted-foreground transition-colors duration-700">
                  {item.desc}
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-center" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
