"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#vision", label: t('nav.vision') },
    { href: "#solutions", label: t('nav.solutions') },
    { href: "#architecture", label: t('nav.architecture') },
    { href: "#tech-stack", label: t('nav.tech_stack') }
  ];

  return (
    <motion.header 
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500",
        isScrolled 
          ? "border-b bg-background/70 backdrop-blur-xl py-3 shadow-sm" 
          : "border-b-transparent bg-transparent py-5"
      )}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 lg:px-12">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          aria-label="Atomecom Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-115 group-hover:rotate-[10deg] group-hover:shadow-primary/40">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-heading group-hover:text-primary transition-colors duration-500">Atomecom</h1>
        </Link>
        
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground/80 transition-all hover:text-primary rounded-lg cursor-pointer group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-1.5 left-4 right-4 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0 justify-end">
          <div className="flex items-center bg-muted/40 p-1 rounded-full border border-border/40 scale-90 sm:scale-100">
            <LanguageSelector />
            <div className="w-[1px] h-4 bg-border/40 mx-1" />
            <ThemeToggle />
          </div>

          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-9 px-5 rounded-full shadow-md shadow-primary/20 font-semibold transition-all active:scale-95 hover:scale-105 text-sm cursor-pointer duration-300">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => logout()}
              aria-label="Logout"
              className="hidden sm:flex gap-2 h-9 px-4 rounded-full border-destructive/10 text-destructive bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground text-sm cursor-pointer transition-all active:scale-95 hover:scale-105 duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-semibold">{t('nav.logout')}</span>
            </Button>
          )}

          <MobileMenu navLinks={navLinks} />
        </div>
      </div>
    </motion.header>
  );
}
