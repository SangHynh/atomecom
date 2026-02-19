"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Settings2, Zap, BarChart3, Layers, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Solutions() {
  const { t } = useTranslation();

  return (
    <section id="solutions" className="py-24 sm:py-32 relative">
      <div className="container mx-auto max-w-7xl px-6 lg:px-20">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 sm:mb-16 text-center max-w-2xl mx-auto"
        >
          <h3 className="mb-4 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground font-heading">{t('landing.solutions_title')}</h3>
          <p className="text-sm sm:text-base text-muted-foreground/70 font-medium leading-relaxed px-4">
            {t('landing.solutions_desc')}
          </p>
        </motion.div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { 
              icon: <ShieldCheck className="h-6 w-6" />, 
              title: t('landing.auth_title'), 
              desc: t('landing.auth_desc'),
              color: "group-hover:text-blue-500"
            },
            { 
              icon: <Settings2 className="h-6 w-6" />, 
              title: t('landing.module_title'), 
              desc: t('landing.module_desc'),
              color: "group-hover:text-indigo-500"
            },
            { 
              icon: <Zap className="h-6 w-6" />, 
              title: t('landing.api_title'), 
              desc: t('landing.api_desc'),
              color: "group-hover:text-yellow-500"
            },
            { 
              icon: <BarChart3 className="h-6 w-6" />, 
              title: t('landing.analytics_title'), 
              desc: t('landing.analytics_desc'),
              color: "group-hover:text-rose-500"
            },
            { 
              icon: <Layers className="h-6 w-6" />, 
              title: t('landing.manage_title'), 
              desc: t('landing.manage_desc'),
              color: "group-hover:text-emerald-500"
            },
            { 
              icon: <Share2 className="h-6 w-6" />, 
              title: t('landing.integrate_title'), 
              desc: t('landing.integrate_desc'),
              color: "group-hover:text-sky-500"
            }
          ].map((solution, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="group relative h-full overflow-hidden border border-border/50 bg-background/50 backdrop-blur-md shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 rounded-[1.5rem] sm:rounded-[2rem] cursor-pointer hover:-translate-y-2 sm:hover:-translate-y-4">
                <CardHeader className="pt-8 sm:pt-10 pb-4 relative z-10">
                  <div className={`mb-4 sm:mb-6 flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-muted transition-all duration-700 group-hover:bg-primary/10 ${solution.color} group-hover:scale-125 group-hover:rotate-[10deg] group-hover:shadow-xl group-hover:shadow-primary/5`}>
                    {solution.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold tracking-tight transition-colors duration-700 group-hover:text-primary">{solution.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] sm:text-xs text-muted-foreground/80 font-medium leading-relaxed pb-8 sm:pb-10 relative z-10">
                  {solution.desc}
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-center" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
