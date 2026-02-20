'use client';

import { EcommerceNavbar } from '@/components/ecommerce/navbar';
import { EcommerceHero } from '@/components/ecommerce/hero';
import { CategorySpotlight } from '@/components/ecommerce/category-spotlight';
import { BentoGridShowcase } from '@/components/ecommerce/bento-grid';
import { FlashSale } from '@/components/ecommerce/flash-sale';
import { TrendingTabs } from '@/components/ecommerce/trending-tabs';
import { TrustBadges } from '@/components/ecommerce/trust-badges';
import { RecentlyViewed } from '@/components/ecommerce/recently-viewed';
import { motion } from 'framer-motion';

export default function EcommerceHomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <EcommerceNavbar />

      <main>
        {/* Hero Section */}
        <div className="pt-24 pb-8">
          <EcommerceHero bannerImage="/ecommerce_hero_banner_1771597616570.png" />
        </div>

        {/* 1. Category Spotlight */}
        <CategorySpotlight />

        {/* 2. Bento Grid Showcase */}
        <BentoGridShowcase />

        {/* 3. Flash Sale */}
        <FlashSale />

        {/* 4. Trending Tabs */}
        <TrendingTabs />

        {/* 5. Trust Badges */}
        <TrustBadges />

        {/* 6. Recently Viewed / Personalized */}
        <RecentlyViewed />

        {/* Newsletter Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="relative rounded-[3rem] bg-black overflow-hidden p-12 md:p-24 text-center space-y-8 shadow-2xl">
              <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 space-y-4"
              >
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                  Đừng bỏ lỡ <br />
                  <span className="text-primary italic">Siêu phẩm</span> tiếp
                  theo
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto font-medium italic">
                  Đăng ký nhận tin để trở thành người đầu tiên sở hữu những
                  thiết bị công nghệ giới hạn và nhận ưu đãi đặc quyền.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white outline-none focus:ring-2 ring-primary/50 transition-all font-medium"
                />
                <button className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Đăng ký ngay
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic">
            © 2026 Atomecom Boutique. Built with Premium Standards.
          </p>
        </div>
      </footer>
    </div>
  );
}
