'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function BentoGridShowcase() {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
        {/* Large Feature - Product Story */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 md:row-span-2 relative rounded-[3rem] bg-zinc-900 overflow-hidden group border border-white/5"
        >
          <Image
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
            alt="Feature Product"
            fill
            className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

          <div className="absolute bottom-12 left-12 right-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Sáng tạo vượt giới hạn
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              Quantum <br /> Audio Pro
            </h2>
            <p className="text-zinc-400 font-medium max-w-sm">
              Trải nghiệm âm thanh không gian thuần khiết nhất với công nghệ khử
              tiếng ồn chủ động thế hệ 5.
            </p>
            <Button className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 px-8 shadow-xl shadow-primary/20">
              Khám phá ngay
            </Button>
          </div>
        </motion.div>

        {/* Medium Top - Lifestyle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 relative rounded-[2.5rem] bg-primary/5 border border-primary/10 overflow-hidden p-10 flex flex-col justify-end"
        >
          <div className="absolute top-10 right-10 w-48 h-48 bg-primary/10 blur-[60px] rounded-full animate-pulse" />
          <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-tight">
            Phong cách <br /> Thượng lưu
          </h3>
          <p className="text-muted-foreground font-medium mt-2 max-w-[200px]">
            Hòa quyện giữa công nghệ và vẻ đẹp cổ điển.
          </p>
          <Image
            src="/luxury_watch_product_1771597650327.png"
            alt="Watch"
            width={200}
            height={200}
            className="absolute -top-4 -right-4 drop-shadow-2xl translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"
          />
        </motion.div>

        {/* Bottom Left - Deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-indigo-600 overflow-hidden group p-8 flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-20" />
          <p className="text-white/70 font-black uppercase text-[10px] tracking-widest italic">
            Ưu đãi tuần này
          </p>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white italic">-40%</p>
            <p className="text-xs font-bold text-white/90">
              Dành cho phụ kiện Titan
            </p>
          </div>
          <Button
            variant="link"
            className="text-white p-0 h-auto justify-start font-bold uppercase text-[10px] tracking-widest gap-2 group"
          >
            Mua ngay{' '}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Bottom Right - New Arrivals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-muted overflow-hidden group p-8 border border-border/50"
        >
          <div className="h-full flex flex-col justify-between">
            <h4 className="text-lg font-black tracking-tighter uppercase italic leading-none">
              Hàng mới <br /> về kho
            </h4>
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-zinc-200 overflow-hidden"
                >
                  <Image
                    src={`https://i.pravatar.cc/100?u=${i}`}
                    alt="user"
                    width={40}
                    height={40}
                  />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] text-white font-black">
                +12
              </div>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              12 người vừa đặt mua
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
