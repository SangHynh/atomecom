'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { LanguageSelector } from '@/components/language-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function EcommerceNavbar() {
  const { isAuthenticated, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md py-2 border-border/50 shadow-md'
          : 'bg-transparent py-4',
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl italic mt-0.5 ml-0.5">
              A
            </span>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic hidden md:block">
            Atomecom
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 ml-8">
          <Link
            href="/shop"
            className="text-xs font-black uppercase tracking-widest italic hover:text-primary transition-colors"
          >
            Cửa hàng
          </Link>
        </div>

        {/* Search - Desktop */}
        <div className="hidden lg:flex flex-1 max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm kiếm sản phẩm đẳng cấp..."
            className="w-full pl-10 h-10 rounded-full bg-muted/50 border-transparent focus:bg-background transition-all focus:ring-primary/20"
          />
        </div>

        {/* Links & Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <LanguageSelector />

          <div className="hidden md:flex items-center gap-1 border-l border-border/50 pl-4 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
            >
              <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-primary text-[10px] font-bold text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center border-2 border-background">
                0
              </span>
            </Button>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="gap-2 rounded-full px-2 pr-4 bg-muted/50 hover:bg-muted ml-2"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  {user?.name?.charAt(0)}
                </div>
                <span className="text-xs font-bold truncate max-w-[80px]">
                  {user?.name}
                </span>
              </Button>
            ) : (
              <Button
                asChild
                variant="default"
                className="rounded-full px-6 ml-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
              >
                <Link href="/login">Tham gia</Link>
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
