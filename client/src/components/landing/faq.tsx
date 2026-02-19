"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "./animations";

export function FAQ() {
  const { t } = useTranslation();

  const faqs = [
    { q: t('landing.faq_q1'), a: t('landing.faq_a1') },
    { q: t('landing.faq_q2'), a: t('landing.faq_a2') },
    { q: t('landing.faq_q3'), a: t('landing.faq_a3') },
    { q: t('landing.faq_q4'), a: t('landing.faq_a4') },
    { q: t('landing.faq_q5'), a: t('landing.faq_a5') },
    { q: t('landing.faq_q6'), a: t('landing.faq_a6') },
    { q: t('landing.faq_q7'), a: t('landing.faq_a7') },
    { q: t('landing.faq_q8'), a: t('landing.faq_a8') },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 relative bg-muted/10">
      <div className="container mx-auto max-w-4xl px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t('landing.faq_title')}</h3>
          <p className="text-muted-foreground/70 font-medium">{t('landing.faq_desc')}</p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-2xl bg-background border border-border/40 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 group"
            >
              <h4 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{faq.q}</h4>
              <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
