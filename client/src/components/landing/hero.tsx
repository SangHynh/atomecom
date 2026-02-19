"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Scaling 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerChildren } from "./animations";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] sm:h-screen flex items-center overflow-hidden pt-20 pb-16">
      <div className="container mx-auto max-w-7xl px-6 lg:px-16 relative w-full">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="flex flex-col items-center text-center max-w-6xl mx-auto"
        >
          <motion.div 
            variants={fadeInUp}
            className="mb-6 sm:mb-8 inline-flex h-8 items-center rounded-full border border-primary/10 bg-primary/5 px-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-primary backdrop-blur-md cursor-default transition-all duration-500 hover:border-primary/40 hover:bg-primary/10 hover:scale-105"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse" />
            {t('landing.badge')}
          </motion.div>

          <motion.h2 
            variants={fadeInUp}
            className="mb-6 sm:mb-8 text-4xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] sm:leading-[1.05] text-balance max-w-5xl"
          >
            {t('landing.title_modern')}{" "}
            <span className="text-[0.85em] bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              {t('landing.title_ecommerce')}
            </span>{" "}
            <span className="text-[0.85em]">{t('landing.title_suffix')}</span>
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="mx-auto mb-8 sm:mb-10 max-w-3xl text-sm sm:text-lg lg:text-xl text-muted-foreground/90 leading-relaxed text-balance font-medium px-4 sm:px-0"
          >
            {t('landing.description')}
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center w-full px-6 sm:px-0"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="group w-full sm:w-auto h-12 px-10 font-bold rounded-xl shadow-xl shadow-primary/20 transition-all duration-500 hover:scale-110 active:scale-95 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 border-none text-white cursor-pointer relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center">
                  {t('landing.explore_now')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2 duration-500 ease-[0.16, 1, 0.3, 1]" />
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-6 opacity-60 px-4"
          >
            {[
              { icon: <ShieldCheck className="h-4 w-4" />, label: t('landing.secure_payments'), color: "group-hover:text-blue-500" },
              { icon: <Zap className="h-4 w-4" />, label: t('landing.ultra_fast'), color: "group-hover:text-yellow-500" },
              { icon: <CheckCircle2 className="h-4 w-4" />, label: t('landing.data_integrity'), color: "group-hover:text-emerald-500" },
              { icon: <Scaling className="h-4 w-4" />, label: t('landing.ready_scaling'), color: "group-hover:text-indigo-500" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 transition-all hover:opacity-100 group cursor-default py-1">
                <div className={`transition-all duration-500 group-hover:scale-150 group-hover:rotate-12 ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-all duration-500 group-hover:tracking-[0.2em]">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
