'use client';

import { motion } from 'framer-motion';
import { Globe, Code2, Server, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TechStack() {
  const { t } = useTranslation();

  return (
    <section id="tech-stack" className="py-20 sm:py-24 relative scroll-mt-16">
      <div className="container mx-auto max-w-7xl px-8 sm:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 sm:mb-20 text-center"
        >
          <h3 className="text-lg sm:text-2xl font-bold tracking-tight uppercase font-heading text-muted-foreground/50">
            {t('landing.tech_stack_title')}
          </h3>
        </motion.div>
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap justify-center gap-10 sm:gap-16 md:gap-24">
          {[
            {
              name: 'Next.js 15',
              icon: <Globe className="h-10 sm:h-12 w-10 sm:w-12" />,
              color: 'group-hover:text-foreground',
            },
            {
              name: 'TypeScript',
              icon: <Code2 className="h-10 sm:h-12 w-10 sm:w-12" />,
              color: 'group-hover:text-info',
            },
            {
              name: 'Express.js',
              icon: <Server className="h-10 sm:h-12 w-10 sm:w-12" />,
              color: 'group-hover:text-success',
            },
            {
              name: 'MongoDB',
              icon: <Database className="h-10 sm:h-12 w-10 sm:w-12" />,
              color: 'group-hover:text-success',
            },
          ].map((tech, idx) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: idx * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center gap-4 sm:gap-6 opacity-40 transition-all duration-700 hover:opacity-100 grayscale hover:grayscale-0 group cursor-pointer"
            >
              <div className="flex h-20 sm:h-24 w-20 sm:w-24 items-center justify-center rounded-2xl sm:rounded-[2rem] bg-muted/40 border border-border/40 transition-all duration-700 group-hover:bg-background group-hover:shadow-xl group-hover:border-primary/50">
                <div
                  className={`text-muted-foreground ${tech.color} transition-all duration-700`}
                >
                  {tech.icon}
                </div>
              </div>
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-all duration-700 group-hover:tracking-[0.3em]">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
