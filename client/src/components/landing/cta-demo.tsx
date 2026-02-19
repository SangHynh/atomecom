"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import emailjs from "@emailjs/browser";

export function CtaDemo() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey || serviceId === "your_service_id") {
      // Fallback for demo/missing keys
      setTimeout(() => {
        toast.info("EmailJS keys not configured. Sending simulated request...");
        toast.success(t("landing.cta_success"));
        setEmail("");
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    try {
      const templateParams = {
        user_email: email,
        request_type: "Admin Demo Access",
        submitted_at: new Date().toLocaleString(),
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      toast.success(t("landing.cta_success"));
      setEmail("");
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-[2.5rem] p-8 sm:p-16 border border-primary/20 bg-background/40 backdrop-blur-xl shadow-2xl shadow-primary/5 text-center relative overflow-hidden"
        >
          {/* Subtle pattern */}
          <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Experience</span>
          </motion.div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t("landing.cta_title")}
          </h2>
          
          <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("landing.cta_desc")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative z-10">
            <div className="relative flex-1 group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="email"
                placeholder={t("landing.cta_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12 h-14 bg-background/50 border-primary/20 focus:border-primary/40 focus:ring-primary/10 rounded-2xl text-base transition-all"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {t("landing.cta_button")}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground/50">
            Bằng cách đăng ký, bạn đồng ý với các điều khoản bảo mật của chúng tôi.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
